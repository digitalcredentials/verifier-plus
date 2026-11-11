/**
 * The app's dependencies, built once per process and reached through
 * appContext() (see context-store.ts). Tests build their own with
 * createTestAppContext() (see testing.ts) and run code under runInContext().
 *
 * The pattern is a small version of the skybridgeskills monorepo's:
 * factory functions, providers that return context keys, Ctx types and
 * accessors, over AsyncLocalStorage. See there:
 *   docs/code-style/factory-functions.md
 *   docs/code-style/providers.md
 *   sbs/packages/lib-backend/README.md ("AppContext", "Health checks")
 * Left out on purpose: the provider library itself and any switch that picks
 * a whole set of backends at once. Each setting chooses its own backend.
 */
import type { Clock } from '@/lib/clock';
import { SystemClock } from '@/lib/clock';
import type { CredentialStore } from '@/lib/credentialStore/credential-store';
import { ExchangeCache } from '@/lib/exchangeCache';
import { loadCredentialStore } from '@/lib/credentialStore/load-store';
import type { Env, Settings } from '@/lib/settings';
import { readSettings } from '@/lib/settings';

export type AppContext = {
  /** Values and problems, read once. */
  settings: Settings;
  /** Null when CREDENTIAL_STORE is unset or invalid, or the store could not be created. */
  credentialStore: CredentialStore | null;
  clock: Clock;
  fetch: typeof globalThis.fetch;
  // TEMPORARY(transaction-service): remove with the in-app exchange
  /** Null when EXCHANGES is off, unset, or refused on Lambda. */
  exchanges: ExchangeCache | null;
};

export type SettingsCtx = Pick<AppContext, 'settings'>;
export type CredentialStoreCtx = Pick<AppContext, 'credentialStore'>;
export type ClockCtx = Pick<AppContext, 'clock'>;
export type FetchCtx = Pick<AppContext, 'fetch'>;
export type ExchangesCtx = Pick<AppContext, 'exchanges'>;

/** Builds the context. Never throws for a bad or missing setting. */
export async function createAppContext(env: Env): Promise<AppContext> {
  warnAboutRenamedSettings(env);
  const { settings } = provideSettings(env);
  return {
    ...(await provideCredentialStore({ settings })),
    ...provideClock(),
    ...provideFetch(),
    ...provideExchanges({ settings }),
  };
}

export function provideSettings(env: Env): SettingsCtx {
  return { settings: readSettings(env) };
}

/** Adds the store, and any problem creating it to the settings' problems. */
export async function provideCredentialStore({ settings }: SettingsCtx): Promise<SettingsCtx & CredentialStoreCtx> {
  const { credentialStore, problems } = await loadCredentialStore(settings.values);
  return {
    settings: { ...settings, problems: [...settings.problems, ...problems] },
    credentialStore,
  };
}

export function provideClock(): ClockCtx {
  return { clock: SystemClock() };
}

export function provideFetch(): FetchCtx {
  return { fetch: globalThis.fetch };
}

// TEMPORARY(transaction-service): remove with the in-app exchange
export function provideExchanges({ settings }: SettingsCtx): ExchangesCtx {
  return { exchanges: settings.values.exchanges ? ExchangeCache() : null };
}

/** Settings that 3.0.0 renamed. Still set, they do no harm, so they are not problems. */
function warnAboutRenamedSettings(env: Env) {
  if (env.NEXT_PUBLIC_EXCHANGE_SERVER_URL !== undefined) {
    console.warn('NEXT_PUBLIC_EXCHANGE_SERVER_URL is no longer read; use EXCHANGE_SERVER_URL');
  }
}
