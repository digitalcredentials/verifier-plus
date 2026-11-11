// TEMPORARY(transaction-service): remove with the in-app exchange
// Browser code only: polls the server's exchange route. The server's cache is
// in exchangeCache.ts, kept apart so client code never imports server code.

export async function pollExchange({
  exchangeUrl,
  onFetchVP,
  stopPolling, // Add stopPolling callback
}: {
  exchangeUrl: string;
  onFetchVP: (vp: any) => void;
  stopPolling: () => void; // Stop polling when credential is fetched
}): Promise<void> {
  const result = await fetch(exchangeUrl, {})

  if (result.ok && result.status === 200) {
    const vp = await result.json() as any;
    console.log('Fetched vp:', typeof vp, vp);
    onFetchVP(vp); // Pass the fetched VC back to onFetchVC callback
    stopPolling(); // Stop polling after credential is fetched
  }
}
