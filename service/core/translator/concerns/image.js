// Native data-URI parser used by the upstream OpenAI -> Claude request translator.
const DATA_URI_RE = /^data:([^;]+);base64,([\\s\\S]+)$/;
export function parseDataUri(url) {
  if (typeof url !== "string") return null;
  const match = url.match(DATA_URI_RE);
  return match ? { mimeType: match[1], base64: match[2] } : null;
}
