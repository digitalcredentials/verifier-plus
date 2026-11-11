import { inflateSync } from 'node:zlib';

import { MongoClient } from 'mongodb';
import { describe, expect, it } from 'vitest';

import { MAX_SHARED_VP_BYTES } from '@/lib/credentials';

import { getTestVP } from '../../tests/fixtures/testVP';
import { DAY_MS, Refusal, UsageError } from './common';
import { confirmTarget, type CopyOptions, parseCopyArgs, selectRecord, STAGING_ACCOUNT } from './copy';
import { assertLocal, buildSyntheticSet, MIN_COUNT, SIZE_MARGIN_BYTES, stripesPng } from './synthetic';

const NOW = new Date('2026-11-10T12:00:00.000Z');
const TTL_DAYS = 365;
const ago = (days: number) => new Date(NOW.getTime() - days * DAY_MS);

/** A source document in Atlas's 2.x shape. */
function sourceDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: '3b241101-e2bb-4255-8caf-4136c566a962',
    controller: 'did:key:z6MkSynthetic',
    createdAt: ago(10),
    vp: getTestVP().vp,
    shared: true,
    ...overrides,
  };
}

describe('selectRecord', () => {
  it('maps a good record to the app shape, with expiresAt from createdAt and the TTL', () => {
    const doc = sourceDoc();
    expect(selectRecord({ _id: 'dropped', ...doc }, NOW, TTL_DAYS)).toEqual({
      copy: {
        id: doc.id,
        controller: doc.controller,
        createdAt: doc.createdAt,
        expiresAt: new Date(doc.createdAt.getTime() + TTL_DAYS * DAY_MS),
        vp: doc.vp,
        shared: true,
      },
    });
  });

  it('skips an unshared record', () => {
    expect(selectRecord(sourceDoc({ shared: false }), NOW, TTL_DAYS)).toEqual({ skip: 'unshared' });
  });

  it('skips a record at or past its expiry, and keeps one a moment before it', () => {
    expect(selectRecord(sourceDoc({ createdAt: ago(400) }), NOW, TTL_DAYS)).toEqual({ skip: 'expired' });
    expect(selectRecord(sourceDoc({ createdAt: ago(TTL_DAYS) }), NOW, TTL_DAYS)).toEqual({ skip: 'expired' });
    const almost = new Date(ago(TTL_DAYS).getTime() + 1);
    expect(selectRecord(sourceDoc({ createdAt: almost }), NOW, TTL_DAYS)).toHaveProperty('copy');
  });

  it('follows the TTL it is given', () => {
    expect(selectRecord(sourceDoc({ createdAt: ago(40) }), NOW, 30)).toEqual({ skip: 'expired' });
  });

  it('skips a vp over the app limit, measured as the service measures it', () => {
    const vp = getTestVP().vp;
    const base = Buffer.byteLength(JSON.stringify({ ...vp, padding: '' }), 'utf8');
    const at = (bytes: number) => ({ ...vp, padding: 'x'.repeat(bytes - base) });
    expect(selectRecord(sourceDoc({ vp: at(MAX_SHARED_VP_BYTES) }), NOW, TTL_DAYS)).toHaveProperty('copy');
    expect(selectRecord(sourceDoc({ vp: at(MAX_SHARED_VP_BYTES + 1) }), NOW, TTL_DAYS)).toEqual({ skip: 'tooLarge' });
  });

  it.each([
    ['id missing', { id: undefined }],
    ['id not a v4 UUID', { id: '3b241101-e2bb-1255-8caf-4136c566a962' }],
    ['controller missing', { controller: undefined }],
    ['controller empty', { controller: '' }],
    ['createdAt a string', { createdAt: ago(10).toISOString() }],
    ['createdAt an invalid date', { createdAt: new Date('nonsense') }],
    ['vp missing', { vp: undefined }],
    ['vp a string', { vp: '{}' }],
    ['vp an array', { vp: [] }],
    ['shared missing', { shared: undefined }],
    ['shared a string', { shared: 'true' }],
  ])('skips a malformed record: %s', (_, overrides) => {
    expect(selectRecord(sourceDoc(overrides), NOW, TTL_DAYS)).toEqual({ skip: 'malformed' });
  });

  it('counts a malformed record as malformed even if it is also unshared or expired', () => {
    expect(selectRecord(sourceDoc({ id: 'x', shared: false, createdAt: ago(400) }), NOW, TTL_DAYS)).toEqual({ skip: 'malformed' });
  });
});

