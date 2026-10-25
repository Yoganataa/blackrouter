import { describe, expect, it } from 'bun:test';

import type { ProxyPool, RouterConfig } from '../contract.ts';
import { createPoolSelector } from './pool-selector.ts';

const pool = (id: string, name: string, type: 'http' | 'cloudflare' = 'cloudflare', isActive = true): ProxyPool => ({
  id,
  name,
  type,
  proxyUrl: `https://${id}.example.com`,
  isActive,
});

const baseConfig = (overrides: Partial<RouterConfig> = {}): RouterConfig => ({
  version: 1,
  port: 20128,
  apiKey: 'test-key',
  upstream: 'https://opencode.ai/zen/v1',
  selectedModels: [],
  fallbackModels: [],
  proxyPools: [pool('p1', 'Pool 1'), pool('p2', 'Pool 2'), pool('p3', 'Pool 3')],
  proxyStrategy: 'single',
  activePoolId: null,
  stickyLimit: 1,
  rtkEnabled: true,
  ...overrides,
});

describe('PoolSelector', () => {
  it('returns null when no proxy pools are active', () => {
    const selector = createPoolSelector();
    const config = baseConfig({
      proxyPools: [pool('p1', 'Pool 1', 'cloudflare', false)],
    });
    expect(selector.pickPool(config)).toBeNull();
  });

  describe('single pool strategy', () => {
    it('returns the first active pool when activePoolId is not specified', () => {
      const selector = createPoolSelector();
      const config = baseConfig({ proxyStrategy: 'single', activePoolId: null });
      expect(selector.pickPool(config)?.id).toBe('p1');
      expect(selector.pickPool(config)?.id).toBe('p1');
    });

    it('returns the designated pool when activePoolId matches an active pool', () => {
      const selector = createPoolSelector();
      const config = baseConfig({ proxyStrategy: 'single', activePoolId: 'p2' });
      expect(selector.pickPool(config)?.id).toBe('p2');
    });

    it('falls back to the first active pool if activePoolId points to an inactive or non-existent pool', () => {
      const selector = createPoolSelector();
      const config = baseConfig({
        proxyStrategy: 'single',
        activePoolId: 'non-existent',
      });
      expect(selector.pickPool(config)?.id).toBe('p1');
    });
  });

  describe('random strategy', () => {
    it('picks from available active pools', () => {
      const selector = createPoolSelector();
      const config = baseConfig({ proxyStrategy: 'random' });
      const ids = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const picked = selector.pickPool(config);
        expect(picked).not.toBeNull();
        if (picked) ids.add(picked.id);
      }
      expect(ids.size).toBeGreaterThan(1);
    });
  });

  describe('round-robin strategy', () => {
    it('cycles sequentially through active pools with stickyLimit = 1', () => {
      const selector = createPoolSelector();
      const config = baseConfig({ proxyStrategy: 'round-robin', stickyLimit: 1 });

      expect(selector.pickPool(config)?.id).toBe('p1');
      expect(selector.pickPool(config)?.id).toBe('p2');
      expect(selector.pickPool(config)?.id).toBe('p3');
      expect(selector.pickPool(config)?.id).toBe('p1');
      expect(selector.pickPool(config)?.id).toBe('p2');
    });

    it('honors stickyLimit > 1 before rotating', () => {
      const selector = createPoolSelector();
      const config = baseConfig({ proxyStrategy: 'round-robin', stickyLimit: 2 });

      expect(selector.pickPool(config)?.id).toBe('p1');
      expect(selector.pickPool(config)?.id).toBe('p1');

      expect(selector.pickPool(config)?.id).toBe('p2');
      expect(selector.pickPool(config)?.id).toBe('p2');

      expect(selector.pickPool(config)?.id).toBe('p3');
      expect(selector.pickPool(config)?.id).toBe('p3');

      expect(selector.pickPool(config)?.id).toBe('p1');
    });

    it('skips pools that are currently rate-limited', () => {
      const selector = createPoolSelector();
      const future = Date.now() + 60_000;
      const config = baseConfig({
        proxyStrategy: 'round-robin',
        stickyLimit: 1,
        proxyPools: [
          { ...pool('p1', 'Pool 1'), rateLimitedUntil: future },
          pool('p2', 'Pool 2'),
          pool('p3', 'Pool 3'),
        ],
      });

      expect(selector.pickPool(config)?.id).toBe('p2');
      expect(selector.pickPool(config)?.id).toBe('p3');
      expect(selector.pickPool(config)?.id).toBe('p2');
    });
  });

  it('returns null rather than reusing pools when every active pool is cooling down', () => {
    const selector = createPoolSelector();
    const future = Date.now() + 60_000;
    const config = baseConfig({
      proxyStrategy: 'single',
      proxyPools: [
        { ...pool('p1', 'Pool 1'), rateLimitedUntil: future },
        { ...pool('p2', 'Pool 2'), rateLimitedUntil: future },
      ],
    });
    expect(selector.pickPool(config)).toBeNull();
  });

  it('skips the designated pool if it is cooling down and selects a healthy pool', () => {
    const selector = createPoolSelector();
    const future = Date.now() + 60_000;
    const config = baseConfig({
      proxyStrategy: 'single',
      activePoolId: 'p1',
      proxyPools: [
        { ...pool('p1', 'Pool 1'), rateLimitedUntil: future },
        pool('p2', 'Pool 2'),
      ],
    });
    expect(selector.pickPool(config)?.id).toBe('p2');
  });

});
