import { describe, expect, test } from 'bun:test';
import http from 'node:http';
import https from 'node:https';
import { pipeline, Readable, Writable } from 'node:stream';

import type { RouterConfig } from '../contract.ts';
import { buildTarget, createTunnelAgent, createSseFirstByteKeepAlive, proxyChatCompletion, fetchModelIds, freeModelIds, hasSameUpstreamOrigin, humanizeModelId, isFreeModel, isOpenCodeUpstream, toModels, isOpenCodeFreeTierGateResponse } from './upstream.ts';
// @ts-ignore - the native provider executor is copied from upstream JavaScript.
import { prepareProviderRequest } from './core/provider-adapter.js';

const config = (overrides: Partial<RouterConfig> = {}): RouterConfig => ({
  version: 1,
  port: 20128,
  apiKey: 'sk-test',
  upstream: 'https://opencode.ai/zen/v1',
  upstreamApiKey: '',
  selectedModels: [],
  proxyPools: [],
  proxyStrategy: 'single',
  activePoolId: null,
  stickyLimit: 1,
  rtkEnabled: true,
  cavemanLevel: 'off',
  ponytailLevel: 'off',
  ...overrides,
  fallbackModels: overrides.fallbackModels ?? [],
  modelCombos: overrides.modelCombos ?? [],
});

describe('the free pool', () => {
  test('keeps only ids the upstream marks free', () => {
    expect(freeModelIds(['a-free', 'b', 'c-free', ' FREE-free ', ''])).toEqual(['a-free', 'c-free', 'FREE-free']);
    expect(freeModelIds(['big-pickle', 'union-alpha', 'paid-model'])).toEqual(['big-pickle', 'union-alpha']);
  });

  test('is not fooled by a free word in the middle', () => {
    expect(isFreeModel('free-model')).toBe(false);
    expect(isFreeModel('model-free')).toBe(true);
    expect(isFreeModel('big-pickle')).toBe(true);
    expect(isFreeModel('union-alpha')).toBe(true);
  });

  test('names a model for the picker and enriches metadata', () => {
    expect(humanizeModelId('deepseek-v4.1-flash-free')).toBe('DeepSeek V4.1 Flash');
    expect(humanizeModelId('glm-5.3-flash-free')).toBe('GLM 5.3 Flash');
    expect(toModels(['x-free'])).toEqual([
      {
        id: 'x-free',
        name: 'X',
        limit: { context: 131072, output: 8192 },
        capabilities: { tools: true, input: ['text'], output: ['text'] },
      },
    ]);
    expect(toModels(['glm-5.3-flash-free'])).toEqual([
      {
        id: 'glm-5.3-flash-free',
        name: 'GLM 5.3 Flash',
        limit: { context: 1000000, output: 128000 },
        capabilities: { tools: true, input: ['text', 'image'], output: ['text'] },
        variants: [
          { id: 'low', settings: { reasoningEffort: 'low' } },
          { id: 'medium', settings: { reasoningEffort: 'medium' } },
          { id: 'high', settings: { reasoningEffort: 'high' } },
        ],
      },
    ]);
  });
});

const nativeRequest = (model: string) => prepareProviderRequest({
  model,
  body: { model, messages: [{ role: 'user', content: 'hello' }], stream: true },
  session: 'ses_0123456789abcdefghijklmn',
});