describe('parseCopyArgs', () => {
  it('is a dry run unless --write is given', () => {
    expect(parseCopyArgs(['--table', 't', '--expect-account', '364323832338'])).toEqual({
      table: 't',
      expectAccount: '364323832338',
      write: false,
      sampleLinks: 0,
    });
    expect(parseCopyArgs(['--table', 't', '--expect-account', 'local', '--write']).write).toBe(true);
  });

  it.each([
    [[]],
    [['--expect-account', 'local']],
    [['--table', 't']],
    [['--table', 't', '--expect-account', '1234']],
    [['--table', 't', '--expect-account', 'staging']],
    [['--table', 't', '--expect-account', 'local', '--sample-links', '5']],
    [['--table', 't', '--expect-account', 'local', '--write', '--sample-links', '0']],
    [['--table', 't', '--expect-account', 'local', '--write', '--sample-links', '21']],
    [['--table', 't', '--expect-account', 'local', '--source', 'mongodb://x']],
    [['--table', 't', '--expect-account', 'local', 'extra']],
  ])('refuses %j as a usage error', (args) => {
    expect(() => parseCopyArgs(args)).toThrow(UsageError);
  });
});

describe('confirmTarget', () => {
  const options = (overrides: Partial<CopyOptions> = {}): CopyOptions => ({
    table: 't',
    expectAccount: STAGING_ACCOUNT,
    write: true,
    sampleLinks: 0,
    ...overrides,
  });
  const account = (id: string | undefined) => async () => id;
  const noLookup = async () => {
    throw new Error('looked up the account');
  };

  it('passes when the credentials are for the expected account', async () => {
    await expect(confirmTarget(options(), {}, account(STAGING_ACCOUNT))).resolves.toEqual({ account: STAGING_ACCOUNT });
  });

  it('refuses credentials for another account', async () => {
    await expect(confirmTarget(options({ expectAccount: '065533220189' }), {}, account(STAGING_ACCOUNT))).rejects.toThrow(Refusal);
    await expect(confirmTarget(options(), {}, account(undefined))).rejects.toThrow(Refusal);
  });

  it('allows local only with DYNAMODB_ENDPOINT, without asking AWS', async () => {
    await expect(confirmTarget(options({ expectAccount: 'local' }), {}, noLookup)).rejects.toThrow(Refusal);
    await expect(
      confirmTarget(options({ expectAccount: 'local' }), { DYNAMODB_ENDPOINT: 'http://localhost:8000' }, noLookup),
    ).resolves.toMatchObject({ account: 'local', endpoint: 'http://localhost:8000' });
  });

  it('refuses a real account while DYNAMODB_ENDPOINT is set, before asking AWS', async () => {
    await expect(confirmTarget(options(), { DYNAMODB_ENDPOINT: 'http://localhost:8000' }, noLookup)).rejects.toThrow(Refusal);
  });

  it('prints sample links only for staging', async () => {
    await expect(confirmTarget(options({ sampleLinks: 5 }), {}, account(STAGING_ACCOUNT))).resolves.toBeDefined();
    await expect(
      confirmTarget(options({ sampleLinks: 5, expectAccount: '065533220189' }), {}, account('065533220189')),
    ).rejects.toThrow(Refusal);
    await expect(
      confirmTarget(options({ sampleLinks: 5, expectAccount: 'local' }), { DYNAMODB_ENDPOINT: 'http://localhost:8000' }),
    ).rejects.toThrow(Refusal);
  });
});

