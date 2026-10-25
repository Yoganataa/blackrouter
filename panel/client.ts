import { HostRequestError, type GuestRequestMethod, type GuestRequestResult, type HostClient } from '@openchamber/sdk';
import { z } from 'zod';

import {
  relaySourceSchema,
  routerStateSchema,
  testModelResultSchema,
  testProxyPoolResultSchema,
  type ConfigPatch,
  type CreateProxyPoolInput,
  type DeployCloudflareInput,
  type DeployDenoInput,
  type DeployNetlifyInput,
  type DeployVercelInput,
  type ProxyPoolType,
  type RelaySource,
  type RouterState,
  type TestModelResult,
  type TestProxyPoolResult,
  type UpdateProxyPoolInput,
} from '../contract.ts';
import type { JsonValue } from '../json.ts';

/** A failure the panel can show as it is. */
export class ServiceError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

const errorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

const safeJson = (text: string): JsonValue | null => {
  try {
    const parsed: JsonValue = JSON.parse(text);
    return parsed;
  } catch {
    return null;
  }
};

/**
 * The panel's way to the local service.
 *
 * The panel is sandboxed, so every call goes through the host proxy to the
 * service this extension starts. Each answer is checked against the contract
 * before the panel acts on it.
 */
export type ServiceClient = {
  state(): Promise<RouterState>;
  patchConfig(patch: ConfigPatch): Promise<RouterState>;
  rotateKey(): Promise<RouterState>;
  refreshModels(): Promise<RouterState>;
  testModel(modelId: string): Promise<TestModelResult>;
  register(): Promise<RouterState>;
  unregister(): Promise<RouterState>;
  relaySource(kind: ProxyPoolType): Promise<RelaySource>;
  createProxyPool(input: CreateProxyPoolInput): Promise<RouterState>;
  updateProxyPool(id: string, patch: UpdateProxyPoolInput): Promise<RouterState>;
  deleteProxyPool(id: string): Promise<RouterState>;
  testProxyPool(id: string): Promise<TestProxyPoolResult>;
  deployCloudflare(input: DeployCloudflareInput): Promise<RouterState>;
  deployVercel(input: DeployVercelInput): Promise<RouterState>;
  deployDeno(input: DeployDenoInput): Promise<RouterState>;
  deployNetlify(input: DeployNetlifyInput): Promise<RouterState>;
};

export const createServiceClient = (host: HostClient): ServiceClient => {
  const call = async <Schema extends z.ZodType>(
    method: GuestRequestMethod,
    path: string,
    schema: Schema,
    body?: JsonValue,
  ): Promise<z.infer<Schema>> => {
    let result: GuestRequestResult;
    try {
      result = await host.serviceRequest({
        method,
        path,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      throw new ServiceError(
        'no-service',
        error instanceof HostRequestError && error.code === 'NO_SERVICE'
          ? 'Allow the local service for this extension in Settings, Extensions.'
          : 'Could not reach the local service.',
      );
    }

    const payload = safeJson(result.body);
    if (result.status >= 400) {
      const failure = errorSchema.safeParse(payload);
      throw new ServiceError(
        failure.success ? failure.data.error.code : 'unknown',
        failure.success ? failure.data.error.message : 'The local service refused the request.',
      );
    }
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new ServiceError('bad-answer', 'The local service answered with something this panel does not understand.');
    }
    return parsed.data;
  };

  return {
    state: () => call('GET', '/state', routerStateSchema),
    patchConfig: (patch) => call('PUT', '/config', routerStateSchema, patch as unknown as JsonValue),
    rotateKey: () => call('POST', '/api-key/rotate', routerStateSchema, {}),
    refreshModels: () => call('POST', '/models/refresh', routerStateSchema, {}),
    testModel: (modelId) => call('POST', '/models/test', testModelResultSchema, { modelId }),
    register: () => call('POST', '/register', routerStateSchema, {}),
    unregister: () => call('POST', '/unregister', routerStateSchema, {}),
    relaySource: (kind) => call('GET', `/relays/${kind}`, relaySourceSchema),
    createProxyPool: (input) => call('POST', '/proxy-pools', routerStateSchema, input as unknown as JsonValue),
    updateProxyPool: (id, patch) => call('PUT', `/proxy-pools/${id}`, routerStateSchema, patch as unknown as JsonValue),
    deleteProxyPool: (id) => call('DELETE', `/proxy-pools/${id}`, routerStateSchema),
    testProxyPool: (id) => call('POST', `/proxy-pools/${id}/test`, testProxyPoolResultSchema, {}),
    deployCloudflare: (input) =>
      call('POST', '/proxy-pools/cloudflare-deploy', routerStateSchema, input as unknown as JsonValue),
    deployVercel: (input) => call('POST', '/proxy-pools/vercel-deploy', routerStateSchema, input as unknown as JsonValue),
    deployDeno: (input) => call('POST', '/proxy-pools/deno-deploy', routerStateSchema, input as unknown as JsonValue),
    deployNetlify: (input) => call('POST', '/proxy-pools/netlify-deploy', routerStateSchema, input as unknown as JsonValue),
  };
};
