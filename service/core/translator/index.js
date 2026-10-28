// Narrow registry for the native translators used by the selected provider.
// Lazy initialization is required because the upstream translator modules self-register
// through a circular import before this module body is evaluated.
var requestRegistry;
var responseRegistry;

export function register(from, to, requestFn, responseFn) {
  requestRegistry ??= new Map();
  responseRegistry ??= new Map();
  const key = String(from) + ":" + String(to);
  if (requestFn) requestRegistry.set(key, requestFn);
  if (responseFn) responseRegistry.set(key, responseFn);
}

// These native upstream modules register themselves through side effects.
import "./request/openai-responses.js";
import "./request/openai-to-claude.js";

export function translateRequest(sourceFormat, targetFormat, model, body, stream = true, credentials = null) {
  requestRegistry ??= new Map();
  responseRegistry ??= new Map();
  if (sourceFormat === targetFormat) return body;

  const translator = requestRegistry.get(String(sourceFormat) + ":" + String(targetFormat));
  if (!translator) {
    throw new Error("Unsupported native request translation: " + sourceFormat + " -> " + targetFormat);
  }
  return translator(model, body, stream, credentials);
}

export const registeredRequestPairs = () => {
  requestRegistry ??= new Map();
  return [...requestRegistry.keys()];
};
