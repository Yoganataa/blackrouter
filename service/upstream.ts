import http from 'node:http';
import type { ServerResponse } from 'node:http';
import https from 'node:https';
import type { Socket } from 'node:net';
import { pipeline, Readable, Transform } from 'node:stream';
import tls from 'node:tls';

import type { ProxyPool, RouterConfig, RouterModel } from '../contract.ts';
import { upstreamError } from './errors.ts';
import { resolveModelMetadata } from './model-metadata.ts';
import { aggregateStream } from './sse.ts';
import { createOpenCodeResponseTransform, createToolNameRestoreTransform, type OpenCodeLane } from './opencode-protocol.ts';
import type { PreparedChat } from './zen.ts';
// @ts-ignore - the selected provider core is copied from upstream JavaScript.
import { prepareProviderRequest } from './core/provider-adapter.js';
import { resolveModelCandidates, shouldAdvanceAfterStatus } from './model-fallback.ts';
import { parseRetryAfterMs } from './retry-after.ts';
import { createUsageObserver, extractTokenUsage, type TokenUsage } from './usage-observer.ts';

/**
 * Talking to the OpenCode Zen free pool, directly or through a relay/proxy pool.
 *
 * The free pool is called with OpenCode's own client identity, which is what
 * makes it answer at all; see `zen.ts`. The router holds no provider
 * credential. When a relay proxy pool is active, requests route through the relay with
 * x-relay-target and x-relay-path headers. When a standard HTTP forward proxy is active,
 * requests tunnel through via HTTP CONNECT.
 */

export type UpstreamRequest = {
  url: URL;
  headers: Record<string, string>;
  agent?: http.Agent | https.Agent;
};


class TunnelAgent extends https.Agent {
  private proxyUrl: URL;

  constructor(proxyUrlString: string) {
    super({ keepAlive: true });
    this.proxyUrl = new URL(proxyUrlString);
  }

  override createConnection(
    options: { host?: string; port?: number },
    callback?: (err: Error | null, socket: Socket) => void,
  ): Socket {
    const proxyPort = Number(this.proxyUrl.port) || (this.proxyUrl.protocol === 'https:' ? 443 : 80);
    const proxyHost = this.proxyUrl.hostname;
    const targetHost = options.host || 'opencode.ai';
    const targetPort = options.port || 443;

    const connectHeaders: Record<string, string> = {
      Host: `${targetHost}:${targetPort}`,
      'User-Agent': 'BlackRouter',
    };
    if (this.proxyUrl.username || this.proxyUrl.password) {
      connectHeaders['Proxy-Authorization'] = `Basic ${Buffer.from(
        `${decodeURIComponent(this.proxyUrl.username)}:${decodeURIComponent(this.proxyUrl.password)}`,
      ).toString('base64')}`;
    }

    const proxyTransport = this.proxyUrl.protocol === 'https:' ? https : http;
    const connectReq = proxyTransport.request({
      host: proxyHost,
      port: proxyPort,
      method: 'CONNECT',
      path: `${targetHost}:${targetPort}`,
      headers: connectHeaders,
    });

    connectReq.on('connect', (res, socket: Socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        callback?.(
          new Error(`Proxy CONNECT to ${targetHost}:${targetPort} failed with HTTP ${res.statusCode}`),
          socket,
        );
        return;
      }

      const tlsSocket = tls.connect(
        {
          socket,
          servername: targetHost,
        },
        () => {
          callback?.(null, tlsSocket);
        },
      );

      tlsSocket.on('error', (err: Error) => {
        socket.destroy();
        callback?.(err, socket);
      });
    });

    connectReq.on('error', (err: Error) => {
      callback?.(err, null as unknown as Socket);
    });

    connectReq.end();
    return null as unknown as Socket;
  }
}

/**
 * Creates an HTTPS Agent that establishes a CONNECT tunnel through an HTTP/HTTPS forward proxy.
 */
export const createTunnelAgent = (proxyUrlString: string): https.Agent => new TunnelAgent(proxyUrlString);

export const isOpenCodeUpstream = (upstream: string): boolean => {
  try {
    const hostname = new URL(upstream).hostname.toLowerCase();
    return hostname === 'opencode.ai' || hostname.endsWith('.opencode.ai');
  } catch {
    return false;
  }
};

