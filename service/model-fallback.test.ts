import { describe, expect, test } from 'bun:test';

import { modelCombosSchema } from '../contract.ts';

import {
  buildComboRouterModels,
  canonicalModelId,
  isRetryableFallbackStatus,
  shouldAdvanceAfterStatus,
  modelComboModelId,
  resolveModelCandidates,
} from './model-fallback.ts';

describe('model fallback', () => {
  test('keeps requested model first and preserves fallback order', () => {
    expect(resolveModelCandidates('primary-free', ['fallback-a-free', 'fallback-b-free'])).toEqual([
      'primary-free',
      'fallback-a-free',
      'fallback-b-free',
    ]);
  });

  test('deduplicates provider-qualified ids and model variants', () => {
    expect(canonicalModelId('blackrouter/model-free(high)')).toBe('model-free');
    expect(resolveModelCandidates('blackrouter/model-free', ['model-free(high)', 'other-free'])).toEqual([
      'blackrouter/model-free',
      'other-free',
    ]);
  });

  test('limits the request to the primary plus two fallback models', () => {
    expect(resolveModelCandidates('primary', ['a', 'b', 'c', 'd'])).toEqual(['primary', 'a', 'b']);
  });

  test('does not conflate differently namespaced upstream models', () => {
    expect(resolveModelCandidates('vendor-a/model', ['vendor-b/model'])).toEqual([
      'vendor-a/model',
      'vendor-b/model',
    ]);
  });

  test('resolves a named combo alias to its ordered member models', () => {
    const combos = [{
      id: 'fast-coding',
      name: 'Fast Coding',
      models: ['glm-5.3-flash-free', 'deepseek-v4.1-flash-free', 'mimo-v2.6-flash-free'],
    }];
    expect(modelComboModelId('Fast-Coding')).toBe('combo/fast-coding');
    expect(resolveModelCandidates('blackrouter/combo/fast-coding', ['global-fallback'], combos)).toEqual([
      'glm-5.3-flash-free',
      'deepseek-v4.1-flash-free',
      'mimo-v2.6-flash-free',
    ]);
  });

  test('deduplicates combo members and keeps alias metadata from the primary model', () => {
    const combos = [{
      id: 'quick',
      name: 'Quick',
      models: ['glm-5.3-flash-free', 'GLM-5.3-FLASH-FREE', 'deepseek-v4.1-flash-free'],
    }];
    expect(resolveModelCandidates('combo/quick', [], combos)).toEqual([
      'glm-5.3-flash-free',
      'deepseek-v4.1-flash-free',
    ]);
    const primary = {
      id: 'glm-5.3-flash-free',
      name: 'GLM 5.3 Flash',
      limit: { context: 1000000, output: 128000 },
      capabilities: { tools: true, input: ['text', 'image'], output: ['text'] },
    };
    expect(buildComboRouterModels(combos, [primary])).toEqual([{
      id: 'combo/quick',
      name: 'Quick',
      limit: primary.limit,
      capabilities: primary.capabilities,
    }]);
  });

  test('validates combo size, unique model IDs, and unique combo slugs', () => {
    const valid = { id: 'fast-coding', name: 'Fast Coding', models: ['model-a', 'model-b'] };
    expect(modelCombosSchema.safeParse([valid]).success).toBe(true);
    expect(modelCombosSchema.safeParse([{ ...valid, models: ['model-a'] }]).success).toBe(false);
    expect(modelCombosSchema.safeParse([{ ...valid, models: ['model-a', 'MODEL-A'] }]).success).toBe(false);
    expect(modelCombosSchema.safeParse([valid, { ...valid, name: 'Duplicate ID' }]).success).toBe(false);
    expect(modelCombosSchema.safeParse([{ ...valid, id: 'Not A Slug' }]).success).toBe(false);
  });

  test('only retries eligible upstream errors', () => {
    for (const status of [404, 408, 429, 500, 502, 503, 504]) {
      expect(isRetryableFallbackStatus(status)).toBe(true);
    }
    for (const status of [200, 400, 401, 403, 422]) {
      expect(isRetryableFallbackStatus(status)).toBe(false);
    }
  });

  test('does not fan a direct upstream 429 out to more models without a short Retry-After', () => {
    expect(shouldAdvanceAfterStatus(429, false)).toBe(false);
    expect(shouldAdvanceAfterStatus(429, false, true)).toBe(true);
    expect(shouldAdvanceAfterStatus(429, true)).toBe(true);
  });

  test('continues bounded fallback for other transient upstream failures', () => {
    for (const status of [404, 408, 500, 502, 503, 504]) {
      expect(shouldAdvanceAfterStatus(status, false)).toBe(true);
    }
    for (const status of [200, 400, 401, 403, 422]) {
      expect(shouldAdvanceAfterStatus(status, true)).toBe(false);
    }
  });
});
