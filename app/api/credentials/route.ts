import type { NextApiRequest, NextApiResponse } from 'next'
import * as credentials from 'lib/credentials';

/**
 * POST /api/credentials
 * Adds a new credential to the database.
 *
 * Request:
 * - `Content-type: application/json` header is required (otherwise, the JSON
 *   body parser for Next.js API routes won't activate).
 *
 * - Body is of the format:
 * {
 *   vp: signed verifiable presentation goes here
 * }
 *
 * Response (content-type: application/json):
 * {
 *   "url": {
 *     // human-readable HTML view of the credential
 *     "view": "/credentials/{publicCredentialId}",
 *
 *     // raw JSON GET (used by the html view)
 *     "get": "/api/credentials/{publicCredentialId}",
 *
 *     // used for DELETE/unshare API
 *     "unshare": "/api/credentials/{publicCredentialId}"
 *   }
 * }
 *
 * (Note the /api/ prefix in the get and unshare URLs, above).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        const result = await credentials.post(req.body);
        
        res.setHeader('Location', result.url.view);
        res.status(201).json({ status: 'Credential added', ...result });
        break;
      default:
        res.setHeader('Allow', 'POST');
        res.status(405).json({ status: 'Method not allowed' })
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'Invalid request',
      // @ts-ignore
      error: error.message
    })
  }
}