/** Keep credentials scoped to the origin where the user configured them. */
/**
 * OpenCode's flagged-egress error is eligible for a retry only when a proxy
 * pool was used. Never make this condition imply an automatic direct-egress retry.
 */
export const isOpenCodeFreeTierGateResponse = (
  status: number,
  body: string,
  isOpenCode: boolean,
  usedProxyPool: boolean,
): boolean =>
  status === 403 && isOpenCode && usedProxyPool && body.includes('FreeTierError');

export const hasSameUpstreamOrigin = (left: string, right: string): boolean => {
  try {
    return new URL(left).origin === new URL(right).origin;
  } catch {
    return left === right;
  }
};

export const buildTarget = (
  config: Pick<RouterConfig, 'upstream' | 'upstreamApiKey' | 'proxyPools'>,
  call: 'models' | 'chat',
  poolOverride?: ProxyPool | null,
  nativeUrl?: URL,
): UpstreamRequest => {
  const activePool =
    poolOverride !== undefined
      ? poolOverride
      : (config.proxyPools || []).find((p) => p.isActive && p.proxyUrl.trim()) ?? null;

  const parsed = new URL(config.upstream);
  const isOpenCode = isOpenCodeUpstream(config.upstream);
  const upstreamAuthHeaders: Record<string, string> =
    !isOpenCode && config.upstreamApiKey?.trim()
      ? { authorization: `Bearer ${config.upstreamApiKey.trim()}` }
      : {};

  let targetOrigin: string;
  let targetPath: string;

  if (isOpenCode) {
    targetOrigin = nativeUrl?.origin ?? 'https://opencode.ai';
    if (call === 'models') {
      targetPath = '/zen/v1/models';
    } else if (nativeUrl) {
      targetPath = nativeUrl.pathname + nativeUrl.search;
    } else {
      throw new Error('The native provider core must resolve the OpenCode request URL before transport.');
    }
  } else {
    targetOrigin = `${parsed.protocol}//${parsed.host}`;
    const basePath = parsed.pathname.replace(/\/+$/, '');
    const suffix = call === 'models' ? 'models' : 'chat/completions';
    targetPath = `${basePath}/${suffix}`;
  }

  const upstreamUrl = new URL(targetPath, targetOrigin);

  if (activePool) {
    if (activePool.type === 'http') {
      return {
        url: upstreamUrl,
        headers: upstreamAuthHeaders,
        agent: createTunnelAgent(activePool.proxyUrl),
      };
    }
    return {
      url: new URL(activePool.proxyUrl),
      headers: {
        ...upstreamAuthHeaders,
        'x-relay-target': targetOrigin,
        'x-relay-path': targetPath,
      },
    };
  }
  return { url: upstreamUrl, headers: upstreamAuthHeaders };
};

export const KNOWN_FREE_MODELS = new Set([
  'big-pickle',
  'union-alpha',
  'space-bunny',
  'longcat-2.0',
]);

/** OpenCode Zen marks free models with a `-free` or `:free` suffix, or by known catalog id. */
export const isFreeModel = (id: string): boolean => {
  const clean = id.trim().toLowerCase();
  const base = clean.includes('/') ? clean.split('/').pop()! : clean;
  return /-free$/i.test(base) || /:free$/i.test(base) || KNOWN_FREE_MODELS.has(base);
};

/** The free part of an upstream model list, in the order the upstream gave it. */
export const freeModelIds = (ids: readonly string[]): string[] =>
  ids.map((id) => id.trim()).filter((id) => id.length > 0 && isFreeModel(id));

const BRANDS: Record<string, string> = {
  ai: 'AI',
  api: 'API',
  deepseek: 'DeepSeek',
  glm: 'GLM',
  gpt: 'GPT',
  llm: 'LLM',
  mimo: 'MiMo',
  opencode: 'OpenCode',
  qwen: 'Qwen',
  vl: 'VL',
};

