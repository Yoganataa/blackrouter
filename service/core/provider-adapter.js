import { OpenCodeExecutor, generateSessionId } from "./executors/opencode.js";
import { FORMATS } from "./translator/formats.js";
import { translateRequest } from "./translator/index.js";
import { PROVIDERS } from "./config/providers.js";
import { opencodeFamilyFormats } from "./providers/models/helpers.js";

const cleanModelId = (model) => {
  const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
  return clean.startsWith("blackrouter/") ? clean.slice("blackrouter/".length) : clean;
};
const targetFormatForModel = (model) => {
  const base = cleanModelId(model);
  const registryEntry = (PROVIDERS.opencode.models || []).find((entry) => entry.id === base);
  if (registryEntry?.targetFormat) return registryEntry.targetFormat;
  const family = opencodeFamilyFormats(base);
  if (family?.targetFormat) return family.targetFormat;
  if (family?.supportedFormats?.length === 1) return family.supportedFormats[0];
  return FORMATS.OPENAI;
};

const normalizeHeaders = (headers) => Object.fromEntries(
  Object.entries(headers || {}).map(([key, value]) => [key.toLowerCase(), String(value)]),
);

/**
 * Prepare a request using the native OpenCode provider executor and native
 * request translators. BlackRouter only supplies a dispatch adapter so its
 * direct/HTTP/relay pool transport remains intact.
 */
export const prepareProviderRequest = async ({ model, body, session, rawHeaders = {} }) => {
  const upstreamModel = cleanModelId(model);
  const targetFormat = targetFormatForModel(upstreamModel);
  const credentials = {
    connectionId: session,
    rawHeaders: { ...rawHeaders, "x-opencode-session": session },
    providerSpecificData: {},
  };
  const sourceBody = { ...body, model: upstreamModel };
  const translatedBody = targetFormat === FORMATS.OPENAI
    ? sourceBody
    : translateRequest(FORMATS.OPENAI, targetFormat, upstreamModel, sourceBody, true, credentials);

  const executor = new OpenCodeExecutor();
  const prepared = await executor.execute({
    model: upstreamModel,
    body: translatedBody,
    stream: true,
    credentials,
    providerSessionId: session,
    clientTool: "generic",
    dispatch: async ({ url, headers, body: outboundBody, responseFormat }) => ({
      url: new URL(url),
      headers: normalizeHeaders(headers),
      body: JSON.stringify(outboundBody),
      responseFormat,
      lane: responseFormat === "openai-responses" ? "responses" : responseFormat === "claude" ? "messages" : "chat",
    }),
  });
  return prepared;
};

export { generateSessionId };
