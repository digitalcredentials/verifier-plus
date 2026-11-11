/**
 * The app's settings, read from the environment once per process.
 *
 * Reading never throws: a missing or invalid setting becomes a problem that
 * names the variable. The app still starts, routes that need the setting
 * answer 503, and /health/ready reports the problems.
 */

export const credentialStoreNames = ['memory', 'mongodb', 'dynamodb'] as const;
export type CredentialStoreName = (typeof credentialStoreNames)[number];

export const DEFAULT_CREDENTIAL_TTL_DAYS = 365;

export type Env = Record<string, string | undefined>;

export const DEFAULT_DB_NAME = 'verifier-plus';
export const DEFAULT_DB_COLLECTION = 'credentials';

export type MongoSettings = {
  /** Connection string, used as given. Holds the password: never log it. */
  uri: string;
  /** The host part of the URI, without credentials: safe to log. */
  host: string;
  dbName: string;
  collection: string;
};

export type DynamoSettings = {
  table: string;
  region: string;
  /** Only for DynamoDB Local; unset on Lambda. */
  endpoint: string | undefined;
};

export type SettingValues = {
  /** Which credential store to use. No default: null when unset or invalid. */
  credentialStore: CredentialStoreName | null;
  /** How long a shared credential stays viewable. */
  credentialTtlDays: number;
  /** Read only when CREDENTIAL_STORE is mongodb; null otherwise or when invalid. */
  mongodb: MongoSettings | null;
  /** Read only when CREDENTIAL_STORE is dynamodb; null otherwise or when invalid. */
  dynamodb: DynamoSettings | null;
};

export type Settings = {
  values: SettingValues;
  /** One sentence per problem, each naming the variable to fix. */
  problems: string[];
};

export function readSettings(env: Env): Settings {
  const problems: string[] = [];
  const credentialStore = readCredentialStore(env, problems);
  return {
    values: {
      credentialStore,
      credentialTtlDays: readCredentialTtlDays(env, problems),
      mongodb: credentialStore === 'mongodb' ? readMongoSettings(env, problems) : null,
      dynamodb: credentialStore === 'dynamodb' ? readDynamoSettings(env, problems) : null,
    },
    problems,
  };
}

function readCredentialStore(env: Env, problems: string[]): CredentialStoreName | null {
  const value = env.CREDENTIAL_STORE?.trim();
  const choices = 'set it to memory, mongodb or dynamodb';
  if (!value) {
    problems.push(`CREDENTIAL_STORE is not set; ${choices}`);
    return null;
  }
  if (!isCredentialStoreName(value)) {
    problems.push(`CREDENTIAL_STORE is '${value}'; ${choices}`);
    return null;
  }
  return value;
}

function isCredentialStoreName(value: string): value is CredentialStoreName {
  return (credentialStoreNames as readonly string[]).includes(value);
}

function readCredentialTtlDays(env: Env, problems: string[]): number {
  const value = env.CREDENTIAL_TTL_DAYS?.trim();
  if (!value) return DEFAULT_CREDENTIAL_TTL_DAYS;
  if (!/^[1-9][0-9]*$/.test(value)) {
    problems.push(`CREDENTIAL_TTL_DAYS must be a positive whole number of days; it is '${value}'`);
    return DEFAULT_CREDENTIAL_TTL_DAYS;
  }
  return Number(value);
}

function readMongoSettings(env: Env, problems: string[]): MongoSettings | null {
  const uri = env.DB_URI?.trim();
  const host = env.DB_HOST?.trim();
  const dbName = env.DB_NAME?.trim() || DEFAULT_DB_NAME;
  const collection = env.DB_COLLECTION?.trim() || DEFAULT_DB_COLLECTION;

  if (uri && host) {
    problems.push('set DB_URI or DB_HOST, not both');
    return null;
  }
  if (uri) {
    if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
      problems.push('DB_URI must start with mongodb:// or mongodb+srv://');
      return null;
    }
    return { uri, host: mongoHostForLogs(uri), dbName, collection };
  }
  if (host) {
    const missing = (['DB_USER', 'DB_PASS'] as const).filter((name) => !env[name]);
    if (missing.length > 0) {
      problems.push(`DB_HOST is set, so ${missing.join(' and ')} must be set too`);
      return null;
    }
    // The 2.x form, built exactly as 2.x built it (no encoding added), so
    // existing deployments keep connecting.
    return { uri: `mongodb+srv://${env.DB_USER}:${env.DB_PASS}@${host}`, host, dbName, collection };
  }
  problems.push('CREDENTIAL_STORE is mongodb, so set DB_URI, or DB_HOST with DB_USER and DB_PASS');
  return null;
}

/**
 * The hosts in a MongoDB URI, with any user and password left out. Cuts at
 * the last '@' anywhere, so an unencoded '/' or '?' in a password cannot
 * leave part of it in the result.
 */
export function mongoHostForLogs(uri: string): string {
  const rest = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  return rest.slice(rest.lastIndexOf('@') + 1).split(/[/?]/, 1)[0];
}

function readDynamoSettings(env: Env, problems: string[]): DynamoSettings | null {
  const table = env.CREDENTIAL_TABLE?.trim();
  const region = env.AWS_REGION?.trim();
  const endpoint = env.DYNAMODB_ENDPOINT?.trim() || undefined;
  if (!table) problems.push('CREDENTIAL_STORE is dynamodb, so set CREDENTIAL_TABLE');
  if (!region) problems.push('CREDENTIAL_STORE is dynamodb, so set AWS_REGION');
  if (!table || !region) return null;
  return { table, region, endpoint };
}
