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
};
export function getCapabilitiesForModel(_provider, model) {
  const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
  const id = clean.includes("/") ? clean.split("/").pop() : clean;
  return CAPABILITIES[id] || { reasoning: false, maxOutput: 64000 };
}
