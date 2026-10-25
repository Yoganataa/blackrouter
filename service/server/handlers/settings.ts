import {
  PROXY_POOL_TYPES,
  configPatchSchema,
  createProxyPoolSchema,
  deployCloudflareSchema,
  deployDenoSchema,
  deployNetlifySchema,
  deployVercelSchema,
  testModelInputSchema,
  updateProxyPoolSchema,
  type ProxyPoolType,
} from '../../../contract.ts';
import { badRequest } from '../../errors.ts';
import type { Runtime } from '../../runtime.ts';
import { readBody } from '../body.ts';
import type { Router } from '../router.ts';

const isProxyPoolType = (value: string | undefined): value is ProxyPoolType =>
  value !== undefined && (PROXY_POOL_TYPES as readonly string[]).includes(value);

/** Everything that changes the router itself rather than OpenCode's config. */
export const registerSettingsRoutes = (router: Router, runtime: Runtime): void => {
  router.put('/config', async (request) => ({
    status: 200,
    body: await runtime.patchConfig(readBody(configPatchSchema, request.body)),
  }));

  router.post('/api-key/rotate', async () => ({
    status: 200,
    body: await runtime.rotateKey(),
  }));

  router.post('/models/refresh', async () => ({
    status: 200,
    body: await runtime.refreshModels(),
  }));

  router.post('/models/test', async (request) => ({
    status: 200,
    body: await runtime.testModel(readBody(testModelInputSchema, request.body).modelId),
  }));

  router.get('/relays/:kind', async (request) => {
    const kind = request.params.kind;
    if (!isProxyPoolType(kind)) {
      throw badRequest(`Unknown relay kind "${kind}".`);
    }
    return { status: 200, body: await runtime.relaySource(kind) };
  });

  router.post('/proxy-pools', async (request) => ({
    status: 200,
    body: await runtime.createProxyPool(readBody(createProxyPoolSchema, request.body)),
  }));

  router.put('/proxy-pools/:id', async (request) => {
    const id = request.params.id;
    if (!id) throw badRequest('Missing proxy pool id');
    return {
      status: 200,
      body: await runtime.updateProxyPool(id, readBody(updateProxyPoolSchema, request.body)),
    };
  });

  router.delete('/proxy-pools/:id', async (request) => {
    const id = request.params.id;
    if (!id) throw badRequest('Missing proxy pool id');
    return {
      status: 200,
      body: await runtime.deleteProxyPool(id),
    };
  });

  router.post('/proxy-pools/:id/test', async (request) => {
    const id = request.params.id;
    if (!id) throw badRequest('Missing proxy pool id');
    return {
      status: 200,
      body: await runtime.testProxyPool(id),
    };
  });

  router.post('/proxy-pools/cloudflare-deploy', async (request) => ({
    status: 200,
    body: await runtime.deployCloudflare(readBody(deployCloudflareSchema, request.body)),
  }));

  router.post('/proxy-pools/vercel-deploy', async (request) => ({
    status: 200,
    body: await runtime.deployVercel(readBody(deployVercelSchema, request.body)),
  }));

  router.post('/proxy-pools/deno-deploy', async (request) => ({
    status: 200,
    body: await runtime.deployDeno(readBody(deployDenoSchema, request.body)),
  }));

  router.post('/proxy-pools/netlify-deploy', async (request) => ({
    status: 200,
    body: await runtime.deployNetlify(readBody(deployNetlifySchema, request.body)),
  }));
};
