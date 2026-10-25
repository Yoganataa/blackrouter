import type { ModelCombo, RouterModel } from '../contract.ts';

/**
 * Pure helpers for bounded, ordered model failover.
 *
 * Proxy pools change the network path; model fallback changes the requested
 * model. Keep those two concepts separate so a list of relays cannot create an
 * unbounded request loop.
 */

export const MAX_FALLBACK_MODELS = 2;
export const MAX_MODELS_PER_REQUEST = MAX_FALLBACK_MODELS + 1;
export const MAX_COMBO_MODELS = 6;

/** The model ID OpenCode registers for one named BlackRouter combo. */
export const modelComboModelId = (comboId: string): string => `combo/${comboId.trim().toLowerCase()}`;

export const canonicalModelId = (modelId: string): string => {
  const trimmed = modelId.trim().replace(/\([^()]+\)\s*$/, '').trim();
  const upstreamId = trimmed.startsWith('blackrouter/') ? trimmed.slice('blackrouter/'.length) : trimmed;
  return upstreamId.toLowerCase();
};

const uniqueModelIds = (models: readonly string[], limit: number): string[] => {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const model of models) {
    const cleaned = model.trim();
    const canonical = canonicalModelId(cleaned);
    if (!cleaned || !canonical || seen.has(canonical)) continue;
    seen.add(canonical);
    result.push(cleaned);
    if (result.length >= limit) break;
  }
  return result;
};

export const resolveModelCandidates = (
  requestedModel: string,
  configuredFallbacks: readonly string[] = [],
  modelCombos: readonly ModelCombo[] = [],
): string[] => {
  const requestedCanonical = canonicalModelId(requestedModel);
  const combo = modelCombos.find(
    (candidate) => canonicalModelId(modelComboModelId(candidate.id)) === requestedCanonical,
  );
  if (combo) {
    // A named combo owns its chain: do not silently mix in the global fallback list.
    return uniqueModelIds(combo.models, MAX_COMBO_MODELS);
  }
  return uniqueModelIds([requestedModel, ...configuredFallbacks], 1 + MAX_FALLBACK_MODELS);
};

/** Build the client-visible alias metadata from the combo's primary member model. */
export const buildComboRouterModels = (
  combos: readonly ModelCombo[],
  availableModels: readonly RouterModel[],
): RouterModel[] => combos.map((combo) => {
  const primaryId = combo.models[0] ?? '';
  const primary = availableModels.find(
    (model) => canonicalModelId(model.id) === canonicalModelId(primaryId),
  );
  return {
    id: modelComboModelId(combo.id),
    name: combo.name,
    ...(primary?.limit ? { limit: primary.limit } : {}),
    ...(primary?.capabilities ? { capabilities: primary.capabilities } : {}),
    ...(primary?.variants ? { variants: primary.variants } : {}),
  };
});

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
