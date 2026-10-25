import type { ProxyPool, RouterConfig } from '../contract.ts';

export type PoolSelector = {
  pickPool(
    config: Pick<RouterConfig, 'proxyPools' | 'proxyStrategy' | 'activePoolId' | 'stickyLimit'>,
  ): ProxyPool | null;
  reset(): void;
};

/**
 * Manages upstream proxy pool routing strategies (single, round-robin, random).
 *
 * - single: routes always through activePoolId, or the first active pool.
 * - random: uniform random pick across all active pools per request.
 * - round-robin: rotates sequentially through active pools, respecting stickyLimit.
 */
export const createPoolSelector = (): PoolSelector => {
  let currentPoolId: string | null = null;
  let consecutiveCount = 0;
  let lastIndex = -1;

  const reset = (): void => {
    currentPoolId = null;
    consecutiveCount = 0;
    lastIndex = -1;
  };

  const pickPool = (
    config: Pick<RouterConfig, 'proxyPools' | 'proxyStrategy' | 'activePoolId' | 'stickyLimit'>,
  ): ProxyPool | null => {
    const active = (config.proxyPools || []).filter((p) => p.isActive && p.proxyUrl.trim());
    if (active.length === 0) {
      reset();
      return null;
    }

    const now = Date.now();
    const available = active.filter((p) => !p.rateLimitedUntil || p.rateLimitedUntil <= now);
    // Never send traffic to a pool while it is in its rate-limit cooldown.
    // `null` lets callers make an explicit direct request or report that all pools are cooling down.
    const pools = available;

    if (pools.length === 0) {
      reset();
      return null;
    }

    const strategy = config.proxyStrategy || 'single';

    if (strategy === 'single') {
      if (config.activePoolId) {
        const designated = pools.find((p) => p.id === config.activePoolId);
        if (designated) return designated;
      }
      return pools[0] ?? null;
    }

    if (strategy === 'random') {
      const randomIndex = Math.floor(Math.random() * pools.length);
      return pools[randomIndex] ?? null;
    }

    // round-robin
    const stickyLimit = Math.max(1, config.stickyLimit || 1);
    const currentIndex = currentPoolId ? pools.findIndex((p) => p.id === currentPoolId) : -1;

    if (currentIndex !== -1 && consecutiveCount < stickyLimit) {
      consecutiveCount += 1;
      return pools[currentIndex] ?? null;
    }

    const nextIndex = (lastIndex + 1) % pools.length;
    const picked = pools[nextIndex] ?? null;
    if (picked) {
      currentPoolId = picked.id;
      consecutiveCount = 1;
      lastIndex = nextIndex;
    }
    return picked;
  };

  return { pickPool, reset };
};
