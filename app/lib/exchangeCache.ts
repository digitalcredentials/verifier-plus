// TEMPORARY(transaction-service): remove with the in-app exchange
import { LRUCache } from 'lru-cache';

import { VC_API_EXCHANGE_TIMEOUT } from './config';

/**
 * Request exchanges by transaction id, each holding the JSON a wallet posted.
 * Server only. Kept in this process's memory, which is why Lambda refuses
 * EXCHANGES=on: another instance would not see it.
 */
export type ExchangeCache = Pick<LRUCache<string, string>, 'get' | 'set' | 'has'>;

// TEMPORARY(transaction-service): remove with the in-app exchange
export function ExchangeCache(): ExchangeCache {
  return new LRUCache<string, string>({ ttl: VC_API_EXCHANGE_TIMEOUT, ttlAutopurge: true });
}
