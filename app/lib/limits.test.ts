import { afterEach, describe, expect, it, vi } from 'vitest';

import { isTimeoutError, readTextWithin, withDeadline, withTimeout } from './limits';

function streamOf(...chunks: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
}

describe('readTextWithin', () => {
  it('reads a body at exactly the limit', async () => {
    expect(await readTextWithin(new Response('abcde'), 5)).toBe('abcde');
  });

  it('answers null one byte over the limit', async () => {
    expect(await readTextWithin(new Response('abcdef'), 5)).toBeNull();
  });

  it('counts bytes, not characters', async () => {
    expect(await readTextWithin(new Response('ééé'), 5)).toBeNull();
  });

  it('decodes a character split across chunks', async () => {
    const [first, second] = [new TextEncoder().encode('é').subarray(0, 1), new TextEncoder().encode('é').subarray(1)];
    const message = { headers: new Headers(), body: streamOf(first, second) };
    expect(await readTextWithin(message, 5)).toBe('é');
  });

  it('answers null for a declared length over the limit without reading', async () => {
    const message = new Response('ab', { headers: { 'content-length': '6' } });
    expect(await readTextWithin(message, 5)).toBeNull();
  });

  it('reads an empty body', async () => {
    expect(await readTextWithin({ headers: new Headers(), body: null })).toBe('');
  });
});

describe('withDeadline and withTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('withDeadline answers what the promise answers in time', async () => {
    expect(await withDeadline(1000, Promise.resolve('done'))).toBe('done');
  });

  it('withDeadline rejects with a TimeoutError at the deadline', async () => {
    vi.useFakeTimers();
    const pending = withDeadline(1000, new Promise(() => {}));
    const rejected = expect(pending).rejects.toSatisfy(isTimeoutError);
    await vi.advanceTimersByTimeAsync(1000);
    await rejected;
  });

  it('withTimeout aborts the signal and rejects with a TimeoutError', async () => {
    vi.useFakeTimers();
    let seen: AbortSignal | undefined;
    const pending = withTimeout(1000, (signal) => {
      seen = signal;
      return new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
    });
    const rejected = expect(pending).rejects.toSatisfy(isTimeoutError);
    await vi.advanceTimersByTimeAsync(1000);
    await rejected;
    expect(seen?.aborted).toBe(true);
  });

  it('withTimeout passes on other errors', async () => {
    await expect(withTimeout(1000, async () => { throw new Error('boom'); })).rejects.toThrow('boom');
  });
});
