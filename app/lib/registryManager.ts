import { RegistryClient } from '@digitalcredentials/issuer-registry-client';
import { KnownDidRegistries } from '../../data/knownRegistries';

/**
 * Loads remote Known Issuer / Known Verifier DID registries from config.
 */
async function loadKnownDidRegistries({
  client,
}: {
  client: RegistryClient;
}) {
  await client.load({ config: KnownDidRegistries });
  // Now available for usage through the cachedRegistryClient.
}

// Cache for storing the data
let didRegistryClient: RegistryClient = new RegistryClient();

// Function to fetch and cache the data
async function fetchRegistries() {
  try {
    await loadKnownDidRegistries({ client: didRegistryClient });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
export async function getCachedRegistryClient(){
    await fetchRegistries();
  return didRegistryClient;
}
