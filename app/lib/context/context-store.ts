import { AsyncLocalStorage } from 'node:async_hooks';

import { type AppContext, createAppContext } from './app-context';

const storage = new AsyncLocalStorage<AppContext>();

declare global {
  // Kept on globalThis so `next dev` hot reloads keep one context (and one memory store).
  var verifierPlusAppContext: Promise<AppContext> | undefined;
}

/** The context of the current scope; outside any scope, the one per-process context. */
export function appContext(): Promise<AppContext> {
  const scoped = storage.getStore();
  if (scoped) return Promise.resolve(scoped);
  globalThis.verifierPlusAppContext ??= createAppContext(process.env);
  return globalThis.verifierPlusAppContext;
}

/** Runs fn with ctx as the context for everything it calls. */
export function runInContext<T>(ctx: AppContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export async function settings() {
  return (await appContext()).settings;
}

export async function credentialStore() {
  return (await appContext()).credentialStore;
}

export async function clock() {
  return (await appContext()).clock;
}
