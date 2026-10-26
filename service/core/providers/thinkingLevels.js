// Scoped upstream thinking-level resolver for the OpenCode Free provider slice.
// Muse Spark declares the upstream OpenAI effort levels; other selected models
// do not currently publish a reasoning picker in this core.
const OPENAI_LEVELS = ["none", "minimal", "low", "medium", "high", "xhigh"];
export function getThinkingLevels(provider, model) {
  if (provider !== "opencode") return null;
  const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
  const id = clean.includes("/") ? clean.split("/").pop() : clean;
  return /^muse[-_]?spark(?:$|[-_:.\s])/i.test(id) ? OPENAI_LEVELS : null;
}
