// TEMPORARY(transaction-service): remove with the in-app exchange
import { appContext } from '@/lib/context/context-store';
import { requestOrigin } from '@/lib/requestOrigin';

// Answer every request fresh: the origin comes from the request.
export const dynamic = 'force-dynamic';

/**
 * GET /api/config
 * What the browser needs to offer "Request credentials from LCW".
 *
 * { "exchanges": true, "exchangeServerUrl": "https://verifierplus.org" }
 *
 * exchanges is true only when EXCHANGES=on and it is allowed here.
 * exchangeServerUrl is EXCHANGE_SERVER_URL, or else the origin the request
 * came in on; null when exchanges are off.
 */
export async function GET(request: Request) {
  const { exchanges, settings } = await appContext();
  const on = exchanges !== null;
  return Response.json(
    {
      exchanges: on,
      exchangeServerUrl: on ? (settings.values.exchangeServerUrl ?? requestOrigin(request)) : null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
