import { describe, expect, it } from 'vitest';

import { GET } from '@/app/health/ready/route';
import { createAppContext } from '@/lib/context/app-context';
import { runInContext } from '@/lib/context/context-store';
import contract from '@/settings.contract.json';

import { type Env, readSettings } from './settings';

type Entry = (typeof contract.settings)[number];
const entries: Entry[] = contract.settings;
const byName = new Map(entries.map((entry) => [entry.name, entry]));

/** A minimal environment with no problems. */
const validEnv: Env = { CREDENTIAL_STORE: 'memory', EXCHANGES: 'off' };

/** Environments that between them take every branch of readSettings. */
const scenarios: Env[] = [
  validEnv,
  { CREDENTIAL_STORE: 'mongodb', DB_URI: 'mongodb://localhost:27017', EXCHANGES: 'on' },
  { CREDENTIAL_STORE: 'mongodb', DB_HOST: 'cluster.example.net', DB_USER: 'u', DB_PASS: 'p', EXCHANGES: 'off' },
  { CREDENTIAL_STORE: 'dynamodb', CREDENTIAL_TABLE: 't', AWS_REGION: 'us-east-1', EXCHANGES: 'off' },
  { CREDENTIAL_STORE: 'memory', EXCHANGES: 'on', AWS_LAMBDA_FUNCTION_NAME: 'verifier-plus' },
];

/** The names readSettings looks up for env. */
function namesRead(env: Env): Set<string> {
  const names = new Set<string>();
  const recording = new Proxy(env, {
    get(target, name) {
      if (typeof name === 'string') names.add(name);
      return Reflect.get(target, name);
    },
    has(target, name) {
      if (typeof name === 'string') names.add(name);
      return Reflect.has(target, name);
    },
  });
  readSettings(recording);
  return names;
}

describe('settings.contract.json', () => {
  it('names each setting once, with every field', () => {
    expect(new Set(entries.map((entry) => entry.name)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry, entry.name).toEqual({
        name: expect.stringMatching(/^[A-Z][A-Z0-9_]*$/),
        required: expect.stringMatching(/^(always|never|when .+)$/),
        values: expect.anything(),
        default: entry.default === null ? null : expect.any(String),
        purpose: expect.any(String),
        readBy: expect.stringMatching(/^(app|next)$/),
        docker: expect.stringMatching(/^(you|image|unused)$/),
        lambda: expect.stringMatching(/^(template|runtime|run\.sh|unused)$/),
      });
    }
  });

  it('lists every name the settings module reads', () => {
    const read = new Set(scenarios.flatMap((env) => [...namesRead(env)]));
    for (const name of read) {
      expect(byName.get(name)?.readBy, `${name} is read by app/lib/settings.ts but not in the contract`).toBe('app');
    }
  });

  it('lists no app setting that the settings module never reads', () => {
    const read = new Set(scenarios.flatMap((env) => [...namesRead(env)]));
    const unread = entries.filter((entry) => entry.readBy === 'app' && !read.has(entry.name)).map((e) => e.name);
    expect(unread).toEqual([]);
  });

  const alwaysRequired = entries.filter((entry) => entry.required === 'always').map((entry) => entry.name);

  it('has always-required settings', () => {
    expect(alwaysRequired).toEqual(['CREDENTIAL_STORE', 'EXCHANGES']);
  });

  it.each(alwaysRequired)('makes /health/ready answer 503 naming %s when it is left out', async (name) => {
    const env = { ...validEnv };
    delete env[name];

    const res = await runInContext(await createAppContext(env), () => GET());

    expect(res.status).toBe(503);
    const { problems } = await res.json();
    expect(problems).toEqual(expect.arrayContaining([expect.stringContaining(name)]));
  });

  it('is ready with only the always-required settings', async () => {
    const res = await runInContext(await createAppContext(validEnv), () => GET());
    expect(res.status).toBe(200);
  });
});
