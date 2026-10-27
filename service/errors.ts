/**
 * The failures BlackRouter reports to the panel and to its own log.
 *
 * Every failure a user can see carries a code, so the service can map it to a
 * status and the panel can tell "the config file is unreadable" from "the
 * upstream refused the request" without reading a message.
 */
export type RouterErrorCode =
  | 'bad-request'
  | 'not-found'
  | 'config-unreadable'
  | 'upstream'
  | 'no-models'
  | 'port-busy'
  | 'internal';

export class RouterError extends Error {
  readonly code: RouterErrorCode;

  constructor(code: RouterErrorCode, message: string) {
    super(message);
    this.name = 'RouterError';
    this.code = code;
  }
}

/** The panel sent something this route does not accept. */
export const badRequest = (message: string): RouterError => new RouterError('bad-request', message);

/** The OpenCode config exists but cannot be read or written safely. */
export const configUnreadable = (message: string): RouterError =>
  new RouterError('config-unreadable', message);

/** The upstream, or the relay in front of it, did not answer usefully. */
export const upstreamError = (message: string): RouterError => new RouterError('upstream', message);

/** Nothing to register: the upstream lists no free model the user picked. */
export const noModels = (message: string): RouterError => new RouterError('no-models', message);

/**
 * Remove common credential-bearing fragments before diagnostic text is shown
 * to the panel, returned by the gateway, or written to logs.
 */
export const redactDiagnosticText = (value: string): string =>
  value
    .replace(/([a-z][a-z\\d+.-]*:\\/\\/)[^/@\\s]+@/gi, '$1[REDACTED]@')
    .replace(/([?&](?:token|secret|password|passwd|auth|api[_-]?key|access[_-]?token|refresh[_-]?token|signature|sig)=)[^&#\\s]*/gi, '$1[REDACTED]')
    .replace(/(\\bBearer\\s+)[A-Za-z0-9._~+\\/-]+=*/gi, '$1[REDACTED]')
    .replace(/(\\bx-api-key\\s*[:=]\\s*)[^\\s,;]+/gi, '$1[REDACTED]');
