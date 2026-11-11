import type { VerifiablePresentation } from '@/types/presentation';

/** A shared credential as every store keeps it. */
export type CredentialRecord = {
  /** v4 UUID, made by the credential service, never by a store. */
  id: string;
  /** Holder DID: the entity that shared the credential. */
  controller: string;
  createdAt: Date;
  /** createdAt plus the TTL, stored explicitly so every store expires alike. */
  expiresAt: Date;
  vp: VerifiablePresentation;
  /** False once unshared (a soft delete). */
  shared: boolean;
};

/**
 * Where shared credentials live. Implementations: memory, and (later)
 * mongodb and dynamodb. All of them pass the shared contract suite in
 * contract.ts.
 */
export type CredentialStore = {
  /** Create only if absent. Throws credential-already-exists if the id is taken. */
  put(record: CredentialRecord): Promise<void>;
  /** Read your own write. Returns null if absent or unshared. Expiry is the service's check. */
  get(id: string): Promise<CredentialRecord | null>;
  /** After this, get(id) returns null. Unsharing an unshared record succeeds. Unknown id: credential-not-found. */
  unshare(id: string): Promise<void>;
  /** Cheap reachability check for /health/ready; no writes. */
  ping(): Promise<void>;
};

const errorStatus = {
  'bad-request': [400, 'Invalid request'],
  'credential-not-found': [404, 'Not found'],
  'credential-already-exists': [409, 'Conflict'],
  'credential-too-large': [413, 'Payload too large'],
  'store-not-configured': [503, 'Service unavailable'],
  'store-unavailable': [503, 'Service unavailable'],
} as const;

export type CredentialErrorCode = keyof typeof errorStatus;

/**
 * An error the credential routes turn into an HTTP response. Carries the
 * statusCode and statusText the route error body has always used.
 */
export type CredentialError = Error & {
  code: CredentialErrorCode;
  statusCode: number;
  statusText: string;
};

export function CredentialError(code: CredentialErrorCode, message: string, cause?: unknown): CredentialError {
  const [statusCode, statusText] = errorStatus[code];
  return Object.assign(new Error(message, { cause }), { code, statusCode, statusText });
}

export function isCredentialError(error: unknown, code?: CredentialErrorCode): error is CredentialError {
  if (!(error instanceof Error)) return false;
  const actual = (error as { code?: unknown }).code;
  return typeof actual === 'string' && Object.hasOwn(errorStatus, actual) && (code === undefined || actual === code);
}

export function CredentialNotFound(id: string): CredentialError {
  return CredentialError('credential-not-found', `No credential with id ${id}.`);
}

export function CredentialAlreadyExists(id: string): CredentialError {
  return CredentialError('credential-already-exists', `A credential with id ${id} already exists.`);
}
