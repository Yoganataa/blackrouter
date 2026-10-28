// Scoped thinking levels derived from the upstream provider capability contract.
import { getCapabilitiesForModel } from "./capabilities.js";

const OPENAI_LEVELS = ["none", "minimal", "low", "medium", "high", "xhigh"];
const OPENAI_LEVELS_WITH_MAX = ["none", "minimal", "low", "medium", "high", "xhigh", "max"];
const DEEPSEEK_FREE_LEVELS = ["low", "high", "max"];

const MODEL_LEVELS = {
  // OpenCode routes this model through an OpenRouter-backed free lane and
  // accepts the complete OpenAI effort enum verbatim (official 9Router #b833128).
  "mimo-v2.6-flash-free": OPENAI_LEVELS_WITH_MAX,
  // The free DeepSeek v4.1 lane accepts low/high/max instead of the generic
  // DeepSeek collapse (official 9Router #313559f).
  "deepseek-v4.1-flash-free": DEEPSEEK_FREE_LEVELS,
};

export function getThinkingLevels(provider, model) {
  if (provider !== "opencode") return null;
  const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
  const id = clean.includes("/") ? clean.split("/").pop() : clean;
  const capabilities = getCapabilitiesForModel(provider, id);
  if (!capabilities.reasoning) return null;

  const levels = MODEL_LEVELS[id]
    || (capabilities.thinkingFormat === "openai" ? OPENAI_LEVELS
      : capabilities.thinkingFormat === "deepseek" ? DEEPSEEK_FREE_LEVELS : null);
  if (!levels) return null;
  return capabilities.thinkingCanDisable === false ? levels.filter((level) => level !== "none") : levels;
}
