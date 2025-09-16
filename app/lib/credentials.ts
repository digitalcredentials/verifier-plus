import { v4 as uuidv4 } from 'uuid';

import { VerifiablePresentation } from '../types/presentation.d';
import { VerifiableCredential } from '../types/credential.d';
import { cachedClient } from './database';

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
  vp: VerifiablePresentation;
  id: string;
  // controller DID (entity who asked for the credential to be stored)
  controller: string;
  // VC extracted from the VP for client-side convenience
  credential: VerifiableCredential;
  // 'shared' is used for "soft delete" -- if set to 'false', the VC is deleted/unshared
  shared: boolean;
}

/**
 * Adds a credential from a VerifiablePresentation to the database.
 * Requires a signed VP with a holder property (the result of DID Auth).
 *
 * @param vp {VerifiablePresentation}
 *
 * @returns {Promise<StoreCredentialResult>} View and unshare URLs for the
 *   stored credential.
 */
export async function post({ vp }: CredentialPayload): Promise<StoreCredentialResult> {
  const { holder } = vp;
  if(!holder) {
    throw new Error("Missing 'holder' property. DID Authentication is required.");
  }

  // TODO: Authenticate the presenter (make sure the 'holder' did matches the
  //  signature on the VP).

  const { credentialsCollection } = await cachedClient();
  const credential = _extractCredential(vp)[0];
  const publicId = publicIdFrom(holder, credential);

  await credentialsCollection.insertOne({
    id: publicId,
    controller: holder,
    createdAt: new Date(),
    vp,
    shared: true
  });

  return {
    url: {
      // human-readable HTML view of the credential
      view: `/credentials/${publicId}`,
      // raw JSON GET (used by the html view)
      get: `/api/credentials/${publicId}`,
      // used for DELETE/unshare API
      unshare: `/api/credentials/${publicId}`
    }
  };
}

export function publicIdFrom (holder: string, credential: VerifiableCredential): string {
  // Going with UUID for the moment
  // Future work: make this deterministic, a hash(holderDid + hash(credential))
  return uuidv4();
}

function _extractCredential(vp: VerifiablePresentation): VerifiableCredential[] {
  return Array.isArray(vp.verifiableCredential)
    ? vp.verifiableCredential
    : [vp.verifiableCredential];
}

/**
 * Loads a credential from database by id.
 *
 * @param credentialId {string}
 *
 * @returns {Promise<GetCredentialResult>}
 */
export async function get({ publicCredentialId }: any): Promise<GetCredentialResult> {
  const { credentialsCollection } = await cachedClient();

  const result = await credentialsCollection.findOne({ id: publicCredentialId });

  if(!result || !result.shared) {
    const notFound: any = new Error('Public share of this credential expired, unshared, or not found.')
    notFound.statusCode = 404;
    notFound.statusText = 'Not found'
    throw notFound;
  }

  /**
   * Straight from the db, a result looks like:
   * {
   *   id, // Unique credential id (used in view/unshare URL)
   *   controller, // The DID of the entity who shared the credential (did:key:..., etc)
   *   vp, // The full Verifiable Presentation containing one or more VCs (we only support one at the moment)
   *   shared // boolean flag used for "soft delete" / unshare functionality
   * }
   */
  const credential = _extractCredential(result.vp);

  return { credential, ...result }
}

/**
 * Unshares a credential from database by id (performs a "soft delete").
 *
 * @param publicCredentialId {string}
 *
 * @returns {Promise<GetCredentialResult>}
 */

export async function unshare({ publicCredentialId }: any): Promise<GetCredentialResult> {
  const { credentialsCollection } = await cachedClient();
  const result = await credentialsCollection.findOne({ id: publicCredentialId });

  if(!result) {
    const notFound: any = new Error('This credential does not exist, has expired, or has already been unshared.')
    notFound.statusCode = 404;
    notFound.statusText = 'Not found';
    throw notFound;
  }

  const filter = { id: publicCredentialId };
  const options = { upsert: false }
  const update = {
    $set: {
      shared: false
    }
  }

  const unshareResult: any = await credentialsCollection.updateOne(filter, update, options);
  return { ...unshareResult }
}
