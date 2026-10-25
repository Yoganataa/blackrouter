import http from 'node:http';
import type { ServerResponse } from 'node:http';
import https from 'node:https';
import type { Socket } from 'node:net';
import { pipeline } from 'node:stream';
import tls from 'node:tls';

import type { ProxyPool, RouterConfig, RouterModel } from '../contract.ts';
import { upstreamError } from './errors.ts';
import { resolveModelMetadata } from './model-metadata.ts';
import { aggregateStream } from './sse.ts';
import { freeTierHeaders, type PreparedChat } from './zen.ts';

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

export const isMuseSparkModel = (id: string): boolean => /^muse[-_]?spark(?:$|[-_:.\s])/i.test(id);
export const isUnionAlphaModel = (id: string): boolean => /^union[-_]?alpha(?:$|[-_:.\s])/i.test(id);

export const resolveOpencodePath = (call: 'models' | 'chat', modelId?: string): string => {
  if (call === 'models') return '/zen/v1/models';
  const clean = (modelId || '').replace(/\([^()]+\)\s*$/, '').trim().toLowerCase();
  const base = clean.includes('/') ? clean.split('/').pop()! : clean;
  if (isMuseSparkModel(base)) return '/inference/v1/responses';
  if (isUnionAlphaModel(base)) return '/inference/v1/messages';
  return '/inference/v1/chat/completions';
};

/**
 * Where one API call goes.
 *
 * Direct: the call is relative to the configured API base.
 * Standard forward proxy (type 'http'): calls target upstream directly through a CONNECT tunnel agent.
 * Relay proxy pool (cloudflare, vercel, deno, netlify): forwards to relay URL with x-relay-target/path.
 */
export const buildTarget = (
  config: Pick<RouterConfig, 'upstream' | 'proxyPools'>,
  call: 'models' | 'chat',
  poolOverride?: ProxyPool | null,
  modelId?: string,
): UpstreamRequest => {
  const activePool =
    poolOverride !== undefined
      ? poolOverride
      : (config.proxyPools || []).find((p) => p.isActive && p.proxyUrl.trim()) ?? null;

  const parsed = new URL(config.upstream);
  const isOpenCode = parsed.hostname.toLowerCase().includes('opencode.ai');

  let targetOrigin: string;
  let targetPath: string;

  if (isOpenCode) {
    targetOrigin = 'https://opencode.ai';
    targetPath = resolveOpencodePath(call, modelId);
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
        headers: {},
        agent: createTunnelAgent(activePool.proxyUrl),
      };
    }
    return {
      url: new URL(activePool.proxyUrl),
      headers: {
        'x-relay-target': targetOrigin,
        'x-relay-path': targetPath,
      },
    };
  }
  return { url: upstreamUrl, headers: {} };
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
  config: Pick<RouterConfig, 'upstream' | 'proxyPools'>,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ids: string[]; free: string[]; rawEntries: Array<Record<string, unknown>> }> => {
  const target = buildTarget(config, 'models');
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
              'user-agent': 'opencode/latest/2.0.26/cli',
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
          'user-agent': 'opencode/latest/2.0.26/cli',
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
  return { ids, free: freeModelIds(ids), rawEntries };
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

export const writeJson = (response: ServerResponse, status: number, body: unknown): void => {
  if (response.headersSent) {
    response.destroy();
    return;
  }
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
};

export const writeOpenAiError = (
  response: ServerResponse,
  status: number,
  message: string,
  code: string,
): void => {
  writeJson(response, status, { error: { message, type: 'invalid_request_error', code } });
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
  config: Pick<RouterConfig, 'upstream' | 'proxyPools'>,
  session: string,
  prepared: PreparedChat,
  response: ServerResponse,
  pool?: ProxyPool | null,
  onRateLimit?: (pool: ProxyPool) => void,
): void => {
  const target = buildTarget(config, 'chat', pool, prepared.model);
  const transport = target.url.protocol === 'http:' ? http : https;
  const upstream = transport.request(
    target.url,
    {
      method: 'POST',
      agent: target.agent,
      headers: {
        ...target.headers,
        ...freeTierHeaders(session),
        'content-type': 'application/json',
        accept: 'text/event-stream',
        'content-length': String(Buffer.byteLength(prepared.body)),
      },
    },
    (answer) => {
      const status = answer.statusCode ?? 502;
      if (status === 429 && pool && onRateLimit) {
        onRateLimit(pool);
      }
      if (prepared.stream || status !== 200) {
        response.writeHead(status, responseHeaders(answer.headers));
        pipeline(answer, response, () => {
          // Either side ending is the end of this exchange; nothing is retried.
        });
        return;
      }

      const chunks: Buffer[] = [];
      let size = 0;
      answer.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size <= AGGREGATE_LIMIT_BYTES) chunks.push(chunk);
      });
      answer.on('end', () => {
        writeJson(response, status, aggregateStream(Buffer.concat(chunks).toString('utf8')));
      });
      answer.on('error', (error) => {
        writeOpenAiError(response, 502, `The upstream stream broke: ${error.message}`, 'upstream_unreachable');
      });
    },
  );

  upstream.on('error', (error) => {
    writeOpenAiError(
      response,
      502,
      `The upstream did not answer: ${error.message}`,
      'upstream_unreachable',
    );
  });

  response.on('close', () => {
    if (!response.writableEnded) upstream.destroy();
  });

  upstream.end(prepared.body);
};
