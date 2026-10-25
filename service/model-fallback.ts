/**
 * Pure helpers for bounded, ordered model failover.
 *
 * Proxy pools change the network path; model fallback changes the requested
 * model. Keep those two concepts separate so a list of relays cannot create an
 * unbounded request loop.
 */

export const MAX_FALLBACK_MODELS = 2;
export const MAX_MODELS_PER_REQUEST = MAX_FALLBACK_MODELS + 1;

export const canonicalModelId = (modelId: string): string => {
  const trimmed = modelId.trim().replace(/\([^()]+\)\s*$/, '').trim();
  const bare = trimmed.includes('/') ? trimmed.split('/').pop() ?? trimmed : trimmed;
  return bare.toLowerCase();
};

export const resolveModelCandidates = (
  requestedModel: string,
  configuredFallbacks: readonly string[] = [],
): string[] => {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const model of [requestedModel, ...configuredFallbacks].slice(0, 1 + MAX_FALLBACK_MODELS)) {
    const cleaned = model.trim();
    const canonical = canonicalModelId(cleaned);
    if (!cleaned || !canonical || seen.has(canonical)) continue;
    seen.add(canonical);
    result.push(cleaned);
  }
  return result;
};

/**
 * Only transient/upstream model-availability failures trigger a fallback.
 * Auth failures and malformed requests should be surfaced rather than hidden.
 */
export const isRetryableFallbackStatus = (status: number): boolean =>
  status === 404 ||
  status === 408 ||
  status === 429 ||
  status === 500 ||
  status === 502 ||
  status === 503 ||
  status === 504;