/** `deepseek-v4.1-flash-free` reads as `DeepSeek V4.1 Flash` in a model picker. */
export const humanizeModelId = (id: string): string =>
  id
    .split('-')
    .filter((part) => part.length > 0 && part.toLowerCase() !== 'free')
    .map((part) => {
      const brand = BRANDS[part.toLowerCase()];
      if (brand) return brand;
      if (/^v\d/i.test(part)) return `V${part.slice(1)}`;
      if (/^\d/.test(part)) return part;
      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(' ')
    .trim();

export const toModels = (
  ids: readonly string[],
  rawEntries?: ReadonlyArray<Record<string, unknown>>,
): RouterModel[] =>
  ids.map((id) => {
    const raw = rawEntries?.find((e) => e && e.id === id);
    const meta = resolveModelMetadata(id, raw);
    return {
      id,
      name: (raw && typeof raw.name === 'string' && raw.name.trim()) || humanizeModelId(id) || id,
      limit: meta.limit,
      capabilities: meta.capabilities,
      variants: meta.variants,
    };
  });

type ModelsAnswer = { data?: Array<Record<string, unknown>> };

/**
 * Fetch the upstream catalog. A relay or an offline machine answers with an
 * error the panel can show; it never turns into an empty successful list.
 */
export const fetchModelIds = async (
  config: Pick<RouterConfig, 'upstream' | 'upstreamApiKey' | 'proxyPools'>,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ids: string[]; free: string[]; rawEntries: Array<Record<string, unknown>> }> => {
  const target = buildTarget(config, 'models');
  const isOpenCode = isOpenCodeUpstream(config.upstream);
  const upstreamUserAgent = isOpenCode ? 'opencode/latest/2.1.4/cli' : 'BlackRouter/1.0';
  let payload: ModelsAnswer;

  if (target.agent && fetchImpl === fetch) {
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const transport = target.url.protocol === 'http:' ? http : https;
        const req = transport.request(
          target.url,
          {
            method: 'GET',
            agent: target.agent,
            headers: {
              accept: 'application/json',
              ...target.headers,
              'user-agent': upstreamUserAgent,
            },
          },
          (res) => {
            if (res.statusCode !== 200) {
              let errBody = '';
              res.on('data', (d) => {
                errBody += d;
              });
              res.on('end', () => {
                reject(
                  upstreamError(
                    `The model list answered ${res.statusCode}${errBody ? `: ${errBody.slice(0, 200)}` : '.'}`,
                  ),
                );
              });
              return;
            }
            const chunks: Buffer[] = [];
            res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          },
        );
        req.on('error', (err) =>
          reject(upstreamError(`Could not reach the model list at ${target.url.origin}. ${err.message}`)),
        );
        req.setTimeout(12_000, () => {
          req.destroy();
          reject(upstreamError('The model list request timed out.'));
        });
        req.end();
      });
      payload = JSON.parse(data) as ModelsAnswer;
    } catch (error) {
      if (error instanceof Error && error.message.includes('upstream')) throw error;
      throw upstreamError(`The model list error: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    let answer: Response;
    try {
      answer = await fetchImpl(target.url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          ...target.headers,
          'user-agent': upstreamUserAgent,
        },
        signal: AbortSignal.timeout(12_000),
      });
    } catch (error) {
      throw upstreamError(
        `Could not reach the model list at ${target.url.origin}. ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (answer.status !== 200) {
      const detail = await answer.text().catch(() => '');
      throw upstreamError(
        `The model list answered ${answer.status}${detail ? `: ${detail.slice(0, 200)}` : '.'}`,
      );
    }

    try {
      payload = (await answer.json()) as ModelsAnswer;
    } catch {
      throw upstreamError('The model list was not JSON. A relay may be answering with its own page.');
    }
  }

  const rawEntries = Array.isArray(payload.data) ? payload.data : [];
  const ids = rawEntries
    .map((entry) => (entry && typeof entry.id === 'string' ? entry.id.trim() : ''))
    .filter((id) => id.length > 0);
  if (ids.length === 0) {
    throw upstreamError('The model list was empty. Check the proxy pool URL and status.');
  }
  // OpenCode Zen exposes a mixed catalog; other compatible APIs expose the
  // models they are configured to serve, without OpenCode-specific free suffixes.
  return { ids, free: isOpenCode ? freeModelIds(ids) : ids, rawEntries };
};

const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'content-encoding',
  'cache-control',
  'retry-after',
  'x-request-id',
  'openai-processing-ms',
  'openai-version',
];

