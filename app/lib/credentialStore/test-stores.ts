import { type CredentialStoreName, credentialStoreNames } from '@/lib/settings';

/**
 * The stores whose test files run, from TEST_STORES (a comma list, default
 * memory). A backend's test file skips itself unless named here, and fails if
 * named but unreachable, so a run cannot pass by silently skipping.
 */
export function selectedTestStores(env: Record<string, string | undefined> = process.env): Set<CredentialStoreName> {
  const names = (env.TEST_STORES ?? 'memory').split(',').map((name) => name.trim()).filter(Boolean);
  const unknown = names.filter((name) => !(credentialStoreNames as readonly string[]).includes(name));
  if (unknown.length > 0) {
    throw new Error(`TEST_STORES names ${unknown.join(', ')}; use a comma list of ${credentialStoreNames.join(', ')}`);
  }
  return new Set(names as CredentialStoreName[]);
}

export function testStoreSelected(name: CredentialStoreName): boolean {
  return selectedTestStores().has(name);
}
