// Minimal native translator registry, scoped to the two non-Chat endpoint formats
// used by the selected OpenCode Free models.
const requestRegistry = new Map();
const responseRegistry = new Map();

export function register(from, to, requestFn, responseFn) {
  const key = `${from}:${to}`;
  if (requestFn) requestRegistry.set(key, requestFn);
  if (responseFn) responseRegistry.set(key, responseFn);
}

import "./request/openai-responses.js";
import "./request/openai-to-claude.js";

export function translateRequest(sourceFormat, targetFormat, model, body, stream = true, credentials = null) {
  if (sourceFormat === targetFormat) return body;
  const translator = requestRegistry.get(`${sourceFormat}:${targetFormat}`);
  if (!translator) throw new Error(`Unsupported native request translation: ${sourceFormat} -> ${targetFormat}`);
  return translator(model, body, stream, credentials);
}

export const registeredRequestPairs = () => [...requestRegistry.keys()];