const responseHeaders = (headers: http.IncomingHttpHeaders): Record<string, string> => {
  const picked: Record<string, string> = {};
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = headers[name];
    if (typeof value === 'string') picked[name] = value;
  }
  if (!picked['content-type']) picked['content-type'] = 'application/json';
  return picked;
};

/**
 * Keep SSE clients alive while the upstream has sent headers but is still
 * waiting for its first data frame. Mirrors official 9Router PR #5167 using
 * BlackRouter's Node stream pipeline. The timer stops at the first data byte.
 */
export const createSseFirstByteKeepAlive = (keepAliveMs = Number(process.env.SSE_KEEPALIVE_MS ?? 15_000)) => {
  let timer: ReturnType<typeof setInterval> | null = null;
  let seenData = false;
  const stream = new Transform({
    transform(chunk: Buffer | string, _encoding: BufferEncoding, callback: (error?: Error | null, data?: Buffer | string) => void) {
      seenData = true;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      callback(null, chunk);
    },
    flush(callback: (error?: Error | null) => void) {
      if (timer) clearInterval(timer);
      timer = null;
      callback();
    },
  });
  stream.once('pipe', () => {
    if (!Number.isFinite(keepAliveMs) || keepAliveMs <= 0 || seenData) return;
    timer = setInterval(() => {
      if (!seenData && !stream.destroyed && !stream.writableEnded) {
        stream.push(Buffer.from(': ping\n\n'));
      }
    }, keepAliveMs);
    timer.unref?.();
  });
  stream.once('close', () => {
    if (timer) clearInterval(timer);
    timer = null;
  });
  return stream;
};

export const writeJson = (
  response: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): void => {
  if (response.headersSent) {
    response.destroy();
    return;
  }
  response.writeHead(status, { 'content-type': 'application/json', ...headers });
  response.end(JSON.stringify(body));
};

export const writeOpenAiError = (
  response: ServerResponse,
  status: number,
  message: string,
  code: string,
  headers: Record<string, string> = {},
): void => {
  writeJson(response, status, { error: { message, type: 'invalid_request_error', code } }, headers);
};

/** A folded stream stays in memory; this is far more than one answer needs. */
const AGGREGATE_LIMIT_BYTES = 8 * 1024 * 1024;

/**
 * Send one chat completion upstream and stream the answer back.
 *
 * A completion can be a long SSE stream, so the body is piped rather than
 * buffered. The client's own bearer is dropped here: it belongs to this
 * router, not to the upstream, which is called as OpenCode. A client that did
 * not ask for a stream gets the stream folded back into one JSON answer.
 */
