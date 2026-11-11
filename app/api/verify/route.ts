import { NextRequest } from 'next/server';
import { VerifiableCredential } from '@/types/credential';
import { appContext } from '@/lib/context/context-store';
import { isTimeoutError, OUTBOUND_TIMEOUT_MS, readTextWithin, withDeadline } from '@/lib/limits';
import { processError } from '@/lib/processError';
import { verifyCredential } from '@/lib/validate';

/**
 * POST /api/verify
 * Body: a credential, up to 5 MB (413 over it).
 * Answers 504 when the verification takes longer than 20 seconds.
 * @param request
 */
export async function POST(request: NextRequest) {
    const text = await readTextWithin(request);
    if (text === null) {
        return Response.json({ error: 'Request body too large (limit 5 MB)' }, { status: 413 });
    }
    let credential: VerifiableCredential;
    try {
        // TODO: handle presentations
        credential = JSON.parse(text) as VerifiableCredential;
    } catch (error) {
        return processError(error);
    }

    const { fetch } = await appContext();
    try {
        // One deadline around the whole verification, because verifier-core
        // makes its own fetches (DID documents, status lists, contexts) that
        // cannot be given a signal. On timeout the verification is abandoned,
        // not stopped: it may keep running until Lambda freezes the sandbox.
        const result = await withDeadline(OUTBOUND_TIMEOUT_MS, verifyCredential(credential, { fetch }));
        return Response.json({result})
    } catch (error) {
        if (isTimeoutError(error)) {
            return Response.json({ error: 'Verification timed out after 20 seconds' }, { status: 504 });
        }
        throw error;
    }
}
