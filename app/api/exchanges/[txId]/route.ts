import type { NextApiRequest, NextApiResponse } from 'next';
import { exchanges } from '../../../lib/exchanges';

/**
 * POST /api/exchanges/[txId]
 * @param req
 * @param res
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { txId } = req.query;

    if(!txId) {
      throw new Error('Transaction id is required.');
    }

    switch (req.method) {
      case 'GET':
        console.log('Looking for tx', txId, exchanges.get(txId))

        if (exchanges.has(txId)) {
          res.status(200).json(exchanges.get(txId));
          // exchanges.delete(txId);
        } else {
          console.log('Incoming GET: tx not found.')
          res.status(404).send('Not found');
        }
        break;
      case 'POST':
        const payload = JSON.stringify(req.body);

        console.log('Incoming POST:', req.body)

        if (payload === '{}') {
          // Initial POST by the wallet, send the VP Request query
          const query = vprQuery()
          res.status(200).json(query)
        } else {
          // Requested credentials sent by the wallet
          // Store in the exchanges cache
          console.log('Storing txId', txId, payload)
          exchanges.set(txId, payload)
          res.status(200).json({ status: 'received' })
        }

        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ status: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error(error);

    const statusCode = error.statusCode || 400;

    res.status(statusCode).json({
      status: error.statusText || 'Invalid request',
      // @ts-ignore
      error: error.message
    })
  }
}

function vprQuery() {
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

/**
 * Check to see if wallet has returned the requested VC API query response.
 * Used by the 'Request from Wallet' button.
 *
 * @param txId - Unique random transaction id polled by a browser instance.
 */
async function pollForTx(req: NextApiRequest, res: NextApiResponse, txId: string) {
  // Check the memoized exchanges cache to see if wallet has responded
  // with credentials
}

/**
 * @param txId - Unique random transaction id polled by a browser instance.
 */
async function postTx(req: NextApiRequest, res: NextApiResponse, txId: string) {

}
