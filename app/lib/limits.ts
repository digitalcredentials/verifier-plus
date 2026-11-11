/**
 * Limits on outbound calls and on bodies, set to keep every request inside
 * API Gateway's 30 second timeout and Lambda's 6 MB payload limit.
 *
 * No server-only imports: validate.ts uses this and is reachable from client code.
 */

export const OUTBOUND_TIMEOUT_MS = 20_000;
export const MAX_BODY_BYTES = 5 * 1024 * 1024;

/** The error the limits below reject with, as AbortSignal.timeout's is named. */
export function TimeoutError(ms: number): DOMException {
  return new DOMException(`timed out after ${ms} ms`, 'TimeoutError');
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'TimeoutError';
}

/**
 * Settles as promise does, or rejects with a TimeoutError after ms. The work
 * behind promise is not stopped; it is only no longer waited for.
 */
export async function withDeadline<T>(ms: number, promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(TimeoutError(ms)), ms);
  });
  try {
    return await Promise.race([promise, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Runs work with a signal that aborts after ms, so a fetch and the reading of
 * its body both stop at the limit. Rejects with a TimeoutError then.
 *
 * Built on setTimeout rather than AbortSignal.timeout so that tests' fake
 * timers can move it.
 */
export async function withTimeout<T>(ms: number, work: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(TimeoutError(ms)), ms);
  try {
    return await work(controller.signal);
  } catch (error) {
    throw controller.signal.aborted ? controller.signal.reason : error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Reads a request's or response's body as UTF-8 text, or answers null when it
 * is larger than maxBytes. Checks Content-Length first, then counts the bytes
 * actually read and stops as soon as they pass the limit, so a missing or
 * false header cannot get past.
 */
export async function readTextWithin(
  message: { headers: Headers; body: ReadableStream<Uint8Array> | null },
  maxBytes = MAX_BODY_BYTES,
): Promise<string | null> {
  const declared = Number(message.headers.get('content-length'));
  if (declared > maxBytes) {
    await message.body?.cancel().catch(() => {});
    return null;
  }
  if (!message.body) return '';

  const reader = message.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel().catch(() => {});
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}
