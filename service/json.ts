import type { JsonValue } from '../json.ts';

/** A JSON object, which is what every config, request and event here starts as. */
export type JsonObject = { [key: string]: JsonValue };

export const isJsonObject = (value: JsonValue | undefined): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
