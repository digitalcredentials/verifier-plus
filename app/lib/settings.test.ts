import { describe, expect, it } from 'vitest';

import { mongoHostForLogs, readSettings } from './settings';

describe('readSettings', () => {
  it('reads valid settings with no problems', () => {
    expect(readSettings({ EXCHANGES: 'off', CREDENTIAL_STORE: 'memory', CREDENTIAL_TTL_DAYS: '30' })).toEqual({
      values: {
        credentialStore: 'memory',
        credentialTtlDays: 30,
        mongodb: null,
        dynamodb: null,
        exchanges: false,
        exchangeServerUrl: null,
      },
      problems: [],
    });
  });

  it('defaults the TTL to 365 days', () => {
    expect(readSettings({ EXCHANGES: 'off', CREDENTIAL_STORE: 'memory' }).values.credentialTtlDays).toBe(365);
  });

  it.each([
    ['unset', undefined, 'CREDENTIAL_STORE is not set; set it to memory, mongodb or dynamodb'],
    ['empty', '', 'CREDENTIAL_STORE is not set; set it to memory, mongodb or dynamodb'],
    ['unknown', 'postgres', "CREDENTIAL_STORE is 'postgres'; set it to memory, mongodb or dynamodb"],
  ])('reports CREDENTIAL_STORE when it is %s', (_, value, problem) => {
    const settings = readSettings({ EXCHANGES: 'off', CREDENTIAL_STORE: value });
    expect(settings.values.credentialStore).toBeNull();
    expect(settings.problems).toEqual([problem]);
  });

  it.each(['0', '-5', '1.5', 'a year'])('reports CREDENTIAL_TTL_DAYS=%s', (value) => {
    const settings = readSettings({ EXCHANGES: 'off', CREDENTIAL_STORE: 'memory', CREDENTIAL_TTL_DAYS: value });
    expect(settings.problems).toEqual([
      `CREDENTIAL_TTL_DAYS must be a positive whole number of days; it is '${value}'`,
    ]);
  });

  it('reads no backend settings for a store that is not chosen', () => {
    const settings = readSettings({ EXCHANGES: 'off', CREDENTIAL_STORE: 'memory', DB_URI: 'nonsense', DB_HOST: 'h' });
    expect(settings.values).toMatchObject({ mongodb: null, dynamodb: null });
    expect(settings.problems).toEqual([]);
  });
});

describe('readSettings for mongodb', () => {
  const mongo = (env: Record<string, string>) => readSettings({ EXCHANGES: 'off', CREDENTIAL_STORE: 'mongodb', ...env });

  it('uses DB_URI as given, with the 2.x name defaults', () => {
    expect(mongo({ DB_URI: 'mongodb://localhost:27017' })).toEqual({
      values: expect.objectContaining({
        mongodb: { uri: 'mongodb://localhost:27017', host: 'localhost:27017', dbName: 'verifier-plus', collection: 'credentials' },
      }),
      problems: [],
    });
  });

  it('builds the 2.x mongodb+srv URI from DB_HOST, DB_USER and DB_PASS, exactly as 2.x did', () => {
    const settings = mongo({ DB_HOST: 'cluster0.example.net', DB_USER: 'app', DB_PASS: 'p@ss', DB_NAME: 'vp', DB_COLLECTION: 'creds' });
    expect(settings.values.mongodb).toEqual({
      uri: 'mongodb+srv://app:p@ss@cluster0.example.net',
      host: 'cluster0.example.net',
      dbName: 'vp',
      collection: 'creds',
    });
    expect(settings.problems).toEqual([]);
  });

  it.each([
    [{}, 'CREDENTIAL_STORE is mongodb, so set DB_URI, or DB_HOST with DB_USER and DB_PASS'],
    [{ DB_URI: 'mongodb://a', DB_HOST: 'b' }, 'set DB_URI or DB_HOST, not both'],
    [{ DB_URI: 'postgres://a' }, 'DB_URI must start with mongodb:// or mongodb+srv://'],
    [{ DB_HOST: 'h' }, 'DB_HOST is set, so DB_USER and DB_PASS must be set too'],
    [{ DB_HOST: 'h', DB_USER: 'u' }, 'DB_HOST is set, so DB_PASS must be set too'],
  ])('reports %j', (env, problem) => {
    const settings = mongo(env);
    expect(settings.values.mongodb).toBeNull();
    expect(settings.problems).toEqual([problem]);
  });
});

