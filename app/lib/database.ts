import { MongoClient } from 'mongodb';
import { LruCache } from '@digitalbazaar/lru-memoize';

// Env vars are read in from .env.local
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME as string || 'verifier-plus';
const DB_COLLECTION = process.env.DB_COLLECTION as string || 'credentials';
const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}`;

declare global {
  var clientPool: any | undefined;
}

export async function cachedClient() {
  return clientPool.memoize({
    key: 'cachedClient',
    fn: async () => {
      await client.connect();
      console.log(`Connected to: mongodb+srv://{DB_USER}:{DB_PASS}@${DB_HOST}`);
      const db = client.db(DB_NAME);
      const credentialsCollection = db.collection(DB_COLLECTION);
      return { client, db, credentialsCollection };
    }
  });
}
export const clientPool = globalThis.clientPool ||
  new LruCache({
    // Called when a client is evicted from cache
    dispose ({ client }: any) {
      return client.close()
    }
  });
globalThis.clientPool = clientPool;

const client = new MongoClient(DB_URI, { maxPoolSize: 20 });