describe('buildSyntheticSet', () => {
  it('makes what copy should find, by the rules copy applies', () => {
    const { documents, expected } = buildSyntheticSet(50, NOW, TTL_DAYS);
    expect(documents).toHaveLength(50);

    const found = { written: 0, unshared: 0, expired: 0, tooLarge: 0, malformed: 0 };
    for (const { doc } of documents) {
      const selection = selectRecord(doc, NOW, TTL_DAYS);
      if ('skip' in selection) found[selection.skip] += 1;
      else found.written += 1;
    }
    expect(found).toEqual({
      written: expected.written,
      unshared: 1,
      expired: expected.expiredAtMost,
      tooLarge: 1,
      malformed: 1,
    });
    expect(expected.expiredAtMost).toBeGreaterThan(0);
    expect(expected.written + expected.expiredAtMost + 3).toBe(50);
  });

  it('is in Atlas\'s 2.x shape: no expiresAt, a v4 id, the holder as controller', () => {
    for (const { doc } of buildSyntheticSet(MIN_COUNT, NOW, TTL_DAYS).documents) {
      expect(Object.keys(doc).sort()).toEqual(['controller', 'createdAt', 'id', 'shared', 'vp']);
      expect(doc.vp.holder).toBe(doc.controller);
      expect(doc.controller).toMatch(/^did:key:z6Mk/);
    }
  });

  it('sizes the image fixtures from the app limit: one over it, the rest under, the largest within the margin', () => {
    const { documents } = buildSyntheticSet(MIN_COUNT, NOW, TTL_DAYS);
    const size = (kind: string) =>
      documents.filter((d) => d.kind === kind).map(({ doc }) => Buffer.byteLength(JSON.stringify(doc.vp), 'utf8'));

    const [over] = size('tooLarge');
    expect(over).toBeGreaterThan(MAX_SHARED_VP_BYTES);
    expect(over).toBeLessThan(MAX_SHARED_VP_BYTES + 2 * SIZE_MARGIN_BYTES);

    const under = size('image');
    expect(under).toHaveLength(3);
    expect(Math.max(...under)).toBeLessThanOrEqual(MAX_SHARED_VP_BYTES);
    expect(Math.max(...under)).toBeGreaterThan(MAX_SHARED_VP_BYTES - 2 * SIZE_MARGIN_BYTES);
  });

  it('has one record a day from expiry, which bounds when the expectation holds', () => {
    const { documents, expected } = buildSyntheticSet(MIN_COUNT, NOW, TTL_DAYS);
    const soon = documents.filter((d) => d.kind === 'expiresSoon');
    expect(soon).toHaveLength(1);
    expect(soon[0].doc.createdAt).toEqual(ago(TTL_DAYS - 1));
    expect(expected.validUntil).toEqual(new Date(NOW.getTime() + DAY_MS));
  });

  it('refuses fewer than the minimum', () => {
    expect(() => buildSyntheticSet(MIN_COUNT - 1, NOW, TTL_DAYS)).toThrow(UsageError);
  });
});

describe('stripesPng', () => {
  it('is a PNG whose pixel data inflates to its declared size', () => {
    const png = stripesPng(20_000);
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const idatLength = png.readUInt32BE(33);
    expect(png.subarray(37, 41).toString('ascii')).toBe('IDAT');
    expect(inflateSync(png.subarray(41, 41 + idatLength))).toHaveLength(height * (1 + width * 3));
    expect(Math.abs(png.length - 20_000)).toBeLessThan(1 + width * 3 + 200);
  });
});

describe('assertLocal', () => {
  const target = (uri: string) => {
    const client = new MongoClient(uri);
    return { client, host: client.options.srvHost ?? client.options.hosts.join(',') };
  };

  it.each(['mongodb://localhost:27017', 'mongodb://127.0.0.1:27017/verifier-plus', 'mongodb://u:p@localhost'])('allows %s', (uri) => {
    expect(() => assertLocal(target(uri))).not.toThrow();
  });

  it.each([
    'mongodb+srv://u:p@cluster0.example.mongodb.net/',
    'mongodb://db.example.org:27017',
    'mongodb://localhost:27017,db.example.org:27017',
    'mongodb://localhost.example.org:27017',
    'mongodb://[::1]:27017',
    'mongodb://10.0.0.5:27017',
  ])('refuses %s', (uri) => {
    expect(() => assertLocal(target(uri))).toThrow(Refusal);
  });
});
