import { z } from 'zod';

import { badRequest } from '../errors.ts';

/**
 * Read the body of a request the panel sent.
 *
 * The panel and the service are two programs, so the body is checked against
 * the shape the route expects before anything acts on it.
 */
export const readBody = <Schema extends z.ZodType>(schema: Schema, body: string): z.infer<Schema> => {
  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    throw badRequest('The request body is not JSON.');
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
      .join('; ');
    throw badRequest(`The request body is not what this route expects: ${issues}`);
  }
  return parsed.data;
};
