import { OpenCodeExecutor, generateSessionId } from "./executors/opencode.js";
import { FORMATS } from "./translator/formats.js";
import { translateRequest } from "./translator/index.js";
import { PROVIDERS } from "./config/providers.js";
import { takeRenamedToolNames } from "./utils/opencodeFingerprint.js";
import { isMuseSparkModel } from "./providers/models/helpers.js";

const cleanModelId = (model) => {
  const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
  return clean.startsWith("blackrouter/") ? clean.slice("blackrouter/".length) : clean;
};
const targetFormatForModel = (model) => {
  const base = cleanModelId(model);
  const registryEntry = (PROVIDERS.opencode.models || []).find((entry) => entry.id === base);
  // Match the native OpenCode executor: the curated registry selects explicit
  // targets, and its native Muse Spark predicate covers future catalog variants.
  if (registryEntry?.targetFormat) return registryEntry.targetFormat;
  return isMuseSparkModel(base) ? FORMATS.OPENAI_RESPONSES : FORMATS.OPENAI;
};

const normalizeHeaders = (headers) => Object.fromEntries(
  Object.entries(headers || {}).map(([key, value]) => [key.toLowerCase(), String(value)]),
);

const toolNameOf = (tool) => {
  if (!tool || typeof tool !== "object") return "";
  if (typeof tool.name === "string") return tool.name;
  if (typeof tool.function?.name === "string") return tool.function.name;
  return "";
};

const inferToolNameMap = (sourceNames, transformedBody) => {
  const map = new Map();
  const transformedTools = Array.isArray(transformedBody?.tools) ? transformedBody.tools : [];
  const transformedNames = new Set(transformedTools.map(toolNameOf).filter(Boolean));

  for (const originalName of ["read", "shell"]) {
    if (!sourceNames.has(originalName)) continue;

    // The native helper only aliases conflicting caller definitions to this family.
    // Do not map an alias that was itself already declared by the caller.
    const aliasPrefix = originalName + "_client";
    const alias = [...transformedNames]
      .filter((name) => {
        if (!name.startsWith(aliasPrefix) || sourceNames.has(name)) return false;
        const suffix = name.slice(aliasPrefix.length);
        return suffix === "" || [...suffix].every((digit) => digit >= "0" && digit <= "9");
      })[0];
    if (alias) map.set(alias, originalName);
  }
  return map;
};


/**
 * The native executor currently appends fingerprint placeholders in OpenAI
 * Chat shape for every non-Responses body. After the native OpenAI -> Claude
 * translator, normalize only those appended placeholders to Messages shape.
 */
const normalizeMessagesFingerprintTools = (body) => {
  if (!body || typeof body !== "object" || !Array.isArray(body.tools)) return body;

  const injectedNames = [];
  body.tools = body.tools.map((tool) => {
    const fn = tool?.function;
    if (!fn || !["read", "shell"].includes(fn.name)) return tool;
    injectedNames.push(fn.name);
    return {
      name: fn.name,
      description: fn.description,
      input_schema: fn.parameters || { type: "object", properties: {} },
    };
  });

  if (injectedNames.length > 0) {
    const names = [...new Set(injectedNames)];
    const list = names.length > 1 ? "read and shell" : names[0];
    const note = names.length > 1
      ? "Do not call the " + list + " tools; they are placeholders that do nothing. Use the other tools you have been given instead."
      : "Do not call the " + list + " tool; it is a placeholder that does nothing. Use the other tools you have been given instead.";
    if (typeof body.system === "string" && body.system.trim()) {
      body.system += "\n\n" + note;
    } else if (Array.isArray(body.system)) {
      body.system.push({ type: "text", text: note });
    } else {
      body.system = note;
    }
  }
  return body;
};


/**
 * Prepare a request using the native OpenCode provider executor and native
 * request translators. BlackRouter only supplies a dispatch adapter so its
 * direct/HTTP/relay pool transport remains intact.
 */
export const prepareProviderRequest = async ({ model, body, session, rawHeaders = {} }) => {
  const upstreamModel = cleanModelId(model);
  const originalToolNames = new Set(
    (Array.isArray(body?.tools) ? body.tools : []).map(toolNameOf).filter(Boolean),
  );
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
    dispatch: async ({ url, headers, body: outboundBody, responseFormat }) => {
      const transportBody = responseFormat === "claude"
        ? normalizeMessagesFingerprintTools(outboundBody)
        : outboundBody;
      const toolNameMap = takeRenamedToolNames(outboundBody) || inferToolNameMap(originalToolNames, outboundBody);
      return {
        url: new URL(url),
        headers: normalizeHeaders(headers),
        body: JSON.stringify(transportBody),
        responseFormat,
        lane: responseFormat === "openai-responses" ? "responses" : responseFormat === "claude" ? "messages" : "chat",
        toolNameMap,
      };
    },
  });
  return prepared;
};

export { generateSessionId };
