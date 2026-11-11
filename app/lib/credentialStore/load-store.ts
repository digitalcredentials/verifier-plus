import type { SettingValues } from '@/lib/settings';
import type { CredentialStore } from './credential-store';

export type LoadedCredentialStore = {
  credentialStore: CredentialStore | null;
  /** Why credentialStore is null, beyond what settings already reported. */
  problems: string[];
};

/**
 * Creates the configured store. Each store module is imported only when it is
 * the one chosen, so an unused backend's client library is never loaded.
 * Creating a store does not connect it: the first operation does.
 * Never throws: a store that cannot be created is null plus a problem.
 */
export async function loadCredentialStore(values: SettingValues): Promise<LoadedCredentialStore> {
  const name = values.credentialStore;
  if (name === null) return { credentialStore: null, problems: [] };
  try {
    switch (name) {
      case 'memory': {
        const { MemoryCredentialStore } = await import('./memory-store');
        return { credentialStore: MemoryCredentialStore(), problems: [] };
      }
      case 'mongodb': {
        // Null settings were already reported as problems by readSettings.
        if (!values.mongodb) return { credentialStore: null, problems: [] };
        const { MongoCredentialStore } = await import('./mongodb-store');
        return {
          credentialStore: MongoCredentialStore({ ...values.mongodb, ttlDays: values.credentialTtlDays }),
          problems: [],
        };
      }
      case 'dynamodb': {
        if (!values.dynamodb) return { credentialStore: null, problems: [] };
        const { DynamoCredentialStore } = await import('./dynamodb-store');
        return { credentialStore: DynamoCredentialStore(values.dynamodb), problems: [] };
      }
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      credentialStore: null,
      problems: [`CREDENTIAL_STORE is '${name}', but the store could not be created: ${reason}`],
    };
  }
}
