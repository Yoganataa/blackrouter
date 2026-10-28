// Scoped subset of the upstream capability table for OpenCode Free models.
const CAPABILITIES = {
  "muse-spark-1.2-contributor-free": {
    vision: true, reasoning: true, thinkingFormat: "openai",
    contextWindow: 1048576, maxOutput: 131072,
  },
  "muse-spark-1.3-contributor-free": {
    vision: true, reasoning: true, thinkingFormat: "openai",
    contextWindow: 1048576, maxOutput: 131072,
  },
  "union-alpha": { vision: true, contextWindow: 262144, maxOutput: 131072 },
  // Free-lane overrides aligned with official 9Router OpenCode fixes:
  // #32c5f30 (GLM wire format), #b833128 (MiMo reasoning), #5179 (DeepSeek cap).
  "glm-5.3-flash-free": {
    vision: true, videoInput: true, pdf: true, reasoning: true,
    thinkingFormat: "openai", thinkingCanDisable: false,
    contextWindow: 1000000, maxOutput: 128000,
  },
  "mimo-v2.6-flash-free": {
    vision: true, audioInput: true, videoInput: true, reasoning: true,
    thinkingFormat: "openai", thinkingCanDisable: true,
    contextWindow: 1048576, maxOutput: 131072,
  },
  "deepseek-v4.1-flash-free": {
    vision: true, reasoning: true, thinkingFormat: "deepseek",
    contextWindow: 330000, maxOutput: 128000,
  },
};
export function getCapabilitiesForModel(_provider, model) {
  const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
  const id = clean.includes("/") ? clean.split("/").pop() : clean;
  return CAPABILITIES[id] || { reasoning: false, contextWindow: 200000, maxOutput: 64000 };
}
