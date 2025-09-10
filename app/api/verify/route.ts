import { NextRequest } from 'next/server';
import { VerifiableCredential } from '@/types/credential';
import { verifyCredential } from '@/lib/validate';

/**
 * POST /api/verify
 * @param request
 */
export async function POST(request: NextRequest) {
    // TODO: handle presentations
    const credential = await request.json() as VerifiableCredential;
    const result = await verifyCredential(credential);
    return Response.json(result)
}
