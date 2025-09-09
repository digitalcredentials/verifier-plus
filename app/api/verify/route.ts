import type { NextApiRequest, NextApiResponse } from 'next'
import { VerifiableCredential } from 'types/credential';
import { verifyCredential } from 'lib/validate';

/**
 * POST /api/verify
 * @param req
 * @param res
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // TODO: handle presentations
    const credential = JSON.parse(req.body) as VerifiableCredential;
    const result = await verifyCredential(credential);
    res.status(200).json({ result });
  } else {
    res.status(400).json({ status: 'Invalid Request' })
  }
}
