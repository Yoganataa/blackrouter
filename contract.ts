import { z } from 'zod';

/**
 * What the panel and the local service agree on.
 *
 * The panel runs in a sandboxed frame and only talks to the service through
 * the host proxy. Both sides read these shapes, so a payload that changes
 * shape breaks one side loudly instead of quietly misrendering.
 */

export const PROXY_POOL_TYPES = ['http', 'vercel', 'cloudflare', 'deno', 'netlify'] as const;
export type ProxyPoolType = (typeof PROXY_POOL_TYPES)[number];

// Alias for backwards compatibility with tests and callers
export const RELAY_KINDS = PROXY_POOL_TYPES;
export type RelayKind = ProxyPoolType;

export const proxyPoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(PROXY_POOL_TYPES),
  proxyUrl: z.string(),
  isActive: z.boolean(),
  testStatus: z.enum(['active', 'error']).nullable().optional(),
  lastTestedAt: z.number().nullable().optional(),
  lastError: z.string().nullable().optional(),
  rateLimitedUntil: z.number().nullable().optional(),
});
export type ProxyPool = z.infer<typeof proxyPoolSchema>;

export const createProxyPoolSchema = z.object({
  name: z.string().min(1),
  type: z.enum(PROXY_POOL_TYPES),
  proxyUrl: z.string().min(1),
  isActive: z.boolean().optional(),
});
export type CreateProxyPoolInput = z.infer<typeof createProxyPoolSchema>;

export const updateProxyPoolSchema = z.object({
  name: z.string().min(1).optional(),
  proxyUrl: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateProxyPoolInput = z.infer<typeof updateProxyPoolSchema>;

export const deployCloudflareSchema = z.object({
  accountId: z.string().min(1),
  apiToken: z.string().min(1),
  projectName: z.string().optional(),
});
export type DeployCloudflareInput = z.infer<typeof deployCloudflareSchema>;

export const deployVercelSchema = z.object({
  vercelToken: z.string().min(1),
  projectName: z.string().optional(),
});
export type DeployVercelInput = z.infer<typeof deployVercelSchema>;

export const deployDenoSchema = z.object({
  denoToken: z.string().min(1),
  orgDomain: z.string().min(1),
  projectName: z.string().optional(),
});
export type DeployDenoInput = z.infer<typeof deployDenoSchema>;

export const deployNetlifySchema = z.object({
  netlifyToken: z.string().min(1),
  projectName: z.string().optional(),
});
export type DeployNetlifyInput = z.infer<typeof deployNetlifySchema>;

export const testProxyPoolResultSchema = z.object({
  ok: z.boolean(),
  status: z.number().optional(),
  statusText: z.string().nullable().optional(),
  elapsedMs: z.number().optional(),
  error: z.string().nullable().optional(),
});
export type TestProxyPoolResult = z.infer<typeof testProxyPoolResultSchema>;

export const PROXY_STRATEGIES = ['single', 'round-robin', 'random'] as const;
export type ProxyStrategy = (typeof PROXY_STRATEGIES)[number];

export const CAVEMAN_LEVELS = ['off', 'lite', 'full', 'ultra'] as const;
export type CavemanLevel = (typeof CAVEMAN_LEVELS)[number];

export const PONYTAIL_LEVELS = ['off', 'lite', 'full', 'ultra'] as const;
export type PonytailLevel = (typeof PONYTAIL_LEVELS)[number];

/**
 * A named model alias whose ordered member list acts as a bounded fallback chain.
 * OpenCode sees `blackrouter/combo/<id>`; the upstream only receives real model IDs.
 */
export const modelComboSchema = z.object({
  id: z.string().trim().toLowerCase().min(1).max(40).regex(/^[a-z0-9][a-z0-9._-]*$/, 'Use a lowercase model-combo slug.'),
  name: z.string().trim().min(1).max(80),
  models: z.array(z.string().trim().min(1).max(200)).min(2).max(6),
}).superRefine((combo, ctx) => {
  const seen = new Set<string>();
  combo.models.forEach((model, index) => {
    const key = model.trim().toLowerCase();
    if (seen.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['models', index],
        message: 'A model can appear only once in a combo.',
      });
    }
    seen.add(key);
  });
});
export type ModelCombo = z.infer<typeof modelComboSchema>;

export const modelCombosSchema = z.array(modelComboSchema).max(20).superRefine((combos, ctx) => {
  const seen = new Set<string>();
  combos.forEach((combo, index) => {
    const key = combo.id.toLowerCase();
    if (seen.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, 'id'],
        message: 'Model-combo IDs must be unique.',
      });
    }
    seen.add(key);
  });
});

