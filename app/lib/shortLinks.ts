import { randomInt } from 'crypto';

import { cachedClient } from './database';

// Hosts whose public credential links can be shortened (comma-separated).
// For now this is only the wallet storage (WAS) that we run.
const ALLOWED_HOSTS = (process.env.SHORT_LINK_ALLOWED_HOSTS || 'was.lcw-sandbox.org')
  .split(',')
  .map(host => host.trim().toLowerCase())
  .filter(Boolean);

const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ID_LENGTH = 8;
const MAX_URL_LENGTH = 2048;
const DUPLICATE_KEY_ERROR = 11000;

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
  const { shortLinksCollection } = await cachedClient();

  const existing = await shortLinksCollection.findOne({ url: credentialUrl });
  if (existing) {
    return _result(existing.id);
  }

  const id = _newId();
  try {
    await shortLinksCollection.insertOne({ id, url: credentialUrl, createdAt: new Date() });
  } catch (error: any) {
    if (error?.code !== DUPLICATE_KEY_ERROR) {
      throw error;
    }
    // Another request stored this URL first (or, very rarely, the id was
    // already taken), so return whatever is now stored for the URL.
    const stored = await shortLinksCollection.findOne({ url: credentialUrl });
    if (!stored) {
      throw error;
    }
    return _result(stored.id);
  }

  return _result(id);
}

/**
 * Looks up the credential URL for a short link id.
 *
 * @param id {string}
 *
 * @returns {Promise<string>} the credential's public URL
 */
export async function get({ id }: { id: string }): Promise<string> {
  const { shortLinksCollection } = await cachedClient();
  const result = await shortLinksCollection.findOne({ id });

  if (!result) {
    const notFound: any = new Error('Short link not found.');
    notFound.statusCode = 404;
    notFound.statusText = 'Not found';
    throw notFound;
  }

  return result.url;
}

function _checkUrl(url: unknown): string {
  if (typeof url !== 'string' || url.length > MAX_URL_LENGTH) {
    throw new Error("Missing or invalid 'url' property.");
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid 'url' property.");
  }

  if (parsed.protocol !== 'https:') {
    throw new Error("The 'url' property must be an https URL.");
  }
  if (!ALLOWED_HOSTS.includes(parsed.hostname.toLowerCase())) {
    throw new Error(`Short links are not available for ${parsed.hostname}.`);
  }

  return parsed.href;
}

function _newId(): string {
  let id = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  }
  return id;
}

function _result(id: string): StoreShortLinkResult {
  return { id, url: { view: `/s/${id}` } };
}
