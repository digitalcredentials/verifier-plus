import { NextRequest } from 'next/server';
import { shareCredential } from '@/lib/credentials';
import { processError } from '@/lib/processError';

/**
 * POST /api/credentials
 * Shares a credential.
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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await shareCredential(body);
    const headers = { 'Location': result.url.view };
    return Response.json({ status: 'Credential added', ...result }, { status: 201, headers });
  } catch (error) {
    return processError(error);
  }
}