export const proxyChatCompletion = (
  config: Pick<RouterConfig, 'upstream' | 'upstreamApiKey' | 'proxyPools' | 'fallbackModels' | 'modelCombos'>,
  session: string,
  prepared: PreparedChat,
  response: ServerResponse,
  pool?: ProxyPool | null,
  onRateLimit?: (pool: ProxyPool | null, retryAfter?: string) => void,
  onUsage?: (usage: TokenUsage) => void,
): void => {
  const modelCandidates = resolveModelCandidates(prepared.model, config.fallbackModels ?? [], config.modelCombos ?? []);
  const activePools = (config.proxyPools || []).filter((p) => p.isActive && p.proxyUrl.trim());
  const now = Date.now();
  const healthyPools = activePools.filter((p) => !p.rateLimitedUntil || p.rateLimitedUntil <= now);
  const initialPool = pool ?? null;
  const poolCandidates: Array<ProxyPool | null> = initialPool
    ? [initialPool, ...healthyPools.filter((p) => p.id !== initialPool.id)].slice(0, 2)
    : activePools.length === 0
      ? [null]
      : healthyPools.slice(0, 2);

  if (activePools.length > 0 && poolCandidates.length === 0) {
    const nextAvailableAt = Math.min(...activePools.map((p) =>
      p.rateLimitedUntil && p.rateLimitedUntil > now ? p.rateLimitedUntil : now + 5 * 60_000,
    ));
    const retryAfter = Math.max(1, Math.ceil((nextAvailableAt - now) / 1000));
    writeOpenAiError(
      response,
      429,
      'All configured proxy pools are cooling down. Wait before retrying the upstream.',
      'rate_limit_exhausted',
      { 'retry-after': String(retryAfter) },
    );
    return;
  }

  type Attempt = { model: string; pool: ProxyPool | null };
  const attempts: Attempt[] = modelCandidates.flatMap((model) =>
    poolCandidates.map((candidatePool) => ({ model, pool: candidatePool })),
  );
  let attemptIndex = 0;
  let lastRequestedModel = prepared.model;
  const fallbackReasons: string[] = [];
  const rateLimitedPoolIds = new Set<string>();
  const failedPoolIds = new Set<string>();

  // An HTTP 429 cools down a whole pool in the runtime. Do not revisit that
  // pool later in this request just because the next model candidate is tried.
  // A direct request (pool === null) may still try another model because its
  // rate limit can be model-specific.
  const advanceToNextAttempt = (): boolean => {
    let nextIndex = attemptIndex + 1;
    while (nextIndex < attempts.length) {
      const nextAttempt = attempts[nextIndex];
      if (nextAttempt?.pool && (rateLimitedPoolIds.has(nextAttempt.pool.id) || failedPoolIds.has(nextAttempt.pool.id))) {
        nextIndex += 1;
        continue;
      }
      break;
    }
    if (nextIndex >= attempts.length) return false;
    attemptIndex = nextIndex;
    return true;
  };

  const routingHeaders = (attempt: Attempt): Record<string, string> => ({
    'x-blackrouter-requested-model': prepared.model,
    'x-blackrouter-resolved-model': attempt.model,
    'x-blackrouter-resolved-pool': attempt.pool?.name ?? 'Direct',
    ...(attempt.model !== prepared.model ? { 'x-blackrouter-fallback-used': 'true' } : {}),
    ...(fallbackReasons.length > 0 ? { 'x-blackrouter-fallback-reason': fallbackReasons.join(' -> ') } : {}),
  });

  const modelAwareBody = async (model: string): Promise<{
    lane: OpenCodeLane;
    body: string;
    headers?: Record<string, string>;
    url?: URL;
    toolNameMap?: Map<string, string> | null;
    directFetch?: (url: URL, options: RequestInit) => Promise<Response>;
  }> => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(prepared.body);
    } catch {
      throw new Error('Prepared request body was not valid JSON.');
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Prepared request body must be a JSON object.');
    }
    const body = parsed as Record<string, unknown>;
    body.model = model;

    if (!isOpenCodeUpstream(config.upstream)) {
      return { lane: 'chat', body: JSON.stringify(body) };
    }

    // Use the upstream provider executor for model routing, native request
    // translation, request identity, body normalization, and headers.
    const native = await prepareProviderRequest({ model, body, session });
    return {
      lane: native.lane as OpenCodeLane,
      body: native.body as string,
      headers: native.headers as Record<string, string>,
      url: native.url as URL,
      toolNameMap: native.toolNameMap as Map<string, string> | null,
      directFetch: native.directFetch as ((url: URL, options: RequestInit) => Promise<Response>) | undefined,
    };
  };

  const sendAttempt = async (): Promise<void> => {
    if (response.destroyed || response.writableEnded) return;
    const attempt = attempts[attemptIndex];
    if (!attempt) {
      writeOpenAiError(
        response,
        502,
        'No model fallback attempt was available.',
        'fallback_exhausted',
      );
      return;
    }

    lastRequestedModel = attempt.model;
    const candidate = attempt.pool;
    let lane: OpenCodeLane;
    let upstreamBody: string;
    let nativeHeaders: Record<string, string> = {};
    let nativeUrl: URL | undefined;
    let nativeToolNameMap: Map<string, string> | null = null;
    let nativeDirectFetch: ((url: URL, options: RequestInit) => Promise<Response>) | undefined;
    try {
      const preparedForModel = await modelAwareBody(attempt.model);
      lane = preparedForModel.lane;
      upstreamBody = preparedForModel.body;
      nativeHeaders = preparedForModel.headers ?? {};
      nativeUrl = preparedForModel.url;
      nativeToolNameMap = preparedForModel.toolNameMap ?? null;
      nativeDirectFetch = preparedForModel.directFetch;
    } catch (error) {
      writeOpenAiError(
        response,
        400,
        error instanceof Error ? error.message : 'Could not prepare the native provider request.',
        'invalid_request',
      );
      return;
    }

    const requestHeaders = { ...(isOpenCodeUpstream(config.upstream) ? nativeHeaders : {}), ...target.headers, 'content-type': 'application/json', accept: 'text/event-stream', 'content-length': String(Buffer.byteLength(upstreamBody)) };
    const transport = target.url.protocol === 'http:' ? http : https;
    const usesNativeDirectTransport = candidate === null && isOpenCodeUpstream(config.upstream) && typeof nativeDirectFetch === 'function';
    const handleAnswer = (answer: http.IncomingMessage): void => {
        const status = answer.statusCode ?? 502;
        const retryAfterHeader = answer.headers['retry-after'];
        const retryAfter = typeof retryAfterHeader === 'string' ? retryAfterHeader : undefined;
        const isShortDirect429 = status === 429 &&
          candidate === null &&
          retryAfter !== undefined &&
          parseRetryAfterMs(retryAfter) <= 2_000;

        // A pool can return HTTP 403 with a successful transport when its
        // egress is rejected by OpenCode's free-tier gate. Retry only through
        // another already-configured pool; do not bypass the chosen egress.
        if (status === 403 && candidate && isOpenCodeUpstream(config.upstream)) {
          const maxInspectableErrorBytes = 256 * 1024;
          const chunks: Buffer[] = [];
          let inspectedBytes = 0;
          let inspecting = true;
          answer.on('data', (raw: Buffer | string) => {
            const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
            if (!inspecting) {
              if (!response.destroyed && !response.writableEnded) response.write(chunk);
              return;
            }
            chunks.push(chunk);
            inspectedBytes += chunk.length;
            if (inspectedBytes > maxInspectableErrorBytes) {
              inspecting = false;
              const routeHeaders = routingHeaders(attempt);
              response.writeHead(status, {
                ...responseHeaders(answer.headers),
                ...routeHeaders,
              });
              for (const buffered of chunks) response.write(buffered);
              chunks.length = 0;
            }
          });
          answer.on('end', () => {
            if (!inspecting) {
              if (!response.destroyed && !response.writableEnded) response.end();
              return;
            }
            const bodyBuffer = Buffer.concat(chunks);
            const bodyText = bodyBuffer.toString('utf8');
            if (isOpenCodeFreeTierGateResponse(status, bodyText, true, true)) {
              failedPoolIds.add(candidate.id);
              if (advanceToNextAttempt()) {
                fallbackReasons.push(`HTTP 403 FreeTierError on proxy pool ${candidate.name}`);
                sendAttempt();
                return;
              }
            }
            const routeHeaders = routingHeaders(attempt);
            response.writeHead(status, {
              ...responseHeaders(answer.headers),
              ...routeHeaders,
            });
            response.end(bodyBuffer);
          });
          answer.on('error', (error: Error) => {
            if (!response.headersSent) {
              writeOpenAiError(response, 502, `Could not read the upstream error response: ${error.message}`, 'upstream_unreachable');
            } else {
              response.destroy(error);
            }
          });
          return;
        }

        if (status === 429) {
          if (candidate) rateLimitedPoolIds.add(candidate.id);
          onRateLimit?.(candidate, retryAfter);
        }

        // A direct 429 usually means the shared free pool is out of quota. Only
        // try another model when the upstream explicitly asks for a very short
        // wait, and honour that wait instead of immediately producing another 429.
        // A pool-specific 429 may fail over to another healthy pool.
        if (shouldAdvanceAfterStatus(status, candidate !== null, isShortDirect429)) {
          if (advanceToNextAttempt()) {
            fallbackReasons.push(`HTTP ${status} on ${attempt.model}`);
            answer.resume();
            if (isShortDirect429) {
              const waitMs = parseRetryAfterMs(retryAfter);
              const jitterMs = 100 + Math.floor(Math.random() * 301);
              setTimeout(() => {
                if (!response.destroyed && !response.writableEnded) sendAttempt();
              }, waitMs + jitterMs);
            } else {
              sendAttempt();
            }
            return;
          }
        }

        const routeHeaders = routingHeaders(attempt);
        for (const [name, value] of Object.entries(routeHeaders)) response.setHeader(name, value);

        if (status < 200 || status >= 300) {
          response.writeHead(status, {
            ...responseHeaders(answer.headers),
            ...routeHeaders,
          });
          pipeline(answer, response, () => {});
          return;
        }

        const contentType = typeof answer.headers['content-type'] === 'string'
          ? answer.headers['content-type'].toLowerCase()
          : '';
        const protocolTransform = contentType.includes('text/event-stream')
          ? lane === 'chat'
            ? createToolNameRestoreTransform(nativeToolNameMap)
            : createOpenCodeResponseTransform(lane, attempt.model, nativeToolNameMap)
          : null;
        const successHeaders = {
          ...responseHeaders(answer.headers),
          ...routeHeaders,
        };

        if (prepared.stream) {
          response.writeHead(status, successHeaders);
          const observer = createUsageObserver((usage) => onUsage?.(usage));
          const keepAliveMs = Number(process.env.SSE_KEEPALIVE_MS ?? 15_000);
          const keepAlive = contentType.includes('text/event-stream') &&
            Number.isFinite(keepAliveMs) && keepAliveMs > 0
            ? createSseFirstByteKeepAlive(keepAliveMs)
            : null;
          if (protocolTransform && keepAlive) {
            pipeline(answer, protocolTransform, observer, keepAlive, response, () => {});
          } else if (protocolTransform) {
            pipeline(answer, protocolTransform, observer, response, () => {});
          } else if (keepAlive) {
            pipeline(answer, observer, keepAlive, response, () => {});
          } else {
            pipeline(answer, observer, response, () => {});
          }
          return;
        }

        const chunks: Buffer[] = [];
        let size = 0;
        const collect = (chunk: Buffer | string): void => {
          const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += value.length;
          if (size <= AGGREGATE_LIMIT_BYTES) chunks.push(value);
        };
        const source = protocolTransform ?? answer;
        source.on('data', collect);
        source.on('end', () => {
          const completion = aggregateStream(Buffer.concat(chunks).toString('utf8'));
          const usage = extractTokenUsage(completion);
          if (usage) onUsage?.(usage);
          writeJson(response, status, completion, successHeaders);
        });
        source.on('error', (error) => {
          writeOpenAiError(response, 502, `The upstream stream broke: ${error.message}`, 'upstream_unreachable');
        });
        answer.on('error', (error) => {
          writeOpenAiError(response, 502, `The upstream stream broke: ${error.message}`, 'upstream_unreachable');
        });
        if (protocolTransform) answer.pipe(protocolTransform);
    };
    const handleTransportError = (error: Error): void => {
      if (!response.headersSent && !response.destroyed && advanceToNextAttempt()) { fallbackReasons.push(`network error on ${lastRequestedModel}`); sendAttempt(); return; }
      const routeHeaders = routingHeaders(attempt);
      for (const [name, value] of Object.entries(routeHeaders)) response.setHeader(name, value);
      writeOpenAiError(response, 502, `The upstream did not answer for ${lastRequestedModel}: ${error.message}`, 'upstream_unreachable', routeHeaders);
    };
    let upstream: ReturnType<typeof transport.request> | null = null;
    let directAbort: AbortController | null = null;
    if (usesNativeDirectTransport && nativeDirectFetch) {
      directAbort = new AbortController();
      void nativeDirectFetch(target.url, { method: 'POST', headers: requestHeaders, body: upstreamBody, signal: AbortSignal.any([directAbort.signal, AbortSignal.timeout(120_000)]) })
        .then((fetched) => {
          const body = fetched.body ? Readable.fromWeb(fetched.body as ReadableStream<Uint8Array>) : Readable.from([]);
          const wrapped = body as unknown as http.IncomingMessage;
          Object.defineProperty(wrapped, 'statusCode', { value: fetched.status });
          Object.defineProperty(wrapped, 'headers', { value: Object.fromEntries(fetched.headers.entries()) });
          handleAnswer(wrapped);
        })
        .catch((error: unknown) => handleTransportError(error instanceof Error ? error : new Error(String(error))));
    } else {
      upstream = transport.request(target.url, { method: 'POST', agent: target.agent, headers: requestHeaders }, handleAnswer);
      upstream.on('error', handleTransportError);
      upstream.end(upstreamBody);
    }
    response.on('close', () => {
      if (response.writableEnded) return;
      upstream?.destroy();
      directAbort?.abort(new Error('Downstream client disconnected.'));
    });
  };

  sendAttempt();
};
