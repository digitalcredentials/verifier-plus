/** Test helpers for the app context. Imported by tests only. */
import type { Clock } from '@/lib/clock';
import { MemoryCredentialStore } from '@/lib/credentialStore/memory-store';
import { readSettings } from '@/lib/settings';

import type { AppContext } from './app-context';

/**
 * A context with the memory store, a fixed clock and a fetch that refuses
 * every request, so a test can reach no database and no network unless it
 * says so. Pass overrides to change any part.
 */
export function createTestAppContext(overrides: Partial<AppContext> = {}): AppContext {
  return {
    settings: readSettings({ CREDENTIAL_STORE: 'memory' }),
    credentialStore: MemoryCredentialStore(),
    clock: FixedClock(),
    fetch: FetchMock(),
    ...overrides,
  };
}

export type FixedClock = Clock & {
  set(time: Date | string): void;
  advance(ms: number): void;
};

/** A clock that only moves when told to. */
export function FixedClock(start: Date | string = '2026-01-01T00:00:00.000Z'): FixedClock {
  let now = new Date(start).getTime();
  return Object.assign(() => new Date(now), {
    set(time: Date | string) {
      now = new Date(time).getTime();
    },
    advance(ms: number) {
      now += ms;
    },
  });
}

/** Responses by `METHOD url`, for example `'GET https://example.org/did.json'`. */
export type FetchMockRoutes = Record<string, (request: Request) => Response | Promise<Response>>;

export type FetchMock = typeof globalThis.fetch & { calls: Request[] };

/** A fetch that answers only the routes given and rejects everything else. */
export function FetchMock(routes: FetchMockRoutes = {}): FetchMock {
  const calls: Request[] = [];
  const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    calls.push(request);
    const respond = routes[`${request.method} ${request.url}`];
    if (!respond) throw new Error(`FetchMock has no response for ${request.method} ${request.url}`);
    return respond(request);
  };
  return Object.assign(fetch, { calls });
}
