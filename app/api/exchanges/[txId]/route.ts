// TEMPORARY(transaction-service): remove with the in-app exchange
import { NextRequest } from 'next/server';
import { appContext } from '@/lib/context/context-store';
import { processError } from '@/lib/processError';

/** The answer to every exchange request while EXCHANGES is off. */
function exchangesDisabled() {
  return Response.json(
    {
      status: 'Exchanges disabled',
      error: 'Request exchanges are turned off on this server (EXCHANGES=off).',
    },
    { status: 404 },
  );
}

/**
 * GET /api/exchanges/[txId]
 * @param request
 */
export async function GET(request: NextRequest,
  { params }: { params: Promise<{ txId: string }> }) {
  try {
    const { exchanges } = await appContext();
    if (!exchanges) return exchangesDisabled();
    const { txId } = await params
    if (exchanges.has(txId)) {
      return Response.json(exchanges.get(txId));
    } else {
      return new Response('Not found', { status: 404 });
    }
  } catch (err: any) {
    return processError(err);
  }
}

/**
 * POST /api/exchanges/[txId]
 * @param request
 */
export async function POST(request: NextRequest,
  { params }: { params: Promise<{ txId: string }> }) {
  try {
    const { exchanges } = await appContext();
    if (!exchanges) return exchangesDisabled();
    const { txId } = await params
    const body = await request.json()
    const payload = JSON.stringify(body);
    if (payload === '{}') {
      // Initial POST by the wallet, send the VP Request query
      const query = vprQuery()
      return Response.json(query);
    } else {
      // Requested credentials sent by the wallet
      // Store in the exchanges cache
      exchanges.set(txId, payload)
      return Response.json({ status: 'received' });
    }
  } catch (err: any) {
    return processError(err)
  }
}

export function vprQuery() {
  return {
    "verifiablePresentationRequest": {
      "query": [
        {
          "type": "QueryByExample",
          "credentialQuery": {
            "reason": "Please present your Verifiable Credential to complete the verification process.",
            "example": {
              "type": ["VerifiableCredential"]
            }
          }
        }
      ]
    }
  }
}
