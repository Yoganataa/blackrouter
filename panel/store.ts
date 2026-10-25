import type { RouterState } from '../contract.ts';
import { ServiceError, type ServiceClient } from './client.ts';

/**
 * The one place the panel's copy of the service state lives.
 *
 * Every action goes through `run`, so a failed call leaves the last good state
 * on screen and reports one message, instead of half-updating the page.
 */
export type Store = {
  state(): RouterState | null;
  error(): string;
  busy(): boolean;
  subscribe(listener: () => void): void;
  load(): Promise<void>;
  poll(): Promise<void>;
  run(action: (client: ServiceClient) => Promise<RouterState>): Promise<void>;
};

export const createStore = (client: ServiceClient): Store => {
  let current: RouterState | null = null;
  let failure = '';
  let running = false;
  const listeners = new Set<() => void>();

  const notify = (): void => {
    for (const listener of listeners) listener();
  };

  const messageOf = (error: unknown): string =>
    error instanceof ServiceError ? error.message : error instanceof Error ? error.message : String(error);

  const run = async (action: (client: ServiceClient) => Promise<RouterState>): Promise<void> => {
    running = true;
    notify();
    try {
      current = await action(client);
      failure = '';
    } catch (error) {
      failure = messageOf(error);
    } finally {
      running = false;
      notify();
    }
  };

  const poll = async (): Promise<void> => {
    if (running) return;
    try {
      current = await client.state();
      failure = '';
      notify();
    } catch {
      // Background poll failure preserves current state
    }
  };

  return {
    state: () => current,
    error: () => failure,
    busy: () => running,
    subscribe: (listener) => {
      listeners.add(listener);
    },
    load: () => run((service) => service.state()),
    poll,
    run,
  };
};
