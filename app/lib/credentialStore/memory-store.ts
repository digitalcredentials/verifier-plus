import {
  CredentialAlreadyExists,
  CredentialNotFound,
  type CredentialRecord,
  type CredentialStore,
} from './credential-store';

/**
 * Keeps credentials in this process only: for local development and tests.
 * Records are deep-copied on the way in and out, so no caller can change a
 * stored record by holding on to an object.
 */
export function MemoryCredentialStore(): CredentialStore {
  const records = new Map<string, CredentialRecord>();

  return {
    async put(record) {
      if (records.has(record.id)) throw CredentialAlreadyExists(record.id);
      records.set(record.id, structuredClone(record));
    },
    async get(id) {
      const record = records.get(id);
      return record?.shared ? structuredClone(record) : null;
    },
    async unshare(id) {
      const record = records.get(id);
      if (!record) throw CredentialNotFound(id);
      record.shared = false;
    },
    async ping() {},
  };
}
