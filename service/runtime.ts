import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  endpointFor,
  type ConfigPatch,
  type CreateProxyPoolInput,
  type DeployCloudflareInput,
  type DeployDenoInput,
  type DeployNetlifyInput,
  type DeployVercelInput,
  type ProxyPool,
  type ProxyPoolType,
  type RelaySource,
  type RequestEntry,
  type RouterConfig,
  type RouterModel,
  type RouterState,
  type TestModelResult,
  type TestProxyPoolResult,
  type UpdateProxyPoolInput,
} from '../contract.ts';
import { createApiKey, createConfigStore, type ConfigStore } from './config.ts';
import {
  deployCloudflare as executeDeployCloudflare,
  deployDeno as executeDeployDeno,
  deployNetlify as executeDeployNetlify,
  deployVercel as executeDeployVercel,
  testRelayOrProxy,
} from './deployers.ts';
import { RouterError, badRequest } from './errors.ts';
import {
  readRegistration,
  registerProvider,
  removeProvider,
  resolveConfigFile,
  buildProviderEntry,
  PROVIDER_ID,
} from './opencode-config.ts';
import { buildComboRouterModels } from './model-fallback.ts';
import { createPoolSelector } from './pool-selector.ts';
import { createRequestHistoryStore, REQUEST_HISTORY_LIMIT } from './request-history.ts';
import { parseRetryAfterMs } from './retry-after.ts';
import { startRouterServer, type RouterServer } from './router-server.ts';
import { aggregateStream } from './sse.ts';
import { createOpenCodeResponseTransform, createToolNameRestoreTransform, type OpenCodeLane } from './opencode-protocol.ts';
import { buildTarget, fetchModelIds, hasSameUpstreamOrigin, isOpenCodeUpstream, toModels } from './upstream.ts';
import { prepareChat, sessionId } from './zen.ts';
// @ts-ignore - the selected provider core is copied from upstream JavaScript.
import { prepareProviderRequest } from './core/provider-adapter.js';


const normalizeTestSse = (
  raw: string,
  lane: OpenCodeLane | undefined,
  model: string,
  toolNameMap?: Map<string, string> | null,
): Promise<string> => {
  if (!lane) return Promise.resolve(raw);
  const transform = lane === 'chat'
    ? createToolNameRestoreTransform(toolNameMap)
    : createOpenCodeResponseTransform(lane, model, toolNameMap);
  if (!transform) return Promise.resolve(raw);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    transform.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    transform.on('error', reject);
    transform.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    transform.end(raw);
  });
};


/**
 * The state the service keeps while it runs, and the operations every route
 * above it is a thin wrapper for.
 *
 * Settings live in a file, the model catalog in memory, and the registration
 * is read back from OpenCode's config each time the panel asks. Nothing here
 * trusts the panel: every change is applied, saved, then reported as the state
 * the other side can see.
 */

const REFRESH_INTERVAL_MS = 10 * 60_000;
const REQUEST_LOG_LIMIT = REQUEST_HISTORY_LIMIT;

const PACKAGE_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const RELAY_FILES: Record<ProxyPoolType, string> = {
  http: path.join('relays', 'cloudflare', 'worker.js'),
  cloudflare: path.join('relays', 'cloudflare', 'worker.js'),
  vercel: path.join('relays', 'vercel', 'api', 'relay.js'),
  netlify: path.join('relays', 'netlify', 'functions', 'relay.mjs'),
  deno: path.join('relays', 'deno', 'main.ts'),
};

export type Runtime = {
  state(): RouterState;
  patchConfig(patch: ConfigPatch): Promise<RouterState>;
  rotateKey(): Promise<RouterState>;
  refreshModels(): Promise<RouterState>;
  register(): Promise<RouterState>;
  unregister(): Promise<RouterState>;
  relaySource(kind: ProxyPoolType): Promise<RelaySource>;
  createProxyPool(input: CreateProxyPoolInput): Promise<RouterState>;
  updateProxyPool(id: string, patch: UpdateProxyPoolInput): Promise<RouterState>;
  deleteProxyPool(id: string): Promise<RouterState>;
  testProxyPool(id: string): Promise<TestProxyPoolResult>;
  testModel(modelId: string): Promise<TestModelResult>;
  deployCloudflare(input: DeployCloudflareInput): Promise<RouterState>;
  deployVercel(input: DeployVercelInput): Promise<RouterState>;
  deployDeno(input: DeployDenoInput): Promise<RouterState>;
  deployNetlify(input: DeployNetlifyInput): Promise<RouterState>;
  start(): Promise<void>;
  stop(): Promise<void>;
};

