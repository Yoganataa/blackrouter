// Runs under the app's Node runtime, on 127.0.0.1, and never leaves this machine.
//
// Two listeners are bound:
// - OPENCHAMBER_SERVICE_PORT, the host proxy. It carries the host's service
//   token and answers the panel: state, settings, the relay sources, and the
//   OpenCode registration.
// - the router port from the settings (20128 by default). It carries the
//   router's own API key and answers OpenCode and any other OpenAI-compatible
//   client with /v1/models and /v1/chat/completions.
import http from 'node:http';

import type { JsonValue } from '../json.ts';
import { createRuntime } from './runtime.ts';
import { toServiceResponse } from './server/respond.ts';
import { createRouter, type ServiceMethod } from './server/router.ts';
import { registerRegistrationRoutes } from './server/handlers/registration.ts';
import { registerSettingsRoutes } from './server/handlers/settings.ts';
import { registerStateRoutes } from './server/handlers/state.ts';

const port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
const token = process.env.OPENCHAMBER_SERVICE_TOKEN ?? '';
if (!port || !token) {
  console.error('OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required');
  process.exit(1);
}

/** Settings and relay sources are small; a megabyte is already generous. */
const BODY_LIMIT_BYTES = 1024 * 1024;

const runtime = createRuntime();
await runtime.start();

const router = createRouter();
router.get('/health', async () => ({ status: 200, body: { ok: true } }));
registerStateRoutes(router, runtime);
registerSettingsRoutes(router, runtime);
registerRegistrationRoutes(router, runtime);

const methodOf = (value: string | undefined): ServiceMethod => {
  if (value === 'POST') return 'POST';
  if (value === 'PUT') return 'PUT';
  if (value === 'DELETE') return 'DELETE';
  return 'GET';
};

const json = (response: http.ServerResponse, status: number, body: JsonValue): void => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
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

const server = http.createServer((request, response) => {
  if (request.headers.authorization !== `Bearer ${token}`) {
    json(response, 401, { error: { code: 'unauthorized', message: 'The service token did not match.' } });
    return;
  }
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  void readBody(request)
    .then((body) =>
      router.handle({
        method: methodOf(request.method),
        path: url.pathname,
        query: url.searchParams,
        body,
        params: {},
      }),
    )
    .then((answer) => {
      if (!answer) {
        json(response, 404, { error: { code: 'not-found', message: 'No route answers this request.' } });
        return;
      }
      json(response, answer.status, answer.body);
    })
    .catch((error: unknown) => {
      const failure = error instanceof Error ? error : new Error(String(error));
      const answer = toServiceResponse(failure);
      json(response, answer.status, answer.body);
    });
});

server.listen(port, '127.0.0.1');

const shutdown = (): void => {
  void runtime.stop().finally(() => {
    server.close(() => process.exit(0));
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
