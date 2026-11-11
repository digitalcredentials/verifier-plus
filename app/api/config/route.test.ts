import { describe, expect, it } from 'vitest';

import { createAppContext } from '@/lib/context/app-context';
import { runInContext } from '@/lib/context/context-store';
import type { Env } from '@/lib/settings';

import { GET } from './route';

async function config(env: Env, headers: Record<string, string> = {}, url = 'http://localhost:3000/api/config') {
  const ctx = await createAppContext({ CREDENTIAL_STORE: 'memory', ...env });
  return runInContext(ctx, () => GET(new Request(url, { headers })));
}

describe('GET /api/config', () => {
  it('reports exchanges off, with no server URL', async () => {
    const res = await config({ EXCHANGES: 'off' }, { host: 'verifierplus.org' });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(await res.json()).toEqual({ exchanges: false, exchangeServerUrl: null });
  });

  it('reports exchanges off when they are refused on Lambda', async () => {
    const res = await config({ EXCHANGES: 'on', AWS_LAMBDA_FUNCTION_NAME: 'verifier-plus' });
    expect(await res.json()).toEqual({ exchanges: false, exchangeServerUrl: null });
  });

  it('reports exchanges on, at the origin from the Host header', async () => {
    const res = await config({ EXCHANGES: 'on' }, { host: 'verifier.example.org:8080' });
    expect(await res.json()).toEqual({ exchanges: true, exchangeServerUrl: 'http://verifier.example.org:8080' });
  });

  it('prefers X-Forwarded-Host and X-Forwarded-Proto, taking the first of each list', async () => {
    const res = await config(
      { EXCHANGES: 'on' },
      {
        host: 'abc123.execute-api.us-east-1.amazonaws.com',
        'x-forwarded-host': 'verifierplus.org, abc123.execute-api.us-east-1.amazonaws.com',
        'x-forwarded-proto': 'https, http',
      },
    );
    expect(await res.json()).toEqual({ exchanges: true, exchangeServerUrl: 'https://verifierplus.org' });
  });

  it('reports EXCHANGE_SERVER_URL when it is set, whatever the request', async () => {
    const res = await config(
      { EXCHANGES: 'on', EXCHANGE_SERVER_URL: 'https://verifierplus.org' },
      { host: 'localhost:3000', 'x-forwarded-host': 'elsewhere.example' },
    );
    expect(await res.json()).toEqual({ exchanges: true, exchangeServerUrl: 'https://verifierplus.org' });
  });
});
