/**
 * The credential service: the only module that talks to the credential store.
 * It owns the rules every store shares: the id, the size limit, expiry and
 * what unsharing means.
 */
import { v4 as uuidv4 } from 'uuid';

import { appContext } from '@/lib/context/context-store';
import {
  CredentialError,
  type CredentialRecord,
  type CredentialStore,
  isCredentialError,
} from '@/lib/credentialStore/credential-store';
import type { VerifiableCredential } from '@/types/credential';
import type { VerifiablePresentation } from '@/types/presentation';

/** The largest presentation that can be shared: 350 KB of JSON. */
export const MAX_SHARED_VP_BYTES = 350 * 1024;

const DAY_MS = 24 * 60 * 60 * 1000;

export type CredentialPayload = {
  // a signed VP containing one VC (more than one will be supported in the future)
  vp: VerifiablePresentation;
}

export type StoreCredentialResult = {
  url: {
    view: string;
    get: string;
    unshare: string;
  }
}

export type GetCredentialResult = {
  id: string;
  // controller DID (entity who asked for the credential to be stored)
  controller: string;
  createdAt: Date;
  vp: VerifiablePresentation;
  // 'shared' is used for "soft delete" -- if set to 'false', the VC is deleted/unshared
  shared: boolean;
  // VCs extracted from the VP for client-side convenience
  credential: VerifiableCredential[];
}

/**
 * Shares the credential in a VerifiablePresentation.
 * Requires a signed VP with a holder property (the result of DID Auth).
 *
 * @returns View and unshare URLs for the stored credential.
 */
export async function shareCredential(payload: Partial<CredentialPayload> | null): Promise<StoreCredentialResult> {
  const vp = payload?.vp;
  if (!vp?.holder) {
    throw CredentialError('bad-request', "Missing 'holder' property. DID Authentication is required.");
  }

  // TODO: Authenticate the presenter (make sure the 'holder' did matches the
  //  signature on the VP).

  if (Buffer.byteLength(JSON.stringify(vp), 'utf8') > MAX_SHARED_VP_BYTES) {
    throw CredentialError('credential-too-large', 'Credential too large to share (limit 350 KB)');
  }

  const { store, clock, ttlDays } = await requireStore();
  const createdAt = clock();
  const record: CredentialRecord = {
    id: uuidv4(),
    controller: vp.holder,
    createdAt,
    expiresAt: new Date(createdAt.getTime() + ttlDays * DAY_MS),
    vp,
    shared: true,
  };
  await callStore(() => store.put(record));

  return {
    url: {
      // human-readable HTML view of the credential
      view: `/credentials/${record.id}`,
      // raw JSON GET (used by the html view)
      get: `/api/credentials/${record.id}`,
      // used for DELETE/unshare API
      unshare: `/api/credentials/${record.id}`
    }
  };
}

/**
 * Loads a shared credential by id. Unshared, expired and unknown credentials
 * are all "not found".
 */
export async function getSharedCredential(id: string): Promise<GetCredentialResult> {
  const { store, clock } = await requireStore();
  const record = await callStore(() => store.get(id));

  if (!record || !record.shared || record.expiresAt.getTime() <= clock().getTime()) {
    throw CredentialError('credential-not-found', 'Public share of this credential expired, unshared, or not found.');
  }

  const { controller, createdAt, vp, shared } = record;
  return { id, controller, createdAt, vp, shared, credential: extractCredentials(vp) };
}

/** Unshares a credential by id (a soft delete). Unsharing twice succeeds. */
export async function unshareCredential(id: string): Promise<void> {
  const { store } = await requireStore();
  try {
    await callStore(() => store.unshare(id));
  } catch (error) {
    if (isCredentialError(error, 'credential-not-found')) {
      throw CredentialError('credential-not-found', 'This credential does not exist, has expired, or has already been unshared.');
    }
    throw error;
  }
}

function extractCredentials(vp: VerifiablePresentation): VerifiableCredential[] {
  return Array.isArray(vp.verifiableCredential)
    ? vp.verifiableCredential
    : [vp.verifiableCredential];
}

async function requireStore(): Promise<{ store: CredentialStore; clock: () => Date; ttlDays: number }> {
  const { credentialStore, clock, settings } = await appContext();
  if (!credentialStore) {
    throw CredentialError('store-not-configured', `No credential store configured: ${settings.problems.join('; ')}`);
  }
  return { store: credentialStore, clock, ttlDays: settings.values.credentialTtlDays };
}

/** Store failures other than the store's own answers mean the store is unreachable. */
async function callStore<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isCredentialError(error)) throw error;
    throw CredentialError('store-unavailable', 'The credential store is unavailable.', error);
  }
}
