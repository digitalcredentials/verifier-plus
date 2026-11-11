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

export type SettingValues = {
  /** Which credential store to use. No default: null when unset or invalid. */
  credentialStore: CredentialStoreName | null;
  /** How long a shared credential stays viewable. */
  credentialTtlDays: number;
};

export type Settings = {
  values: SettingValues;
  /** One sentence per problem, each naming the variable to fix. */
  problems: string[];
};

export function readSettings(env: Env): Settings {
  const problems: string[] = [];
  return {
    values: {
      credentialStore: readCredentialStore(env, problems),
      credentialTtlDays: readCredentialTtlDays(env, problems),
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
