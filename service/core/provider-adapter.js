import { OpenCodeExecutor, generateSessionId } from "./executors/opencode.js";
import { FORMATS } from "./translator/formats.js";
import { translateRequest } from "./translator/index.js";

const cleanModelId = (model) => String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
const targetFormatForModel = (model) => {
  const clean = cleanModelId(model);
  const base = clean.includes("/") ? clean.split("/").pop() : clean;
  if (/^muse[-_]?spark(?:$|[-_:.\\s])/i.test(base)) return FORMATS.OPENAI_RESPONSES;
  if (/^union[-_]?alpha(?:$|[-_:.\\s])/i.test(base)) return FORMATS.CLAUDE;
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
  const targetFormat = targetFormatForModel(model);
  const credentials = {
    connectionId: session,
    rawHeaders: { ...rawHeaders, "x-opencode-session": session },
    providerSpecificData: {},
  };
  const sourceBody = { ...body, model };
  const translatedBody = targetFormat === FORMATS.OPENAI
    ? sourceBody
    : translateRequest(FORMATS.OPENAI, targetFormat, model, sourceBody, true, credentials);

  const executor = new OpenCodeExecutor();
  const prepared = await executor.execute({
    model,
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
