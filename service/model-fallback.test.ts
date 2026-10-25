import { describe, expect, test } from 'bun:test';

import {
  canonicalModelId,
  isRetryableFallbackStatus,
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

  test('only retries eligible upstream errors', () => {
    for (const status of [404, 408, 429, 500, 502, 503, 504]) {
      expect(isRetryableFallbackStatus(status)).toBe(true);
    }
    for (const status of [200, 400, 401, 403, 422]) {
      expect(isRetryableFallbackStatus(status)).toBe(false);
    }
  });
});
