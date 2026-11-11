/**
 * Turns an error thrown in a route handler into the JSON error body the API
 * has always used: `{ status, error }`, with the error's statusCode (400 when
 * it has none, as for a body that is not JSON).
 */
export function processError(thrownError: unknown): Response {
  console.error(thrownError);
  const { statusCode, statusText, message } = (thrownError ?? {}) as {
    statusCode?: number;
    statusText?: string;
    message?: string;
  };
  return Response.json(
    { status: statusText || 'Invalid request', error: message ?? String(thrownError) },
    { status: statusCode || 400 },
  );
}
