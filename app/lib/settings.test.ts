import { describe, expect, it } from 'vitest';

import { readSettings } from './settings';

describe('readSettings', () => {
  it('reads valid settings with no problems', () => {
    expect(readSettings({ CREDENTIAL_STORE: 'memory', CREDENTIAL_TTL_DAYS: '30' })).toEqual({
      values: { credentialStore: 'memory', credentialTtlDays: 30 },
      problems: [],
    });
  });

  it('defaults the TTL to 365 days', () => {
    expect(readSettings({ CREDENTIAL_STORE: 'mongodb' }).values.credentialTtlDays).toBe(365);
  });

  it.each([
    ['unset', undefined, 'CREDENTIAL_STORE is not set; set it to memory, mongodb or dynamodb'],
    ['empty', '', 'CREDENTIAL_STORE is not set; set it to memory, mongodb or dynamodb'],
    ['unknown', 'postgres', "CREDENTIAL_STORE is 'postgres'; set it to memory, mongodb or dynamodb"],
  ])('reports CREDENTIAL_STORE when it is %s', (_, value, problem) => {
    const settings = readSettings({ CREDENTIAL_STORE: value });
    expect(settings.values.credentialStore).toBeNull();
    expect(settings.problems).toEqual([problem]);
  });

  it.each(['0', '-5', '1.5', 'a year'])('reports CREDENTIAL_TTL_DAYS=%s', (value) => {
    const settings = readSettings({ CREDENTIAL_STORE: 'memory', CREDENTIAL_TTL_DAYS: value });
    expect(settings.problems).toEqual([
      `CREDENTIAL_TTL_DAYS must be a positive whole number of days; it is '${value}'`,
    ]);
  });
});
