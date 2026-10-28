import { timingSafeEqual } from 'node:crypto';
import http from 'node:http';
import type { ServerResponse } from 'node:http';

import type { ProxyPool, RequestEntry, RouterConfig, RouterModel } from '../contract.ts';
import { proxyChatCompletion, writeJson, writeOpenAiError } from './upstream.ts';
import { prepareChat, sessionId } from './zen.ts';
import type { TokenUsage } from './usage-observer.ts';

/**
 * The OpenAI-compatible listener OpenCode calls.
 *
 * It is a second listener, separate from the host proxy: OpenCode is a
 * different process and cannot send the host's service token, so this port
 * carries its own bearer key. Both listeners are bound to loopback only.
 */

/** A request body larger than this is not a chat completion this router should carry. */
const BODY_LIMIT_BYTES = 64 * 1024 * 1024;

export type RouterServerDeps = {
  getConfig(): RouterConfig;
  getModels(): RouterModel[];
  /** Ask the upstream for the catalog; rejects with a message the caller records. */
  refreshModels(): Promise<void>;
  record(entry: RequestEntry): void;
  pickPool?(): ProxyPool | null;
  getDirectRateLimitedUntil?(): number;
  markRateLimited?(pool: ProxyPool | null, retryAfter?: string): void;
};

export type RouterServer = { close(): Promise<void> };

const tokenMatches = (expected: string, provided: string): boolean => {
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
};

const resolveRequestSession = (request: http.IncomingMessage, fallback: string): string => {
  const headers = request.headers;
  const candidate =
    headers['x-opencode-session'] ||
    headers['x-opencode-session-id'] ||
    headers['x-session-id'] ||
    headers['x-session-affinity'];
  if (typeof candidate === 'string') {
    const trimmed = candidate.trim();
    if (trimmed.length > 0 && trimmed.length <= 256) return trimmed;
  }
  return fallback;
};

/** `Authorization: Bearer <key>` or `x-api-key: <key>`, whichever the client sends. */
const presentedKey = (request: http.IncomingMessage): string => {
  const header = request.headers['x-api-key'];
  if (typeof header === 'string' && header.trim()) return header.trim();
  const authorization = request.headers.authorization ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1]?.trim() ?? '';
};

const writeRateLimitedError = (response: ServerResponse, until: number, message: string): void => {
  const retrySeconds = Math.max(1, Math.ceil((until - Date.now()) / 1000));
  response.writeHead(429, {
    'content-type': 'application/json',
    'retry-after': String(retrySeconds),
  });
  response.end(JSON.stringify({
    error: {
      message,
      type: 'rate_limit_error',
      code: 'rate_limit_exhausted',
    },
  }));
};

