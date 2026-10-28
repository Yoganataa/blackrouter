import { OPENAI_BLOCK } from "../schema/index.js";

// The exact upstream helper used by the native OpenAI -> Claude request translator.
export function extractTextContent(content, separator = "") {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.filter((part) => part.type === OPENAI_BLOCK.TEXT).map((part) => part.text).join(separator);
  }
  return "";
}