describe('where a call goes', () => {
  test('native provider executor resolves OpenCode v2 endpoints', async () => {
    const models = buildTarget(config(), 'models');
    expect(models.url.toString()).toBe('https://opencode.ai/zen/v1/models');
    expect(models.headers).toEqual({});

    const chatNative = await nativeRequest('blackrouter/big-pickle');
    const chat = buildTarget(config({ upstream: 'https://opencode.ai/zen/v1/' }), 'chat', null, chatNative.url);
    expect(chat.url.toString()).toBe('https://opencode.ai/inference/v1/chat/completions');
    expect(JSON.parse(chatNative.body).model).toBe('big-pickle');

    const museNative = await nativeRequest('blackrouter/muse-spark-1.3-contributor-free');
    const museChat = buildTarget(config(), 'chat', null, museNative.url);
    expect(museChat.url.toString()).toBe('https://opencode.ai/inference/v1/responses');

    const unionNative = await nativeRequest('blackrouter/union-alpha');
    const unionChat = buildTarget(config(), 'chat', null, unionNative.url);
    expect(unionChat.url.toString()).toBe('https://opencode.ai/inference/v1/messages');
    expect(JSON.parse(unionNative.body).model).toBe('union-alpha');

    const custom = buildTarget(config({ upstream: 'https://custom-gateway.local/v1' }), 'chat');
    expect(custom.url.toString()).toBe('https://custom-gateway.local/v1/chat/completions');
  });

  test('recognizes only the OpenCode free-tier egress gate response', () => {
    expect(isOpenCodeFreeTierGateResponse(403, '{"type":"FreeTierError"}', true, true)).toBe(true);
    expect(isOpenCodeFreeTierGateResponse(403, '{"type":"Forbidden"}', true, true)).toBe(false);
    expect(isOpenCodeFreeTierGateResponse(403, '{"type":"FreeTierError"}', false, true)).toBe(false);
    expect(isOpenCodeFreeTierGateResponse(403, '{"type":"FreeTierError"}', true, false)).toBe(false);
    expect(isOpenCodeFreeTierGateResponse(200, '{"type":"FreeTierError"}', true, true)).toBe(false);
  });

  test('detects the official OpenCode host without accepting lookalike hostnames', () => {
    expect(isOpenCodeUpstream('https://opencode.ai/zen/v1')).toBe(true);
    expect(isOpenCodeUpstream('https://api.opencode.ai/v1')).toBe(true);
    expect(isOpenCodeUpstream('https://notopencode.ai/v1')).toBe(false);
    expect(isOpenCodeUpstream('https://example.com/opencode.ai/v1')).toBe(false);
  });

  test('compares origins before reusing a stored upstream credential', () => {
    expect(hasSameUpstreamOrigin('https://api.example.com/v1', 'https://api.example.com/v2')).toBe(true);
    expect(hasSameUpstreamOrigin('https://api.example.com/v1', 'https://other.example.com/v1')).toBe(false);
    expect(hasSameUpstreamOrigin('https://api.example.com/v1', 'http://api.example.com/v1')).toBe(false);
  });

  test('uses a configured Bearer key for a generic OpenAI-compatible upstream', () => {
    const custom = buildTarget(config({
      upstream: 'https://api.example.com/v1',
      upstreamApiKey: 'sk-provider-secret',
    }), 'chat');
    expect(custom.url.toString()).toBe('https://api.example.com/v1/chat/completions');
    expect(custom.headers.authorization).toBe('Bearer sk-provider-secret');
    expect(isOpenCodeUpstream('https://api.example.com/v1')).toBe(false);
  });

  test('a proxy pool preserves the native provider endpoint in relay headers', async () => {
    const poolConfig = config({
      proxyPools: [
        {
          id: 'test-cf',
          name: 'CF Relay',
          type: 'cloudflare',
          proxyUrl: 'https://relay.example.dev',
          isActive: true,
        },
      ],
    });
    const native = await nativeRequest('blackrouter/big-pickle');
    const chat = buildTarget(poolConfig, 'chat', undefined, native.url);
    expect(chat.url.toString()).toBe('https://relay.example.dev/');
    expect(chat.headers).toEqual({
      'x-relay-target': 'https://opencode.ai',
      'x-relay-path': '/inference/v1/chat/completions',
    });

    const models = buildTarget(poolConfig, 'models');
    expect(models.url.toString()).toBe('https://relay.example.dev/');
    expect(models.headers).toEqual({
      'x-relay-target': 'https://opencode.ai',
      'x-relay-path': '/zen/v1/models',
    });
  });

  test('a standard forward proxy (http) connects to native endpoint with tunnel agent', async () => {
    const poolConfig = config({
      proxyPools: [
        {
          id: 'forward-proxy',
          name: 'Clash Proxy',
          type: 'http',
          proxyUrl: 'http://127.0.0.1:7890',
          isActive: true,
        },
      ],
    });
    const native = await nativeRequest('blackrouter/big-pickle');
    const chat = buildTarget(poolConfig, 'chat', undefined, native.url);
    expect(chat.url.toString()).toBe('https://opencode.ai/inference/v1/chat/completions');
    expect(chat.headers).toEqual({});
    expect(chat.agent).toBeDefined();

    const models = buildTarget(poolConfig, 'models');
    expect(models.url.toString()).toBe('https://opencode.ai/zen/v1/models');
    expect(models.headers).toEqual({});
    expect(models.agent).toBeDefined();
  });

  test('an inactive proxy pool falls back to a direct call', () => {
    const poolConfig = config({
      proxyPools: [
        {
          id: 'inactive-cf',
          name: 'CF Relay',
          type: 'cloudflare',
          proxyUrl: 'https://relay.example.dev',
          isActive: false,
        },
      ],
    });
    expect(buildTarget(poolConfig, 'models').url.toString()).toBe('https://opencode.ai/zen/v1/models');
    expect(buildTarget(poolConfig, 'models').headers).toEqual({});
  });


  test('uses the current OpenCode CLI fingerprint when refreshing the free catalog', async () => {
    const captured = new Headers();
    const fakeFetch = async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      for (const [key, value] of new Headers(init?.headers).entries()) captured.set(key, value);
      return new Response(JSON.stringify({ data: [{ id: 'big-pickle' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };
    await fetchModelIds(config(), fakeFetch as typeof fetch);
    expect(captured.get('user-agent')).toBe('opencode/latest/2.1.4/cli');
  });

  test('loads a complete catalog from a custom OpenAI-compatible upstream', async () => {
    const capturedHeaders: string[] = [];
    const fakeFetch = async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const headers = new Headers(init?.headers);
      capturedHeaders.push(headers.get('authorization') ?? '', headers.get('user-agent') ?? '');
      return new Response(JSON.stringify({
        data: [{ id: 'gpt-5.6' }, { id: 'vendor/custom-model' }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    };
    const result = await fetchModelIds(config({
      upstream: 'https://api.example.com/v1',
      upstreamApiKey: 'sk-provider-secret',
    }), fakeFetch as typeof fetch);
    expect(result.ids).toEqual(['gpt-5.6', 'vendor/custom-model']);
    expect(result.free).toEqual(['gpt-5.6', 'vendor/custom-model']);
    expect(capturedHeaders).toEqual(['Bearer sk-provider-secret', 'BlackRouter/1.0']);
  });

  test('respects explicit poolOverride while preserving the native endpoint', async () => {
    const poolConfig = config();
    const specificPool = {
      id: 'custom-deno',
      name: 'Deno Relay',
      type: 'deno' as const,
      proxyUrl: 'https://custom-deno.deno.dev',
      isActive: true,
    };
    const native = await nativeRequest('blackrouter/big-pickle');
    const chat = buildTarget(poolConfig, 'chat', specificPool, native.url);
    expect(chat.url.toString()).toBe('https://custom-deno.deno.dev/');
    expect(chat.headers['x-relay-target']).toBe('https://opencode.ai');
  });

describe('downstream cancellation lifecycle', () => {
  const startServer = async (server: http.Server): Promise<{ url: string; close: () => Promise<void> }> => {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Fixture server did not bind a TCP port.');
    return {
      url: `http://127.0.0.1:${address.port}`,
      close: async () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
    };
  };

  const proxy = (upstreamUrl: string, response: http.ServerResponse) => proxyChatCompletion(
    config({ upstream: upstreamUrl }),
    's03-test-session',
    { body: JSON.stringify({ model: 'fixture-model', messages: [{ role: 'user', content: 'hello' }] }), stream: true, model: 'fixture-model' },
    response,
  );

  test('cancels an upstream request while waiting for the upstream response', async () => {
    let upstreamRequestClosedResolve!: () => void;
    const upstreamRequestClosed = new Promise<void>((resolve) => { upstreamRequestClosedResolve = resolve; });
    let receivedResolve!: () => void;
    const received = new Promise<void>((resolve) => { receivedResolve = resolve; });
    const upstream = http.createServer((request) => {
      request.socket.once('close', () => upstreamRequestClosedResolve());
      request.on('data', () => {});
      request.on('end', () => receivedResolve());
      // Do not answer: the client should cancel while this response is pending.
    });
    const up = await startServer(upstream);
    const router = http.createServer((_request, response) => proxy(up.url + '/v1', response));
    const rt = await startServer(router);
    const client = http.request(rt.url + '/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json' } });
    client.on('error', () => {});
    try {
      client.end(JSON.stringify({ model: 'fixture-model', messages: [{ role: 'user', content: 'hello' }], stream: true }));
      await Promise.race([received, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Upstream did not receive the request in time.')), 500))]);
      client.destroy();
      await Promise.race([upstreamRequestClosed, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Upstream request was not closed after downstream cancellation.')), 500))]);
      expect(client.destroyed).toBe(true);
    } finally {
      client.destroy();
      router.closeAllConnections();
      upstream.closeAllConnections();
      await Promise.all([rt.close(), up.close()]);
    }
  });

  test('cancels an active upstream response stream when the downstream disconnects', async () => {
    let upstreamResponseClosedResolve!: () => void;
    const upstreamResponseClosed = new Promise<void>((resolve) => { upstreamResponseClosedResolve = resolve; });
    const upstream = http.createServer((request, response) => {
      request.on('data', () => {});
      response.on('close', () => upstreamResponseClosedResolve());
      response.writeHead(200, { 'content-type': 'text/event-stream' });
      response.write('data: first\n\n');
      request.resume();
    });
    const up = await startServer(upstream);
    const router = http.createServer((_request, response) => proxy(up.url + '/v1', response));
    const rt = await startServer(router);
    const client = http.request(rt.url + '/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json' } });
    client.on('error', () => {});
    try {
      const firstChunk = new Promise<void>((resolve, reject) => {
        client.on('response', (response) => {
          response.on('data', () => resolve());
          response.on('error', reject);
        });
      });
      client.end(JSON.stringify({ model: 'fixture-model', messages: [{ role: 'user', content: 'hello' }], stream: true }));
      await Promise.race([firstChunk, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('No first upstream stream chunk arrived.')), 500))]);
      client.destroy();
      await Promise.race([upstreamResponseClosed, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Upstream response stream remained open after downstream cancellation.')), 500))]);
      expect(client.destroyed).toBe(true);
    } finally {
      client.destroy();
      router.closeAllConnections();
      upstream.closeAllConnections();
      await Promise.all([rt.close(), up.close()]);
    }
  });

  test('preserves normal completion when no cancellation occurs', async () => {
    const upstream = http.createServer((_request, response) => {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ id: 'fixture', choices: [] }));
    });
    const up = await startServer(upstream);
    const router = http.createServer((_request, response) => proxy(up.url + '/v1', response));
    const rt = await startServer(router);
    try {
      const result = await new Promise<{ status: number; body: string }>((resolve, reject) => {
        const request = http.request(rt.url + '/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json' } }, (response) => {
          let body = '';
          response.setEncoding('utf8');
          response.on('data', (chunk) => { body += chunk; });
          response.on('end', () => resolve({ status: response.statusCode ?? 0, body }));
        });
        request.on('error', reject);
        request.end(JSON.stringify({ model: 'fixture-model', messages: [{ role: 'user', content: 'hello' }], stream: true }));
      });
      expect(result.status).toBe(200);
      expect(JSON.parse(result.body).id).toBe('fixture');
    } finally {
      router.closeAllConnections();
      upstream.closeAllConnections();
      await Promise.all([rt.close(), up.close()]);
    }
  });
});

describe('HTTP CONNECT lifecycle', () => {
  const createStalledProxy = async (responseStatus?: number) => {
    const sockets = new Set<import('node:stream').Duplex>();
    const server = http.createServer();
    server.on('connect', (_request, socket) => {
      sockets.add(socket);
      socket.once('close', () => sockets.delete(socket));
      if (responseStatus === 407) socket.write('HTTP/1.1 407 Proxy Authentication Required\r\nContent-Length: 0\r\n\r\n');
      else {
        // Deliberately withhold the CONNECT response to reproduce a stuck handshake.
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Proxy fixture did not bind a TCP port.');
    return {
      url: `http://127.0.0.1:${address.port}`,
      sockets,
      close: async () => {
        for (const socket of sockets) socket.destroy();
        await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      },
    };
  };

  test('times out a stalled CONNECT handshake and closes the outer request', async () => {
    const proxy = await createStalledProxy();
    const agent = createTunnelAgent(proxy.url, 30);
    const request = https.request('https://example.invalid/', { agent });
    let errorCount = 0;
    try {
      const result = await new Promise<Error>((resolve, reject) => {
        request.once('response', () => reject(new Error('Unexpected HTTPS response from stalled proxy.')));
        request.on('error', (error) => { errorCount += 1; resolve(error); });
        request.end();
      });
      expect(result.message).toContain('Proxy CONNECT handshake timed out');
      expect(request.destroyed).toBe(true);
      expect(errorCount).toBe(1);
    } finally {
      agent.destroy();
      await proxy.close();
    }
  });

  test('propagates a rejected CONNECT response once and closes the outer request', async () => {
    const proxy = await createStalledProxy(407);
    const agent = createTunnelAgent(proxy.url, 500);
    const request = https.request('https://example.invalid/', { agent });
    let errorCount = 0;
    try {
      const error = await new Promise<Error>((resolve, reject) => {
        request.once('response', () => reject(new Error('Unexpected HTTPS response after proxy rejected CONNECT.')));
        request.on('error', (value) => { errorCount += 1; resolve(value); });
        request.end();
      });
      expect(error.message).toContain('failed with HTTP 407');
      expect(request.destroyed).toBe(true);
      expect(errorCount).toBe(1);
    } finally {
      agent.destroy();
      await proxy.close();
    }
  });

  test('destroying the agent cancels a pending CONNECT exactly once', async () => {
    const proxy = await createStalledProxy();
    const agent = createTunnelAgent(proxy.url, 2_000);
    const request = https.request('https://example.invalid/', { agent });
    let errorCount = 0;
    try {
      const failed = new Promise<Error>((resolve, reject) => {
        request.once('response', () => reject(new Error('Unexpected HTTPS response from stalled proxy.')));
        request.on('error', (error) => { errorCount += 1; resolve(error); });
        request.end();
      });
      await new Promise((resolve) => setTimeout(resolve, 20));
      agent.destroy();
      const error = await Promise.race([
        failed,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Agent destruction did not cancel CONNECT in time.')), 250)),
      ]);
      expect(error.message).toContain('tunnel agent was destroyed');
      expect(request.destroyed).toBe(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(errorCount).toBe(1);
    } finally {
      agent.destroy();
      await proxy.close();
    }
  });
});

describe('upstream response contract', () => {
  const startServer = async (server: http.Server): Promise<{ url: string; close: () => Promise<void> }> => {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Fixture server did not bind a TCP port.');
    return {
      url: `http://127.0.0.1:${address.port}`,
      close: async () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
    };
  };

  const send = (upstreamUrl: string, response: http.ServerResponse, stream: boolean) => proxyChatCompletion(
    config({ upstream: upstreamUrl }),
    's05-response-contract-session',
    {
      body: JSON.stringify({ model: 'fixture-model', messages: [{ role: 'user', content: 'hello' }], stream }),
      stream,
      model: 'fixture-model',
    },
    response,
  );

  test('preserves upstream non-2xx status and body for streaming clients before stream start', async () => {
    const upstreamBody = JSON.stringify({ error: { message: 'fixture unavailable', code: 'upstream_unavailable' } });
    const upstream = http.createServer((request, response) => {
      request.resume();
      response.writeHead(503, { 'content-type': 'application/json' });
      response.end(upstreamBody);
    });
    const up = await startServer(upstream);
    const router = http.createServer((_request, response) => send(up.url + '/v1', response, true));
    const rt = await startServer(router);
    try {
      const response = await fetch(rt.url + '/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'fixture-model', messages: [{ role: 'user', content: 'hello' }], stream: true }),
      });
      expect(response.status).toBe(503);
      expect(response.headers.get('content-type')).toContain('application/json');
      expect(await response.text()).toBe(upstreamBody);
    } finally {
      await Promise.all([up.close(), rt.close()]);
    }
  });

  test('terminates a streaming response after an upstream socket closes mid-SSE without a second response write', async () => {
    const firstFrame = 'data: ' + JSON.stringify({
      id: 'chatcmpl-s05-abrupt-close',
      object: 'chat.completion.chunk',
      created: 123,
      model: 'fixture-model',
      choices: [{ index: 0, delta: { content: 'partial' }, finish_reason: null }],
    }) + '\n\n';
    const upstream = http.createServer((request, response) => {
      request.resume();
      response.writeHead(200, { 'content-type': 'text/event-stream' });
      response.flushHeaders();
      response.write(firstFrame);
      setTimeout(() => response.socket?.destroy(), 250);
    });
    const up = await startServer(upstream);
    const router = http.createServer((_request, response) => send(up.url + '/v1', response, true));
    const rt = await startServer(router);
    try {
      const outcome = await new Promise<{ status: number; contentType: string; body: string; incomplete: boolean }>((resolve, reject) => {
        const request = http.request(rt.url + '/chat/completions', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
        }, (response) => {
          let body = '';
          response.setEncoding('utf8');
          response.on('data', (chunk: string) => { body += chunk; });
          response.on('aborted', () => resolve({
            status: response.statusCode ?? 0,
            contentType: String(response.headers['content-type'] ?? ''),
            body,
            incomplete: !response.complete,
          }));
          response.on('end', () => resolve({
            status: response.statusCode ?? 0,
            contentType: String(response.headers['content-type'] ?? ''),
            body,
            incomplete: !response.complete,
          }));
          response.on('error', (error) => reject(error));
        });
        request.on('error', reject);
        request.end(JSON.stringify({ model: 'fixture-model', messages: [{ role: 'user', content: 'hello' }], stream: true }));
      });
      expect(outcome.status).toBe(200);
      expect(outcome.contentType).toContain('text/event-stream');
      expect(outcome.body).toContain('partial');
      expect(outcome.incomplete).toBe(true);
      expect(outcome.body).not.toContain('upstream_unreachable');
    } finally {
      await Promise.all([up.close(), rt.close()]);
    }
  });

  test('preserves upstream non-2xx status, body and content type for non-streaming clients', async () => {
    const upstreamBody = JSON.stringify({ error: { message: 'fixture quota exceeded', code: 'quota_exhausted' } });
    const upstream = http.createServer((request, response) => {
      request.resume();
      response.writeHead(429, { 'content-type': 'application/json', 'x-fixture-upstream': 'quota' });
      response.end(upstreamBody);
    });
    const up = await startServer(upstream);
    const router = http.createServer((_request, response) => send(up.url + '/v1', response, false));
    const rt = await startServer(router);
    try {
      const response = await fetch(rt.url + '/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'fixture-model', messages: [{ role: 'user', content: 'hello' }] }),
      });
      expect(response.status).toBe(429);
      expect(response.headers.get('content-type')).toContain('application/json');
      expect(await response.text()).toBe(upstreamBody);
    } finally {
      await Promise.all([up.close(), rt.close()]);
    }
  });

  test('folds a successful SSE response into one JSON completion for non-streaming clients', async () => {
    const upstream = http.createServer((request, response) => {
      request.resume();
      response.writeHead(200, { 'content-type': 'text/event-stream' });
      response.end([
        'data: ' + JSON.stringify({
          id: 'chatcmpl-s05-fixture',
          object: 'chat.completion.chunk',
          created: 123,
          model: 'fixture-model',
          choices: [{ index: 0, delta: { content: 'Hello' }, finish_reason: null }],
        }),
        '',
        'data: ' + JSON.stringify({
          id: 'chatcmpl-s05-fixture',
          object: 'chat.completion.chunk',
          created: 123,
          model: 'fixture-model',
          choices: [{ index: 0, delta: { content: ' world' }, finish_reason: 'stop' }],
        }),
        '',
        'data: [DONE]',
        '',
      ].join('\n'));
    });
    const up = await startServer(upstream);
    const router = http.createServer((_request, response) => send(up.url + '/v1', response, false));
    const rt = await startServer(router);
    try {
      const response = await fetch(rt.url + '/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'fixture-model', messages: [{ role: 'user', content: 'hello' }] }),
      });
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
      const body = await response.json() as { id?: string; object?: string; model?: string; choices?: Array<{ message?: { content?: string }; finish_reason?: string }> };
      expect(body.id).toBe('chatcmpl-s05-fixture');
      expect(body.object).toBe('chat.completion');
      expect(body.model).toBe('fixture-model');
      expect(body.choices?.[0]?.message?.content).toBe('Hello world');
      expect(body.choices?.[0]?.finish_reason).toBe('stop');
    } finally {
      await Promise.all([up.close(), rt.close()]);
    }
  });
});

describe('SSE first-byte keepalive', () => {
  test('emits comments while idle and preserves subsequent SSE bytes', async () => {
    const source = new Readable({ read() {} });
    const chunks: Buffer[] = [];
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    });
    const finished = new Promise<void>((resolve, reject) => {
      pipeline(source, createSseFirstByteKeepAlive(5), destination, (error) => error ? reject(error) : resolve());
    });
    await new Promise((resolve) => setTimeout(resolve, 25));
    source.push(Buffer.from('data: {"choices":[]}\n\n'));
    source.push(null);
    await finished;
    const output = Buffer.concat(chunks).toString('utf8');
    expect(output).toContain(': ping\n\n');
    expect(output).toContain('data: {"choices":[]}\n\n');
  });

  test('stops heartbeats after the first upstream chunk', async () => {
    const source = new Readable({ read() {} });
    const chunks: Buffer[] = [];
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    });
    const finished = new Promise<void>((resolve, reject) => {
      pipeline(source, createSseFirstByteKeepAlive(5), destination, (error) => error ? reject(error) : resolve());
    });
    source.push(Buffer.from('data: first\n\n'));
    await new Promise((resolve) => setTimeout(resolve, 20));
    source.push(Buffer.from('data: second\n\n'));
    source.push(null);
    await finished;
    const output = Buffer.concat(chunks).toString('utf8');
    expect(output).toContain('data: first\n\n');
    expect(output).toContain('data: second\n\n');
    expect(output).not.toContain(': ping\n\n');
  });

  test('disables heartbeats at zero milliseconds', async () => {
    const source = new Readable({ read() {} });
    const chunks: Buffer[] = [];
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    });
    const finished = new Promise<void>((resolve, reject) => {
      pipeline(source, createSseFirstByteKeepAlive(0), destination, (error) => error ? reject(error) : resolve());
    });
    await new Promise((resolve) => setTimeout(resolve, 15));
    source.push(Buffer.from('data: only\n\n'));
    source.push(null);
    await finished;
    expect(Buffer.concat(chunks).toString('utf8')).not.toContain(': ping\n\n');
  });
});

});