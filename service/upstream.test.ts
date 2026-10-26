import { describe, expect, test } from 'bun:test';
import { pipeline, Readable, Writable } from 'node:stream';

import type { RouterConfig } from '../contract.ts';
import { buildTarget, createSseFirstByteKeepAlive, fetchModelIds, freeModelIds, hasSameUpstreamOrigin, humanizeModelId, isFreeModel, isOpenCodeUpstream, toModels } from './upstream.ts';
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