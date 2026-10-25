import type { Runtime } from '../../runtime.ts';
import type { Router } from '../router.ts';

/** What the panel reads first, and after every change. */
export const registerStateRoutes = (router: Router, runtime: Runtime): void => {
  router.get('/state', async () => ({ status: 200, body: runtime.state() }));
};
