import { RouterError, type RouterErrorCode } from '../errors.ts';
import type { ServiceResponse } from './router.ts';

/** The status a failure answers with. */
const statusFor = (code: RouterErrorCode): number => {
  switch (code) {
    case 'bad-request':
      return 400;
    case 'not-found':
      return 404;
    case 'config-unreadable':
      return 409;
    case 'no-models':
      return 400;
    case 'port-busy':
      return 409;
    case 'upstream':
      return 502;
    case 'internal':
      return 500;
  }
};

/**
 * Turn a failure into an answer the panel can read.
 *
 * The code tells the panel what kind of failure it was, the message says what
 * happened. A failure the router does not know about keeps its detail in the
 * service log and answers with a plain sentence.
 */
export const toServiceResponse = (error: Error): ServiceResponse => {
  if (error instanceof RouterError) {
    return {
      status: statusFor(error.code),
      body: { error: { code: error.code, message: error.message } },
    };
  }
  console.error('[blackrouter] the local service failed:', error);
  return {
    status: 500,
    body: { error: { code: 'internal', message: 'The local service failed. See its log for the detail.' } },
  };
};
