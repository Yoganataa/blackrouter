import type { Runtime } from '../../runtime.ts';
import type { Router } from '../router.ts';

/** Writing and removing the provider block in OpenCode's config. */
export const registerRegistrationRoutes = (router: Router, runtime: Runtime): void => {
  router.post('/register', async () => ({ status: 200, body: await runtime.register() }));
  router.post('/unregister', async () => ({ status: 200, body: await runtime.unregister() }));
};