export const routerConfigSchema = z.object({
  version: z.literal(1),
  /** Loopback port OpenCode and other clients call. */
  port: z.number().int().min(1024).max(65535),
  /** Bearer token for `/v1/*` on that port. */
  apiKey: z.string().min(8),
  /** API base of the upstream. Only the OpenCode Zen free pool is supported. */
  upstream: z.string(),
  /** Free model ids the user wants OpenCode to see. Empty means "every free model". */
  selectedModels: z.array(z.string()),
  /** Ordered model ids tried only after the requested model returns a retryable upstream error. */
  fallbackModels: z.array(z.string().min(1)).max(2).default([]),
  /** Named aliases with ordered model fallback chains. */
  modelCombos: modelCombosSchema.default([]),
  /** Proxy pools deployed or configured to route upstream calls. */
  proxyPools: z.array(proxyPoolSchema),
  /** Strategy for routing requests across configured proxy pools. */
  proxyStrategy: z.enum(PROXY_STRATEGIES).default('single'),
  /** Specific proxy pool ID targeted when proxyStrategy is 'single'. */
  activePoolId: z.string().nullable().optional(),
  /** Consecutive request threshold per pool in round-robin before rotating. */
  stickyLimit: z.number().int().min(1).max(100).default(1),
  /** Whether RTK tool-output compression is enabled on chat completions. */
  rtkEnabled: z.boolean().default(true),
  /** Optional terse-response prompt profile; off preserves model defaults. */
  cavemanLevel: z.enum(CAVEMAN_LEVELS).default('off'),
  /** Optional minimal-code prompt profile; off preserves model defaults. */
  ponytailLevel: z.enum(PONYTAIL_LEVELS).default('off'),
});
export type RouterConfig = z.infer<typeof routerConfigSchema>;

/** A settings change the panel may send. Omitted fields keep their value. */
export const configPatchSchema = z.object({
  port: z.number().int().min(1024).max(65535).optional(),
  apiKey: z.string().min(1).optional(),
  selectedModels: z.array(z.string()).optional(),
  fallbackModels: z.array(z.string().min(1)).max(2).optional(),
  modelCombos: modelCombosSchema.optional(),
  proxyPools: z.array(proxyPoolSchema).optional(),
  proxyStrategy: z.enum(PROXY_STRATEGIES).optional(),
  activePoolId: z.string().nullable().optional(),
  stickyLimit: z.number().int().min(1).max(100).optional(),
  rtkEnabled: z.boolean().optional(),
  cavemanLevel: z.enum(CAVEMAN_LEVELS).optional(),
  ponytailLevel: z.enum(PONYTAIL_LEVELS).optional(),
});
export type ConfigPatch = z.infer<typeof configPatchSchema>;

export const testModelInputSchema = z.object({
  modelId: z.string().min(1),
});
export type TestModelInput = z.infer<typeof testModelInputSchema>;

export const testModelResultSchema = z.object({
  ok: z.boolean(),
  modelId: z.string(),
  elapsedMs: z.number().int().nonnegative().optional(),
  reply: z.string().optional(),
  error: z.string().optional(),
});
export type TestModelResult = z.infer<typeof testModelResultSchema>;

export const modelSchema = z.object({
  id: z.string(),
  name: z.string(),
  limit: z
    .object({
      context: z.number().optional(),
      output: z.number().optional(),
    })
    .optional(),
  capabilities: z
    .object({
      tools: z.boolean().optional(),
      input: z.array(z.string()).optional(),
      output: z.array(z.string()).optional(),
    })
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.string(),
        settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
      }),
    )
    .optional(),
});
export type RouterModel = z.infer<typeof modelSchema>;

export const isForwardProxy = (type: ProxyPoolType): boolean => type === 'http';
export const isRelayKind = (type: ProxyPoolType): boolean => type !== 'http';

export const requestEntrySchema = z.object({
  at: z.number(),
  method: z.string(),
  path: z.string(),
  /** Model that actually answered, or the last attempted model on failure. */
  model: z.string(),
  /** Model requested by OpenChamber before any automatic fallback. */
  requestedModel: z.string().optional(),
  status: z.number(),
  ms: z.number(),
  poolName: z.string().optional(),
  fallbackUsed: z.boolean().optional(),
  fallbackReason: z.string().optional(),
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  totalTokens: z.number().int().nonnegative().optional(),
  error: z.string().optional(),
});
export type RequestEntry = z.infer<typeof requestEntrySchema>;

export const registrationSchema = z.object({
  providerId: z.string(),
  path: z.string(),
  installed: z.boolean(),
  models: z.number(),
  modelIds: z.array(z.string()),
});
export type Registration = z.infer<typeof registrationSchema>;

export const routerStateSchema = z.object({
  /** The router listener is bound on `config.port`. */
  running: z.boolean(),
  /** Why it is not bound, in a sentence the panel shows as-is. */
  routerError: z.string(),
  endpoint: z.string(),
  config: routerConfigSchema,
  /** Free models the upstream currently offers, in upstream order. */
  models: z.array(modelSchema),
  modelsFetchedAt: z.number().nullable(),
  modelsError: z.string(),
  /** How many models the upstream lists in total, free and paid. */
  upstreamCount: z.number(),
  registration: registrationSchema,
  /** The provider block Register writes, so the panel can show it before it lands. */
  preview: z.string(),
  /** What the last settings or registration action had to change, in the user's words. */
  warnings: z.array(z.string()),
  requests: z.array(requestEntrySchema),
});
export type RouterState = z.infer<typeof routerStateSchema>;

export const relaySourceSchema = z.object({
  kind: z.enum(PROXY_POOL_TYPES),
  code: z.string(),
});
export type RelaySource = z.infer<typeof relaySourceSchema>;

export const okSchema = z.object({ ok: z.literal(true) });
export type Ok = z.infer<typeof okSchema>;

/** The path OpenCode and every other client uses. */
export const endpointFor = (config: Pick<RouterConfig, 'port'>): string =>
  `http://127.0.0.1:${config.port}/v1`;