export const createRuntime = (store: ConfigStore = createConfigStore()): Runtime => {
  let config = store.load();
  const runtimeSession = sessionId();
  const poolSelector = createPoolSelector();
  // Model tests must not mutate round-robin/sticky state used by live chat requests.
  const modelTestPoolSelector = createPoolSelector();
  let models: RouterModel[] = [];
  let modelsFetchedAt: number | null = null;
  let modelsError = '';
  let upstreamCount = 0;
  let warnings: string[] = [];
  const requestHistory = createRequestHistoryStore(store.path);
  const requests: RequestEntry[] = requestHistory.load();
  let router: RouterServer | null = null;
  let routerError = '';
  let directRateLimitedUntil = 0;
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  const configFile = resolveConfigFile();

  const registration = () => readRegistration(configFile);

  /** The picked models, or every free model when nothing is picked. */
  const pickedModels = (): RouterModel[] => {
    const selected = new Set(config.selectedModels);
    return selected.size === 0 ? models : models.filter((model) => selected.has(model.id));
  };

  /** Selected catalog models plus named aliases registered in OpenCode. */
  const modelsToRegister = (): RouterModel[] => [
    ...pickedModels(),
    ...buildComboRouterModels(config.modelCombos ?? [], models),
  ];

  /** The block Register writes, shown by the panel before anything lands. */
  const preview = (): string =>
    JSON.stringify(
      { providers: { [PROVIDER_ID]: buildProviderEntry(config, modelsToRegister()) } },
      null,
      2,
    );

  let isLoadingModels = false;
  const ensureFreshModels = (): void => {
    if (isLoadingModels) return;
    const isStale = modelsFetchedAt === null || Date.now() - modelsFetchedAt > 5 * 60_000;
    if (models.length === 0 || isStale) {
      isLoadingModels = true;
      loadModels().finally(() => {
        isLoadingModels = false;
      });
    }
  };

  const state = (): RouterState => {
    ensureFreshModels();
    return {
      running: router !== null,
      routerError,
      endpoint: endpointFor(config),
      config: { ...config, upstreamApiKey: '' },
      upstreamApiKeyConfigured: Boolean(config.upstreamApiKey?.trim()),
      models,
      modelsFetchedAt,
      modelsError,
      upstreamCount,
      registration: registration(),
      preview: preview(),
      warnings,
      requests,
    };
  };

  const persist = (next: RouterConfig): void => {
    config = next;
    store.save(next);
  };

  const bindRouter = async (): Promise<void> => {
    if (router) {
      await router.close();
      router = null;
    }
    routerError = '';
    try {
      router = await startRouterServer({
        getConfig: () => config,
        getModels: () => modelsToRegister(),
        refreshModels: loadModels,
        pickPool: () => poolSelector.pickPool(config),
        getDirectRateLimitedUntil: () => directRateLimitedUntil,
        markRateLimited: (pool: ProxyPool | null, retryAfter?: string) => {
          const limitedUntil = Date.now() + parseRetryAfterMs(retryAfter);
          if (!pool) {
            directRateLimitedUntil = limitedUntil;
            return;
          }
          const updatedPools = config.proxyPools.map((entry) =>
            entry.id === pool.id
              ? { ...entry, rateLimitedUntil: limitedUntil, testStatus: 'error' as const, lastError: 'Rate limit (HTTP 429)', lastTestedAt: Date.now() }
              : entry,
          );
          persist({ ...config, proxyPools: updatedPools });
        },
        record: (entry: RequestEntry) => {
          requests.unshift(entry);
          if (requests.length > REQUEST_LOG_LIMIT) requests.length = REQUEST_LOG_LIMIT;
          try {
            requestHistory.save(requests);
          } catch (error) {
            // A filesystem failure must not break active model requests.
            console.warn('[blackrouter] could not persist request history:', error);
          }
        },
      });
    } catch (error) {
      router = null;
      routerError = error instanceof Error ? error.message : String(error);
    }
  };

  const loadModels = async (): Promise<void> => {
    try {
      const result = await fetchModelIds(config);
      models = toModels(result.free, result.rawEntries);
      modelsFetchedAt = Date.now();
      modelsError = '';
      upstreamCount = result.ids.length;
      if (models.length > 0) {
        refreshRegistration(false);
      }
    } catch (error) {
      modelsError = error instanceof Error ? error.message : String(error);
    }
  };

  const refreshRegistration = (force = false): void => {
    const current = registration();
    if (!current.installed && !force) return;
    const result = registerProvider(configFile, config, modelsToRegister());
    warnings = result.warnings;
  };

  return {
    state,

    patchConfig: async (patch) => {
      const previous = config;
      const portChanged = patch.port !== undefined && patch.port !== previous.port;
      const selectionChanged =
        patch.selectedModels !== undefined &&
        JSON.stringify(patch.selectedModels) !== JSON.stringify(previous.selectedModels);
      const poolsChanged =
        patch.proxyPools !== undefined &&
        JSON.stringify(patch.proxyPools) !== JSON.stringify(previous.proxyPools);
      const combosChanged =
        patch.modelCombos !== undefined &&
        JSON.stringify(patch.modelCombos) !== JSON.stringify(previous.modelCombos);
      const upstreamChanged = patch.upstream !== undefined && patch.upstream !== previous.upstream;
      const upstreamOriginChanged = patch.upstream !== undefined &&
        !hasSameUpstreamOrigin(previous.upstream, patch.upstream);
      const upstreamApiKeyChanged = patch.upstreamApiKey !== undefined &&
        patch.upstreamApiKey !== (previous.upstreamApiKey ?? '');

      if (portChanged && patch.port !== undefined) {
        if (patch.port < 1024 || patch.port > 65535) {
          throw badRequest('The port must be between 1024 and 65535.');
        }
      }
      warnings = [];
      const previousPort = previous.port;
      persist({
        ...previous,
        port: patch.port ?? previous.port,
        apiKey: patch.apiKey ?? previous.apiKey,
        upstream: patch.upstream ?? previous.upstream,
        // Never send a saved credential to a different origin after an endpoint switch.
        upstreamApiKey: patch.upstreamApiKey !== undefined
          ? patch.upstreamApiKey
          : upstreamOriginChanged ? '' : previous.upstreamApiKey ?? '',
        selectedModels: (upstreamChanged || upstreamApiKeyChanged) && patch.selectedModels === undefined
          ? []
          : patch.selectedModels ?? previous.selectedModels,
        fallbackModels: patch.fallbackModels ?? previous.fallbackModels,
        modelCombos: patch.modelCombos ?? previous.modelCombos,
        proxyPools: patch.proxyPools ?? previous.proxyPools,
        proxyStrategy: patch.proxyStrategy ?? previous.proxyStrategy,
        activePoolId: patch.activePoolId !== undefined ? patch.activePoolId : previous.activePoolId,
        stickyLimit: patch.stickyLimit ?? previous.stickyLimit,
        rtkEnabled: patch.rtkEnabled ?? previous.rtkEnabled,
        cavemanLevel: patch.cavemanLevel ?? previous.cavemanLevel,
        ponytailLevel: patch.ponytailLevel ?? previous.ponytailLevel,
      });
      if (patch.apiKey && patch.apiKey !== previous.apiKey) {
        refreshRegistration(true);
      }
      if (portChanged) {
        await bindRouter();
        if (routerError) {
          const failure = routerError;
          persist({ ...config, port: previousPort });
          await bindRouter();
          throw new RouterError('port-busy', failure);
        }
        refreshRegistration(true);
      }
      if (upstreamChanged || upstreamApiKeyChanged) {
        directRateLimitedUntil = 0;
        await loadModels();
        refreshRegistration(true);
      } else if (poolsChanged) {
        await loadModels();
      }
      if (selectionChanged || combosChanged) {
        refreshRegistration(true);
      }
      return state();
    },

    rotateKey: async () => {
      warnings = [];
      persist({ ...config, apiKey: createApiKey() });
      refreshRegistration(true);
      return state();
    },

    refreshModels: async () => {
      warnings = [];
      await loadModels();
      if (modelsError) {
        throw new RouterError('upstream', modelsError);
      }
      refreshRegistration();
      return state();
    },

    register: async () => {
      warnings = [];
      const result = registerProvider(configFile, config, modelsToRegister());
      warnings = result.warnings;
      return state();
    },

    unregister: async () => {
      warnings = [];
      const result = removeProvider(configFile);
      warnings = result.warnings;
      return state();
    },

    relaySource: async (kind) => {
      if (kind === 'http') {
        return {
          kind: 'http',
          code: '// Standard HTTP/HTTPS forward proxy (e.g. Clash, V2Ray, Squid) does not require a worker script.\n// Simply configure your proxy URL (e.g. http://127.0.0.1:7890) directly.\n',
        };
      }
      const file = RELAY_FILES[kind];
      const code = await readFile(path.join(PACKAGE_ROOT, file), 'utf8');
      return { kind, code };
    },

    createProxyPool: async (input) => {
      const newPool: ProxyPool = {
        id: randomUUID(),
        name: input.name.trim(),
        type: input.type,
        proxyUrl: input.proxyUrl.trim(),
        isActive: input.isActive ?? true,
      };
      // If marked active, optionally deactivate other pools or keep multi-pool
      const updatedPools = [...config.proxyPools, newPool];
      persist({ ...config, proxyPools: updatedPools });
      await loadModels();
      return state();
    },

    updateProxyPool: async (id, patch) => {
      const pool = config.proxyPools.find((p) => p.id === id);
      if (!pool) throw badRequest(`Proxy pool "${id}" not found.`);
      const updatedPools = config.proxyPools.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          name: patch.name !== undefined ? patch.name.trim() : p.name,
          proxyUrl: patch.proxyUrl !== undefined ? patch.proxyUrl.trim() : p.proxyUrl,
          isActive: patch.isActive !== undefined ? patch.isActive : p.isActive,
        };
      });
      persist({ ...config, proxyPools: updatedPools });
      await loadModels();
      return state();
    },

    deleteProxyPool: async (id) => {
      const updatedPools = config.proxyPools.filter((p) => p.id !== id);
      persist({ ...config, proxyPools: updatedPools });
      await loadModels();
      return state();
    },

    testProxyPool: async (id) => {
      const pool = config.proxyPools.find((p) => p.id === id);
      if (!pool) throw badRequest(`Proxy pool "${id}" not found.`);
      const result = await testRelayOrProxy(pool);
      const updatedPools = config.proxyPools.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          testStatus: (result.ok ? 'active' : 'error') as 'active' | 'error',
          lastTestedAt: Date.now(),
          lastError: result.error || null,
          rateLimitedUntil: result.ok ? null : p.rateLimitedUntil,
        };
      });
      persist({ ...config, proxyPools: updatedPools });
      return result;
    },

    testModel: async (modelId: string): Promise<TestModelResult> => {
      const start = Date.now();
      const attempted = new Set<string>();
      const maxAttempts = Math.max(1, config.proxyPools.filter((p) => p.isActive && p.proxyUrl.trim()).length + 1);
      let lastError = 'The upstream did not answer.';

      // A short, non-streaming UI test should never request a 1k-token response.
      const chatPayload = JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Reply only with OK.' }],
        max_tokens: 8,
        stream: false,
      });
      const prepared = prepareChat(chatPayload, { rtkEnabled: false });

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const pool = modelTestPoolSelector.pickPool(config, attempted);
        const activePoolCount = config.proxyPools.filter((p) => p.isActive && p.proxyUrl.trim()).length;
        if (!pool && activePoolCount > 0) {
          lastError = 'All configured proxy pools are cooling down. Wait for the upstream rate limit to reset.';
          break;
        }
        if (!pool && activePoolCount === 0 && directRateLimitedUntil > Date.now()) {
          lastError = `The configured upstream is rate-limited. Retry in approximately ${Math.ceil((directRateLimitedUntil - Date.now()) / 1000)} seconds.`;
          break;
        }
        if (pool && attempted.has(pool.id)) break;
        if (pool) attempted.add(pool.id);
        try {
          let nativeRequest: { url?: URL; headers?: Record<string, string>; body?: string; lane?: OpenCodeLane; toolNameMap?: Map<string, string> | null; directFetch?: (url: URL, options: RequestInit) => Promise<Response> } | null = null;
          if (isOpenCodeUpstream(config.upstream)) {
            const parsedBody = JSON.parse(prepared.body) as Record<string, unknown>;
            nativeRequest = await prepareProviderRequest({ model: modelId, body: parsedBody, session: runtimeSession });
          }
          const target = buildTarget(config, 'chat', pool, nativeRequest?.url);
          const outboundBody = nativeRequest?.body ?? prepared.body;
          const testHeaders: Record<string, string> = {
            ...(isOpenCodeUpstream(config.upstream) ? nativeRequest?.headers ?? {} : {}),
            ...target.headers,
            'content-type': 'application/json',
            accept: 'text/event-stream',
            'content-length': String(Buffer.byteLength(outboundBody)),
          };

          let resultText = '';
          let status = 200;
          let retryAfter: string | undefined;
          if (target.agent) {
            const answer = await new Promise<{ text: string; status: number; retryAfter?: string }>((resolve, reject) => {
              const transport = target.url.protocol === 'http:' ? http : https;
              const req = transport.request(target.url, { method: 'POST', agent: target.agent, headers: testHeaders }, (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
                res.on('end', () => resolve({
                  text: Buffer.concat(chunks).toString('utf8'),
                  status: res.statusCode ?? 502,
                  retryAfter: typeof res.headers['retry-after'] === 'string' ? res.headers['retry-after'] : undefined,
                }));
              });
              req.on('error', reject);
              req.setTimeout(15_000, () => {
                req.destroy();
                reject(new Error('Test request timed out.'));
              });
              req.end(outboundBody);
            });
            resultText = answer.text;
            status = answer.status;
            retryAfter = answer.retryAfter;
          } else {
            const useNativeTls = isOpenCodeUpstream(config.upstream) && !pool && activePoolCount === 0 && typeof nativeRequest?.directFetch === 'function';
            const fetcher = useNativeTls ? nativeRequest!.directFetch! : fetch;
            const answer = await fetcher(target.url, { method: 'POST', headers: testHeaders, body: outboundBody, signal: AbortSignal.timeout(15_000) });
            resultText = await answer.text();
            status = answer.status;
            retryAfter = answer.headers.get('retry-after') ?? undefined;
          }

          if (status >= 200 && status < 300) {
            if (nativeRequest) {
              resultText = await normalizeTestSse(
                resultText,
                nativeRequest.lane,
                modelId,
                nativeRequest.toolNameMap,
              );
            }
            const aggregated = aggregateStream(resultText);
            const choices = Array.isArray(aggregated.choices) ? aggregated.choices : [];
            const firstChoice = choices[0] as { message?: { content?: string } } | undefined;
            const reply = firstChoice?.message?.content?.trim() || 'OK';
            return { ok: true, modelId, elapsedMs: Date.now() - start, reply };
          }

          lastError = `HTTP ${status}: ${resultText.slice(0, 300)}`;
          if (status !== 429) break;
          const activePoolCount = config.proxyPools.filter((p) => p.isActive && p.proxyUrl.trim()).length;
          if (!pool && activePoolCount === 0) {
            directRateLimitedUntil = Date.now() + parseRetryAfterMs(retryAfter);
            lastError = `HTTP 429: upstream rate-limited; retry after approximately ${Math.ceil((directRateLimitedUntil - Date.now()) / 1000)} seconds.`;
            break;
          }
          if (!pool && activePoolCount > 0) {
            // All configured pools are cooling down. Do not bypass them by silently going direct.
            lastError = 'All configured proxy pools are cooling down. Wait for the upstream rate limit to reset.';
            break;
          }
          if (pool) {
            const limitedUntil = Date.now() + parseRetryAfterMs(retryAfter);
            const updated = config.proxyPools.map((p) => p.id === pool.id
              ? { ...p, testStatus: 'error' as const, lastTestedAt: Date.now(), lastError: 'Rate limit (HTTP 429)', rateLimitedUntil: limitedUntil }
              : p);
            persist({ ...config, proxyPools: updated });
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          break;
        }
      }

      return {
        ok: false,
        modelId,
        elapsedMs: Date.now() - start,
        error: lastError,
      };
    },

    deployCloudflare: async (input) => {
      const res = await executeDeployCloudflare(input);
      const newPool: ProxyPool = {
        id: randomUUID(),
        name: res.name,
        type: 'cloudflare',
        proxyUrl: res.proxyUrl,
        isActive: true,
      };
      persist({ ...config, proxyPools: [...config.proxyPools, newPool] });
      await loadModels();
      return state();
    },

    deployVercel: async (input) => {
      const res = await executeDeployVercel(input);
      const newPool: ProxyPool = {
        id: randomUUID(),
        name: res.name,
        type: 'vercel',
        proxyUrl: res.proxyUrl,
        isActive: true,
      };
      persist({ ...config, proxyPools: [...config.proxyPools, newPool] });
      await loadModels();
      return state();
    },

    deployDeno: async (input) => {
      const res = await executeDeployDeno(input);
      const newPool: ProxyPool = {
        id: randomUUID(),
        name: res.name,
        type: 'deno',
        proxyUrl: res.proxyUrl,
        isActive: true,
      };
      persist({ ...config, proxyPools: [...config.proxyPools, newPool] });
      await loadModels();
      return state();
    },

    deployNetlify: async (input) => {
      const res = await executeDeployNetlify(input);
      const newPool: ProxyPool = {
        id: randomUUID(),
        name: res.name,
        type: 'netlify',
        proxyUrl: res.proxyUrl,
        isActive: true,
      };
      persist({ ...config, proxyPools: [...config.proxyPools, newPool] });
      await loadModels();
      return state();
    },

    start: async () => {
      await bindRouter();
      void loadModels();
      refreshTimer = setInterval(() => {
        void loadModels();
      }, REFRESH_INTERVAL_MS);
      refreshTimer.unref();
    },

    stop: async () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
      const running = router;
      router = null;
      if (running) await running.close();
    },
  };
};
