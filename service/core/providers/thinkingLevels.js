// Scoped thinking levels derived from the upstream provider capability contract.
import { getCapabilitiesForModel } from "./capabilities.js";

const OPENAI_LEVELS = ["none", "minimal", "low", "medium", "high", "xhigh"];

export function getThinkingLevels(provider, model) {
  if (provider !== "opencode") return null;
  const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
  const id = clean.includes("/") ? clean.split("/").pop() : clean;
  const capabilities = getCapabilitiesForModel(provider, id);
  if (!capabilities.reasoning) return null;
  return capabilities.thinkingFormat === "openai" ? OPENAI_LEVELS : null;
}