const readBody = (request: http.IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    request.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > BODY_LIMIT_BYTES) {
        reject(new Error('The request body is too large.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });

export const startRouterServer = (deps: RouterServerDeps): Promise<RouterServer> =>
  new Promise((resolve, reject) => {
    /** One session for this process, like the CLI keeps one per conversation. */
    const session = sessionId();
    const server = http.createServer((request, response: ServerResponse) => {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1');
      const started = Date.now();

      if (request.method === 'OPTIONS') {
        response.writeHead(204, {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'authorization, content-type, x-api-key',
          'access-control-allow-methods': 'GET, POST, OPTIONS',
        });
        response.end();
        return;
      }

      if (url.pathname === '/healthz') {
        writeJson(response, 200, { ok: true, name: 'blackrouter' });
        return;
      }

      const config = deps.getConfig();
      if (!tokenMatches(config.apiKey, presentedKey(request))) {
        writeOpenAiError(response, 401, 'The BlackRouter API key is missing or wrong.', 'invalid_api_key');
        return;
      }

      if (request.method === 'GET' && (url.pathname === '/v1/models' || url.pathname === '/models')) {
        const answer = () => {
          const data = deps.getModels().map((model) => ({
            id: model.id,
            object: 'model',
            created: 0,
            owned_by: 'opencode',
          }));
          writeJson(response, 200, { object: 'list', data });
        };
        if (deps.getModels().length > 0) {
          answer();
          return;
        }
        void deps
          .refreshModels()
          .catch(() => undefined)
          .then(answer);
        return;
      }

      if (request.method === 'POST' && (url.pathname === '/v1/chat/completions' || url.pathname === '/chat/completions')) {
        void readBody(request)
          .then((body) => {
            const prepared = prepareChat(body, {
              rtkEnabled: config.rtkEnabled,
              cavemanLevel: config.cavemanLevel,
              ponytailLevel: config.ponytailLevel,
            });
            const pool = deps.pickPool ? deps.pickPool() : null;
            const tokenUsage: TokenUsage = {};
            response.on('close', () => {
              const resolvedModel = response.getHeader('x-blackrouter-resolved-model');
              const resolvedPool = response.getHeader('x-blackrouter-resolved-pool');
              const fallbackReason = response.getHeader('x-blackrouter-fallback-reason');
              const fallbackUsed = response.getHeader('x-blackrouter-fallback-used') === 'true';
              const status = response.statusCode;
              deps.record({
                at: started,
                method: 'POST',
                path: '/v1/chat/completions',
                model: typeof resolvedModel === 'string' ? resolvedModel : prepared.model,
                requestedModel: prepared.model,
                status,
                ms: Date.now() - started,
                poolName: typeof resolvedPool === 'string' ? resolvedPool : pool ? pool.name : 'Direct',
                fallbackUsed,
                ...(typeof fallbackReason === 'string' ? { fallbackReason } : {}),
                ...(tokenUsage.inputTokens !== undefined ? { inputTokens: tokenUsage.inputTokens } : {}),
                ...(tokenUsage.outputTokens !== undefined ? { outputTokens: tokenUsage.outputTokens } : {}),
                ...(tokenUsage.totalTokens !== undefined ? { totalTokens: tokenUsage.totalTokens } : {}),
                ...(typeof status === 'number' && status >= 400 ? { error: `HTTP ${status}` } : {}),
              });
            });

            const activePoolsExist = config.proxyPools.some((p) => p.isActive && p.proxyUrl.trim());
            if (!pool && !activePoolsExist) {
              const directCooldownUntil = deps.getDirectRateLimitedUntil?.() ?? 0;
              if (directCooldownUntil > Date.now()) {
                writeRateLimitedError(
                  response,
                  directCooldownUntil,
                  'The direct OpenCode upstream is in rate-limit cooldown.',
                );
                return;
              }
            }

            const reqSession = resolveRequestSession(request, session);
            proxyChatCompletion(config, reqSession, prepared, response, pool, (rateLimitedPool, retryAfter) => {
              if (deps.markRateLimited) {
                deps.markRateLimited(rateLimitedPool, retryAfter);
              } else if (rateLimitedPool) {
                rateLimitedPool.rateLimitedUntil = Date.now() + 5 * 60_000;
                rateLimitedPool.testStatus = 'error';
                rateLimitedPool.lastError = 'Rate limit (HTTP 429)';
                rateLimitedPool.lastTestedAt = Date.now();
              }
            }, (usage) => {
              Object.assign(tokenUsage, usage);
            });
          })
          .catch((error: unknown) => {
            writeOpenAiError(
              response,
              400,
              error instanceof Error ? error.message : 'The request body could not be read.',
              'invalid_request',
            );
          });
        return;
      }

      writeOpenAiError(response, 404, `BlackRouter has no route for ${request.method} ${url.pathname}.`, 'not_found');
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      reject(
        error.code === 'EADDRINUSE'
          ? new Error(`Port ${deps.getConfig().port} is already in use. Pick another port.`)
          : error,
      );
    });

    server.listen(deps.getConfig().port, '127.0.0.1', () => {
      resolve({
        close: () =>
          new Promise((done) => {
            server.close(() => done());
            server.closeAllConnections();
          }),
      });
    });
  });
