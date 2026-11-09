import { NextRequest } from 'next/server';
import * as shortLinks from '@/lib/shortLinks';

// The LCW web wallet calls this from its own domain
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

/**
 * POST /api/short-links
 * Creates a short link for a credential's public URL in wallet storage (201),
 * or returns the short link that URL already has (200).
 *
 * Request body:
 * {
 *   url: "https://was.lcw-sandbox.org/space/{spaceId}/public/{file}"
 * }
 *
 * Response (content-type: application/json):
 * {
 *   "status": "Short link created" (201) or "Short link found" (200),
 *   "id": "{shortLinkId}",
 *   "url": {
 *     // short link that opens the credential in VerifierPlus
 *     "view": "/s/{shortLinkId}"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { created, ...shortLink } = await shortLinks.post(payload);
    if (!created) {
      return Response.json({ status: 'Short link found', ...shortLink }, { status: 200, headers })
    }
    return Response.json({ status: 'Short link created', ...shortLink },
      { status: 201, headers: { ...headers, 'Location': shortLink.url.view } })
  } catch (error: any) {
    console.error(error);
    if (error instanceof SyntaxError || error.statusCode === 400) {
      return Response.json({
        status: 'Invalid request',
        error: error.message
      }, { status: 400, headers })
    }
    return Response.json({
      status: 'Server error',
      error: 'Could not create a short link. Please try again.'
    }, { status: 500, headers })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers })
}
