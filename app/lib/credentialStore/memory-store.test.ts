import { describe } from 'vitest';

import { describeCredentialStore } from './contract';
import { MemoryCredentialStore } from './memory-store';
import { testStoreSelected } from './test-stores';

describe.runIf(testStoreSelected('memory'))('memory store', () => {
  describeCredentialStore('memory', () => MemoryCredentialStore());
});
