import type { CredentialStoreName } from '@/lib/settings';
import type { CredentialStore } from './credential-store';

export type LoadedCredentialStore = {
  credentialStore: CredentialStore | null;
  /** Why credentialStore is null, beyond what settings already reported. */
  problems: string[];
};

/**
 * Creates the configured store. Each store module is imported only when it is
 * the one chosen, so an unused backend's client library is never loaded.
 * Never throws: a store that cannot be created is null plus a problem.
 */
export async function loadCredentialStore(name: CredentialStoreName | null): Promise<LoadedCredentialStore> {
  if (name === null) return { credentialStore: null, problems: [] };
  try {
    switch (name) {
      case 'memory': {
        const { MemoryCredentialStore } = await import('./memory-store');
        return { credentialStore: MemoryCredentialStore(), problems: [] };
      }
      case 'mongodb':
      case 'dynamodb':
        return {
          credentialStore: null,
          problems: [`CREDENTIAL_STORE is '${name}', which is not available in this build`],
        };
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      credentialStore: null,
      problems: [`CREDENTIAL_STORE is '${name}', but the store could not be created: ${reason}`],
    };
  }
}