describe('readSettings for dynamodb', () => {
  it('reads the table, region and optional endpoint', () => {
    const settings = readSettings({
      EXCHANGES: 'off',
      CREDENTIAL_STORE: 'dynamodb',
      CREDENTIAL_TABLE: 'credentials',
      AWS_REGION: 'us-east-1',
      DYNAMODB_ENDPOINT: 'http://localhost:8000',
    });
    expect(settings.values.dynamodb).toEqual({ table: 'credentials', region: 'us-east-1', endpoint: 'http://localhost:8000' });
    expect(settings.problems).toEqual([]);
  });

  it('reports each missing setting', () => {
    const settings = readSettings({ EXCHANGES: 'off', CREDENTIAL_STORE: 'dynamodb' });
    expect(settings.values.dynamodb).toBeNull();
    expect(settings.problems).toEqual([
      'CREDENTIAL_STORE is dynamodb, so set CREDENTIAL_TABLE',
      'CREDENTIAL_STORE is dynamodb, so set AWS_REGION',
    ]);
  });
});

describe('mongoHostForLogs', () => {
  it.each([
    ['mongodb://localhost:27017', 'localhost:27017'],
    ['mongodb+srv://user:secret@cluster0.example.net/?retryWrites=true', 'cluster0.example.net'],
    ['mongodb://user:secret@h1:27017,h2:27017/db?replicaSet=rs0', 'h1:27017,h2:27017'],
    ['mongodb://user:se/cr?et@host', 'host'],
    ['mongodb://user:p@ss@host/db', 'host'],
  ])('%s → %s', (uri, host) => {
    expect(mongoHostForLogs(uri)).toBe(host);
  });
});

describe('readSettings for exchanges', () => {
  const exchanges = (env: Record<string, string>) => readSettings({ CREDENTIAL_STORE: 'memory', ...env });
  const lambdaRefusal =
    'EXCHANGES=on is not supported on Lambda: request exchanges are kept in process memory, ' +
    'which Lambda does not share between instances. transaction-service is the planned home.';

  it.each([
    ['unset', {}, 'EXCHANGES is not set; set it to on or off'],
    ['unknown', { EXCHANGES: 'yes' }, "EXCHANGES is 'yes'; set it to on or off"],
  ])('reports EXCHANGES when it is %s, and treats exchanges as off', (_, env, problem) => {
    const settings = exchanges(env);
    expect(settings.values.exchanges).toBe(false);
    expect(settings.problems).toEqual([problem]);
  });

  it('reads off with no problem', () => {
    const settings = exchanges({ EXCHANGES: 'off', EXCHANGE_SERVER_URL: 'not read when off' });
    expect(settings.values).toMatchObject({ exchanges: false, exchangeServerUrl: null });
    expect(settings.problems).toEqual([]);
  });

  it('reads on, with no EXCHANGE_SERVER_URL', () => {
    const settings = exchanges({ EXCHANGES: 'on' });
    expect(settings.values).toMatchObject({ exchanges: true, exchangeServerUrl: null });
    expect(settings.problems).toEqual([]);
  });

  it('reads EXCHANGE_SERVER_URL without a trailing slash', () => {
    const settings = exchanges({ EXCHANGES: 'on', EXCHANGE_SERVER_URL: 'https://verifierplus.org/' });
    expect(settings.values.exchangeServerUrl).toBe('https://verifierplus.org');
    expect(settings.problems).toEqual([]);
  });

  it.each(['verifierplus.org', '/api', 'ftp://verifierplus.org'])('reports EXCHANGE_SERVER_URL=%s', (value) => {
    const settings = exchanges({ EXCHANGES: 'on', EXCHANGE_SERVER_URL: value });
    expect(settings.values.exchangeServerUrl).toBeNull();
    expect(settings.problems).toEqual(['EXCHANGE_SERVER_URL must be an absolute URL']);
  });

  it('refuses on when running on Lambda, and treats exchanges as off', () => {
    const settings = exchanges({ EXCHANGES: 'on', AWS_LAMBDA_FUNCTION_NAME: 'verifier-plus' });
    expect(settings.values).toMatchObject({ exchanges: false, exchangeServerUrl: null });
    expect(settings.problems).toEqual([lambdaRefusal]);
  });

  it('allows off on Lambda', () => {
    expect(exchanges({ EXCHANGES: 'off', AWS_LAMBDA_FUNCTION_NAME: 'verifier-plus' }).problems).toEqual([]);
  });
});
