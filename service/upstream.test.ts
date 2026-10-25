import { describe, expect, test } from 'bun:test';

import type { RouterConfig } from '../contract.ts';
import { buildTarget, fetchModelIds, freeModelIds, humanizeModelId, isFreeModel, isOpenCodeUpstream, toModels } from './upstream.ts';

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

describe('where a call goes', () => {
  test('direct calls route to opencode v2 endpoints', () => {
    const models = buildTarget(config(), 'models');
    expect(models.url.toString()).toBe('https://opencode.ai/zen/v1/models');
    expect(models.headers).toEqual({});

    const chat = buildTarget(config({ upstream: 'https://opencode.ai/zen/v1/' }), 'chat');
    expect(chat.url.toString()).toBe('https://opencode.ai/inference/v1/chat/completions');

    const museChat = buildTarget(config(), 'chat', null, 'muse-spark-1.3-contributor-free');
    expect(museChat.url.toString()).toBe('https://opencode.ai/inference/v1/responses');

    const unionChat = buildTarget(config(), 'chat', null, 'union-alpha');
    expect(unionChat.url.toString()).toBe('https://opencode.ai/inference/v1/messages');

    const custom = buildTarget(config({ upstream: 'https://custom-gateway.local/v1' }), 'chat');
    expect(custom.url.toString()).toBe('https://custom-gateway.local/v1/chat/completions');
  });

  test('detects the official OpenCode host without accepting lookalike hostnames', () => {
    expect(isOpenCodeUpstream('https://opencode.ai/zen/v1')).toBe(true);
    expect(isOpenCodeUpstream('https://api.opencode.ai/v1')).toBe(true);
    expect(isOpenCodeUpstream('https://notopencode.ai/v1')).toBe(false);
    expect(isOpenCodeUpstream('https://example.com/opencode.ai/v1')).toBe(false);
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

  test('a proxy pool takes x-relay-target and x-relay-path matching 9router spec', () => {
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
    const chat = buildTarget(poolConfig, 'chat');
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

  test('a standard forward proxy (http) connects to upstream with tunnel agent', () => {
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
    const chat = buildTarget(poolConfig, 'chat');
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

  test('respects explicit poolOverride passed from pool selector', () => {
    const poolConfig = config();
    const specificPool = {
      id: 'custom-deno',
      name: 'Deno Relay',
      type: 'deno' as const,
      proxyUrl: 'https://custom-deno.deno.dev',
      isActive: true,
    };
    const chat = buildTarget(poolConfig, 'chat', specificPool);
    expect(chat.url.toString()).toBe('https://custom-deno.deno.dev/');
    expect(chat.headers['x-relay-target']).toBe('https://opencode.ai');
  });
});
