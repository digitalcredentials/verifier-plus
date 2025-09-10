import { NextRequest } from 'next/server';
import * as credentials from '@/lib/credentials';

/**
 * GET /api/credentials/{publicCredentialId}
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ publicCredentialId: string }> }) {
  try {
    const { publicCredentialId } = await params
    // Returns a GetCredentialResult instance
    const result = await credentials.get({ publicCredentialId });
    return Response.json(result)
  } catch (e) {
    processError(e)
  }
}


/**
 * DELETE /api/credentials/{publicCredentialId}
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ publicCredentialId: string }> }) {
  try {
    const { publicCredentialId } = await params
    await credentials.unshare({ publicCredentialId });
    return Response.json({ message: 'Credential unshared.' })
  } catch (e) {
    processError(e)
  }
}

function processError(thrownError: any) {
  console.error(thrownError);
  const status = thrownError.statusCode || 400;
  const error = {
    status: thrownError.statusText || 'Invalid request',
    // @ts-ignore
    error: err.message
  }
  return Response.json(error, { status });
}
