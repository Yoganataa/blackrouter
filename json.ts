import { z } from 'zod';

/**
 * JSON, as a type that keeps its shape.
 *
 * A notebook document, a Jupyter message and the wire between the panel and
 * the service all carry values the SDK does not own. They are described here
 * once, so every side agrees on what "a JSON value" means.
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() => z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(jsonValueSchema),
  z.record(z.string(), jsonValueSchema),
]));
