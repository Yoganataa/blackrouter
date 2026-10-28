import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import http from 'node:http';

import type { ProxyPool, RouterConfig } from '../contract.ts';
import { proxyChatCompletion } from './upstream.ts';

const requestedModels: string[] = [];
const poolAttempts: string[] = [];
let server: http.Server;
let baseUrl = '';

const configFor = (port: number): RouterConfig => ({
  version: 1,
  port: 20128,
  apiKey: 'sk-test',
  upstream: `http://127.0.0.1:${port}/v1`,
  selectedModels: [],
  fallbackModels: ['fallback-model'],
  modelCombos: [],
  proxyPools: [],
  proxyStrategy: 'single',
  activePoolId: null,
  stickyLimit: 1,
  rtkEnabled: true,
  cavemanLevel: 'off',
  ponytailLevel: 'off',
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

      if (request.url === '/combo-test') {
        requestedModels.length = 0;
        await readRequestBody(request);
        const address = server.address();
        if (!address || typeof address === 'string') {
          response.writeHead(500);
          response.end('No listener address');
          return;
        }
        const prepared = {
          model: 'blackrouter/combo/quick',
          stream: true,
          body: JSON.stringify({
            model: 'blackrouter/combo/quick',
            stream: true,
            messages: [{ role: 'user', content: 'Reply with OK.' }],
          }),
        };
        proxyChatCompletion(
          {
            ...configFor(address.port),
            fallbackModels: ['global-fallback'],
            modelCombos: [{
              id: 'quick',
              name: 'Quick',
              models: ['primary-model', 'fallback-model'],
            }],
          },
          'ses_combo_test',
          prepared,
          response,
          null,
          () => {},
        );
        return;
      }

      if (request.url === '/pool-test') {
        await readRequestBody(request);
        const address = server.address();
        if (!address || typeof address === 'string') {
          response.writeHead(500);
          response.end('No listener address');
          return;
        }
        const pools: ProxyPool[] = [
          { id: 'pool-a', name: 'Pool A', type: 'cloudflare', proxyUrl: `http://127.0.0.1:${address.port}/pool-a`, isActive: true },
          { id: 'pool-b', name: 'Pool B', type: 'cloudflare', proxyUrl: `http://127.0.0.1:${address.port}/pool-b`, isActive: true },
        ];
        proxyChatCompletion(
          { ...configFor(address.port), proxyPools: pools },
          'ses_test_pool',
          {
            model: 'primary-model',
            stream: true,
            body: JSON.stringify({
              model: 'primary-model',
              stream: true,
              messages: [{ role: 'user', content: 'Reply with OK.' }],
            }),
          },
          response,
          pools[0],
          () => {},
        );
        return;
      }

      if (request.url === '/pool-network-failure-test') {
        await readRequestBody(request);
        const address = server.address();
        if (!address || typeof address === 'string') {
          response.writeHead(500);
          response.end('No listener address');
          return;
        }
        poolAttempts.length = 0;
        const pools: ProxyPool[] = [
          { id: 'network-a', name: 'Network A', type: 'cloudflare', proxyUrl: `http://127.0.0.1:${address.port}/network-a`, isActive: true },
          { id: 'network-b', name: 'Network B', type: 'cloudflare', proxyUrl: `http://127.0.0.1:${address.port}/network-b`, isActive: true },
        ];
        proxyChatCompletion(
          { ...configFor(address.port), proxyPools: pools },
          'ses_network_failure_test',
          {
            model: 'primary-model',
            stream: true,
            body: JSON.stringify({
              model: 'primary-model',
              stream: true,
              messages: [{ role: 'user', content: 'Reply with OK.' }],
            }),
          },
          response,
          pools[0],
          () => {},
        );
        return;
      }

      if (request.url === '/pool-all-network-failure-test') {
        await readRequestBody(request);
        const address = server.address();
        if (!address || typeof address === 'string') {
          response.writeHead(500);
          response.end('No listener address');
          return;
        }
        poolAttempts.length = 0;
        requestedModels.length = 0;
        const pools: ProxyPool[] = [
          { id: 'dead-a', name: 'Dead Relay A', type: 'cloudflare', proxyUrl: `http://127.0.0.1:${address.port}/dead-a`, isActive: true },
          { id: 'dead-b', name: 'Dead Relay B', type: 'cloudflare', proxyUrl: `http://127.0.0.1:${address.port}/dead-b`, isActive: true },
        ];
        proxyChatCompletion(
          {
            ...configFor(address.port),
            upstream: 'https://opencode.ai/zen/v1',
            fallbackModels: [],
            proxyPools: pools,
          },
          'ses_pool_all_network_failure_test',
          {
            model: 'big-pickle',
            stream: true,
            body: JSON.stringify({
              model: 'big-pickle',
              stream: true,
              messages: [{ role: 'user', content: 'Reply with OK.' }],
            }),
          },
          response,
          pools[0],
          () => {},
        );
        return;
      }

      if (request.url === '/http-proxy-failure-test') {
        await readRequestBody(request);
        const address = server.address();
        if (!address || typeof address === 'string') {
          response.writeHead(500);
          response.end('No listener address');
          return;
        }
        poolAttempts.length = 0;
        const proxyPool: ProxyPool = {
          id: 'http-forward-proxy',
          name: 'HTTP Forward Proxy',
          type: 'http',
          proxyUrl: `http://127.0.0.1:${address.port}`,
          isActive: true,
        };
        proxyChatCompletion(
          {
            ...configFor(address.port),
            upstream: 'https://opencode.ai/zen/v1',
            fallbackModels: [],
            proxyPools: [proxyPool],
          },
          'ses_http_proxy_failure_test',
          {
            model: 'big-pickle',
            stream: true,
            body: JSON.stringify({
              model: 'big-pickle',
              stream: true,
              messages: [{ role: 'user', content: 'Reply with OK.' }],
            }),
          },
          response,
          proxyPool,
          () => {},
        );
        return;
      }

      if (request.url === '/pool-gate-test') {
        await readRequestBody(request);
        const address = server.address();
        if (!address || typeof address === 'string') {
          response.writeHead(500);
          response.end('No listener address');
          return;
        }
        poolAttempts.length = 0;
        const pools: ProxyPool[] = [
          { id: 'gate-a', name: 'Gate A', type: 'cloudflare', proxyUrl: `http://127.0.0.1:${address.port}/gate-a`, isActive: true },
          { id: 'gate-b', name: 'Gate B', type: 'cloudflare', proxyUrl: `http://127.0.0.1:${address.port}/gate-b`, isActive: true },
        ];
        proxyChatCompletion(
          { ...configFor(address.port), upstream: 'https://opencode.ai/zen/v1', fallbackModels: [], proxyPools: pools },
          'ses_gate_test',
          {
            model: 'big-pickle',
            stream: true,
            body: JSON.stringify({
              model: 'big-pickle',
              stream: true,
              messages: [{ role: 'user', content: 'Reply with OK.' }],
            }),
          },
          response,
          pools[0],
          () => {},
        );
        return;
      }

      if (request.url === '/dead-a' || request.url === '/dead-b') {
        poolAttempts.push(request.url.slice(1));
        // Both configured relays fail at transport level. There is no direct route in this case.
        request.socket.destroy();
        return;
      }

      if (request.url === '/network-a') {
        poolAttempts.push('network-a');
        // Simulate a relay whose TCP connection is accepted but then drops.
        request.socket.destroy();
        return;
      }

      if (request.url === '/network-b') {
        const body = JSON.parse(await readRequestBody(request)) as { model?: string };
        const model = body.model ?? '';
        poolAttempts.push(`network-b:${model}`);
        if (model === 'primary-model') {
          response.writeHead(503, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ error: { message: 'Network B temporarily unavailable for primary model' } }));
          return;
        }
        response.writeHead(200, { 'content-type': 'text/event-stream' });
        response.end([
          'data: ' + JSON.stringify({
            id: 'chatcmpl-network-fallback',
            object: 'chat.completion.chunk',
            created: 1,
            model,
            choices: [{ index: 0, delta: { content: 'OK' }, finish_reason: null }],
          }),
          '',
          'data: ' + JSON.stringify({
            id: 'chatcmpl-network-fallback',
            object: 'chat.completion.chunk',
            created: 1,
            model,
            choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
          }),
          '',
          'data: [DONE]',
          '',
        ].join('\\n'));
        return;
      }

      if (request.url === '/gate-a' || request.url === '/gate-b') {
        const body = JSON.parse(await readRequestBody(request)) as { model?: string };
        const poolName = request.url.slice(1);
        poolAttempts.push(`${poolName}:${body.model ?? ''}`);
        response.writeHead(403, { 'content-type': 'application/json' });
        response.end(JSON.stringify({
          type: 'FreeTierError',
          error: { message: `OpenCode rejected egress through ${poolName}` },
        }));
        return;
      }

      if (request.url === '/pool-a' || request.url === '/pool-b') {
        const body = JSON.parse(await readRequestBody(request)) as { model?: string };
        const model = body.model ?? '';
        const poolName = request.url.slice(1);
        poolAttempts.push(`${poolName}:${model}`);
        // Pool A is rate-limited and must be excluded for this request.
        // Pool B has a transient primary-model error, then serves the fallback model.
        if (poolName === 'pool-a') {
          response.writeHead(429, { 'content-type': 'application/json', 'retry-after': '1' });
          response.end(JSON.stringify({ error: { message: `${poolName} is rate limited for ${model}` } }));
          return;
        }
        if (model === 'primary-model') {
          response.writeHead(503, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ error: { message: `${poolName} is temporarily unavailable for ${model}` } }));
          return;
        }
        response.writeHead(200, { 'content-type': 'text/event-stream' });
        response.end([
          'data: ' + JSON.stringify({
            id: 'chatcmpl-pool-fallback',
            object: 'chat.completion.chunk',
            created: 1,
            model,
            choices: [{ index: 0, delta: { content: 'OK' }, finish_reason: null }],
          }),
          '',
          'data: ' + JSON.stringify({
            id: 'chatcmpl-pool-fallback',
            object: 'chat.completion.chunk',
            created: 1,
            model,
            choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
          }),
          '',
          'data: [DONE]',
          '',
        ].join('\\n'));
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
        if (model === 'fallback-model' || model === 'global-fallback') {
          response.writeHead(200, { 'content-type': 'text/event-stream' });
          response.end([
            'data: ' + JSON.stringify({
              id: 'chatcmpl-fallback',
              object: 'chat.completion.chunk',
              created: 1,
              model,
              choices: [{ index: 0, delta: { content: 'OK' }, finish_reason: null }],
            }),
            '',
            'data: ' + JSON.stringify({
              id: 'chatcmpl-fallback',
              object: 'chat.completion.chunk',
              created: 1,
              model,
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
    server.on('connect', (request, socket) => {
      poolAttempts.push(`connect:${request.url}`);
      socket.end('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
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

  test('falls back to another model after 429 and reports the resolved model', async () => {
    requestedModels.length = 0;
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

  test('routes a named combo alias through its ordered members instead of the global fallback', async () => {
    requestedModels.length = 0;
    const response = await fetch(`${baseUrl}/combo-test`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ run: true }),
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('x-blackrouter-requested-model')).toBe('blackrouter/combo/quick');
    expect(response.headers.get('x-blackrouter-resolved-model')).toBe('fallback-model');
    expect(response.headers.get('x-blackrouter-fallback-used')).toBe('true');
    expect(body).toContain('OK');
    expect(requestedModels).toEqual(['primary-model', 'fallback-model']);
  });

  test('does not revisit a relay after a transport failure during model fallback', async () => {
    poolAttempts.length = 0;
    const response = await fetch(`${baseUrl}/pool-network-failure-test`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ run: true }),
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('x-blackrouter-resolved-pool')).toBe('Network B');
    expect(response.headers.get('x-blackrouter-resolved-model')).toBe('fallback-model');
    expect(body).toContain('OK');
    expect(poolAttempts).toEqual([
      'network-a',
      'network-b:primary-model',
      'network-b:fallback-model',
    ]);
  });

  test('returns a bounded error when every configured relay fails without trying direct egress', async () => {
    poolAttempts.length = 0;
    requestedModels.length = 0;
    const response = await fetch(`${baseUrl}/pool-all-network-failure-test`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ run: true }),
    });
    const body = await response.text();

    expect(response.status).toBe(502);
    expect(body).toContain('upstream_unreachable');
    expect(body).toContain('upstream did not answer');
    expect(response.headers.get('x-blackrouter-resolved-pool')).toBe('Dead Relay B');
    expect(poolAttempts).toEqual(['dead-a', 'dead-b']);
    expect(requestedModels).toEqual([]);
  });

  test('does not bypass a failed HTTP forward proxy with direct egress', async () => {
    poolAttempts.length = 0;
    const response = await fetch(`${baseUrl}/http-proxy-failure-test`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ run: true }),
    });
    const body = await response.text();

    expect(response.status).toBe(502);
    expect(body).toContain('upstream_unreachable');
    expect(response.headers.get('x-blackrouter-resolved-pool')).toBe('HTTP Forward Proxy');
    expect(poolAttempts).toEqual(['connect:opencode.ai:443']);
  });

  test('does not bypass configured relay pools after OpenCode rejects every pool', async () => {
    poolAttempts.length = 0;
    const response = await fetch(`${baseUrl}/pool-gate-test`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ run: true }),
    });
    const body = await response.text();

    expect(response.status).toBe(403);
    expect(body).toContain('FreeTierError');
    expect(body).toContain('OpenCode rejected egress through gate-b');
    expect(response.headers.get('x-blackrouter-resolved-pool')).toBe('Gate B');
    expect(poolAttempts).toEqual(['gate-a:big-pickle', 'gate-b:big-pickle']);
  });

  test('does not revisit a pool after 429 while trying model fallbacks', async () => {
    poolAttempts.length = 0;
    const response = await fetch(`${baseUrl}/pool-test`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ run: true }),
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('x-blackrouter-resolved-pool')).toBe('Pool B');
    expect(response.headers.get('x-blackrouter-resolved-model')).toBe('fallback-model');
    expect(body).toContain('OK');
    expect(poolAttempts).toEqual([
      'pool-a:primary-model',
      'pool-b:primary-model',
      'pool-b:fallback-model',
    ]);
  });
});
