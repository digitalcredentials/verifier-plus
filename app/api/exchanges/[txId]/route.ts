import { NextRequest } from 'next/server';
import { exchanges } from '@/lib/exchanges';

/**
 * GET /api/exchanges/[txId]
 * @param request
 */
export async function GET(request: NextRequest,
  { params }: { params: Promise<{ txId: string }> }) {
  try {
    const { txId } = await params
    console.log('Looking for tx', txId, exchanges.get(txId))
    if (exchanges.has(txId)) {
      console.log("WE SHOULD HAVE DOUND THE TRANSACTON AT THIS POINT.")
      return Response.json(exchanges.get(txId));
    } else {
      console.log('Incoming GET: tx not found.')
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
    const { txId } = await params
    const body = await request.json()
    console.log('Incoming POST:', body)
    const payload = JSON.stringify(body);
    if (payload === '{}') {
      // Initial POST by the wallet, send the VP Request query
      const query = vprQuery()
      return Response.json(query);
    } else {
      // Requested credentials sent by the wallet
      // Store in the exchanges cache
      console.log('Storing txId', txId, payload)
      exchanges.set(txId, payload)
      return Response.json({ status: 'received' });
    }
  } catch (err: any) {
    return processError(err)
  }
}

function processError(err: any) {
  console.error(err);
  const status = err.statusCode || 400;
  const error = {
    status: err.statusText || 'Invalid request',
    // @ts-ignore
    error: err.message
  }
  return Response.json(error, { status });
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


