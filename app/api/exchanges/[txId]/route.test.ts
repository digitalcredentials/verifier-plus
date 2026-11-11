import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { runInContext } from '@/lib/context/context-store';
import { createTestAppContext } from '@/lib/context/testing';
import { ExchangeCache } from '@/lib/exchangeCache';

import { GET, POST, vprQuery } from './route';

const url = 'http://verifier.test/api/exchanges/tx-1';
const params = { params: Promise.resolve({ txId: 'tx-1' }) };

function post(body: unknown) {
  return POST(new NextRequest(url, { method: 'POST', body: JSON.stringify(body) }), params);
}

function get() {
  return GET(new NextRequest(url), params);
}

const disabled = {
  status: 'Exchanges disabled',
  error: 'Request exchanges are turned off on this server (EXCHANGES=off).',
};

describe('the exchange route', () => {
  it('answers 404 with the disabled body to GET and POST when exchanges are off', async () => {
    await runInContext(createTestAppContext({ exchanges: null }), async () => {
      for (const res of [await get(), await post({})]) {
        expect(res.status).toBe(404);
        expect(await res.json()).toEqual(disabled);
      }
    });
  });

  it('answers the VP request to an empty POST, then keeps what the wallet posts', async () => {
    await runInContext(createTestAppContext({ exchanges: ExchangeCache() }), async () => {
      const started = await post({});
      expect(started.status).toBe(200);
      expect(await started.json()).toEqual(vprQuery());

      expect((await get()).status).toBe(404);

      const presentation = { verifiablePresentation: { verifiableCredential: [{ id: 'urn:x' }] } };
      const received = await post(presentation);
      expect(await received.json()).toEqual({ status: 'received' });

      const fetched = await get();
      expect(fetched.status).toBe(200);
      // Kept as the JSON text the wallet sent; the page parses it.
      expect(JSON.parse(await fetched.json())).toEqual(presentation);
    });
  });
});
