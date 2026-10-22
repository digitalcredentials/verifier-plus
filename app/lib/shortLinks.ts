import { randomInt } from 'crypto';

import { cachedClient } from './database';
import { isValidHttpUrl } from './url';

// Hosts whose public credential links can be shortened (comma-separated).
// For now this is only the wallet storage (WAS) that we run.
const ALLOWED_HOSTS = (process.env.SHORT_LINK_ALLOWED_HOSTS || 'was.lcw-sandbox.org')
  .split(',')
  .map(host => host.trim().toLowerCase())
  .filter(Boolean);

// Public credential links in wallet storage look like /space/{spaceId}/public/{file}
const PUBLIC_PATH = /^\/space\/[^/]+\/public\/[^/]+$/;

const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ID_LENGTH = 8;
const MAX_URL_LENGTH = 2048;
const DUPLICATE_KEY_ERROR = 11000;
const MAX_ATTEMPTS = 3;

export type ShortLinkPayload = {
  // public URL of a credential in wallet storage
  url: string;
}

export type StoreShortLinkResult = {
  id: string;
  url: {
    // short link that opens the credential in VerifierPlus
    view: string;
  }
}

/**
 * Creates a short link for a credential's public URL. Asking again for the
 * same URL returns the same short link.
 *
 * @param url {string}
 *
 * @returns {Promise<StoreShortLinkResult>}
 */
export async function post({ url }: ShortLinkPayload): Promise<StoreShortLinkResult> {
  const credentialUrl = _checkUrl(url);
  const shortLinksCollection = await _collection();

  for (let attempt = 1; ; attempt++) {
    try {
      // Stores a new id for the URL, or returns the id it already has
      const stored = await shortLinksCollection.findOneAndUpdate(
        { url: credentialUrl },
        { $setOnInsert: { id: _newId(), createdAt: new Date() } },
        { upsert: true, returnDocument: 'after' }
      );
      return { id: stored!.id, url: { view: `/s/${stored!.id}` } };
    } catch (error: any) {
      // Another request stored this URL at the same moment, or the new id was
      // already taken. Trying again finds the stored URL or picks a new id.
      if (error?.code !== DUPLICATE_KEY_ERROR || attempt === MAX_ATTEMPTS) {
        throw error;
      }
    }
  }
}

/**
 * Looks up the credential URL for a short link id.
 *
 * @param id {string}
 *
 * @returns {Promise<string | null>} the credential's public URL, or null if
 *   there is no such short link
 */
export async function get({ id }: { id: string }): Promise<string | null> {
  const shortLinksCollection = await _collection();
  const result = await shortLinksCollection.findOne({ id });
  return result ? result.url : null;
}

// Indexes are created once per server, on first use, so that a problem with
// them only affects short links and not the rest of the app.
let indexesReady: Promise<unknown> | undefined;

async function _collection() {
  const { shortLinksCollection } = await cachedClient();
  indexesReady ??= Promise.all([
    shortLinksCollection.createIndex({ id: 1 }, { unique: true }),
    shortLinksCollection.createIndex({ url: 1 }, { unique: true })
  ]).catch(error => {
    indexesReady = undefined;
    throw error;
  });
  await indexesReady;
  return shortLinksCollection;
}

function _checkUrl(url: unknown): string {
  if (typeof url !== 'string' || url.length > MAX_URL_LENGTH || !isValidHttpUrl(url)) {
    throw _invalid("Missing or invalid 'url' property.");
  }

  const parsed = new URL(url.trim());
  if (!ALLOWED_HOSTS.includes(parsed.hostname.toLowerCase())) {
    throw _invalid(`Short links are not available for ${parsed.hostname}.`);
  }
  if (!PUBLIC_PATH.test(parsed.pathname) || parsed.search || parsed.hash) {
    throw _invalid("The 'url' property must be a public credential link from wallet storage.");
  }

  // Same credential, same stored URL (drops a trailing '?' or '#')
  return `${parsed.origin}${parsed.pathname}`;
}

function _invalid(message: string): Error {
  const invalid: any = new Error(message);
  invalid.statusCode = 400;
  invalid.statusText = 'Invalid request';
  return invalid;
}

function _newId(): string {
  let id = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  }
  return id;
}
