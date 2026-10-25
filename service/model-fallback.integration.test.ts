import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import http from 'node:http';

import type { RouterConfig } from '../contract.ts';
import { proxyChatCompletion } from './upstream.ts';

const requestedModels: string[] = [];
let server: http.Server;
let baseUrl = '';

const configFor = (port: number): RouterConfig => ({
  version: 1,
  port: 20128,
  apiKey: 'sk-test',
  upstream: `http://127.0.0.1:${port}/v1`,
  selectedModels: [],
  fallbackModels: ['fallback-model'],
  proxyPools: [],
  proxyStrategy: 'single',
  activePoolId: null,
  stickyLimit: 1,
  rtkEnabled: true,
});

const readRequestBody = (request: http.IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });

describe('model fallback request path', () => {
  beforeAll(async () => {
    requestedModels.length = 0;
    server = http.createServer(async (request, response) => {
      if (request.url === '/test') {
        await readRequestBody(request);
        const address = server.address();
        if (!address || typeof address === 'string') {
          response.writeHead(500);
          response.end('No listener address');
          return;
        }
        const prepared = {
          model: 'primary-model',
          stream: true,
          body: JSON.stringify({
            model: 'primary-model',
            stream: true,
            messages: [{ role: 'user', content: 'Reply with OK.' }],
          }),
        };
        proxyChatCompletion(
          configFor(address.port),
          'ses_test',
          prepared,
          response,
          null,
          () => {},
        );
        return;
      }

      if (request.url === '/v1/chat/completions') {
        const body = JSON.parse(await readRequestBody(request)) as { model?: string };
        const model = body.model ?? '';
        requestedModels.push(model);
        if (model === 'primary-model') {
          response.writeHead(429, { 'content-type': 'application/json', 'retry-after': '1' });
          response.end(JSON.stringify({ error: { message: 'primary model is rate limited' } }));
          return;
        }
        if (model === 'fallback-model') {
          response.writeHead(200, { 'content-type': 'text/event-stream' });
          response.end([
            'data: ' + JSON.stringify({
              id: 'chatcmpl-fallback',
              object: 'chat.completion.chunk',
              created: 1,
              model: 'fallback-model',
              choices: [{ index: 0, delta: { content: 'OK' }, finish_reason: null }],
            }),
            '',
            'data: ' + JSON.stringify({
              id: 'chatcmpl-fallback',
              object: 'chat.completion.chunk',
              created: 1,
              model: 'fallback-model',
              choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
            }),
            '',
            'data: [DONE]',
            '',
          ].join('\n'));
          return;
        }
        response.writeHead(404, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ error: { message: `unexpected model: ${model}` } }));
        return;
      }

      response.writeHead(404);
      response.end('Not found');
    });

    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Could not determine test server address.');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections();
      });
    }
  });

  test('falls back to the next configured model after 429 and reports the resolved model', async () => {
    const response = await fetch(`${baseUrl}/test`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ run: true }),
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('x-blackrouter-requested-model')).toBe('primary-model');
    expect(response.headers.get('x-blackrouter-resolved-model')).toBe('fallback-model');
    expect(response.headers.get('x-blackrouter-fallback-used')).toBe('true');
    expect(body).toContain('OK');
    expect(requestedModels).toEqual(['primary-model', 'fallback-model']);
  });
});
