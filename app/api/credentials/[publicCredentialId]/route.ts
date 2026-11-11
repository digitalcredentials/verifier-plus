import { NextRequest } from 'next/server';
import { getSharedCredential, unshareCredential } from '@/lib/credentials';
import { processError } from '@/lib/processError';

/**
 * GET /api/credentials/{publicCredentialId}
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ publicCredentialId: string }> }) {
  try {
    const { publicCredentialId } = await params
    const result = await getSharedCredential(publicCredentialId);
    return Response.json(result)
  } catch (e) {
    return processError(e)
  }
}


/**
 * DELETE /api/credentials/{publicCredentialId}
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ publicCredentialId: string }> }) {
  try {
    const { publicCredentialId } = await params
    await unshareCredential(publicCredentialId);
    return Response.json({ message: 'Credential unshared.' })
  } catch (e) {
    return processError(e)
  }
}
