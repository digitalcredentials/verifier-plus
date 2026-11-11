import { describe, expect, it } from 'vitest';

import { selectedTestStores } from './test-stores';

describe('selectedTestStores', () => {
  it('defaults to memory', () => {
    expect(selectedTestStores({})).toEqual(new Set(['memory']));
  });

  it('reads a comma list', () => {
    expect(selectedTestStores({ TEST_STORES: 'memory, mongodb,dynamodb' })).toEqual(new Set(['memory', 'mongodb', 'dynamodb']));
  });

  it('refuses an unknown name rather than skipping it', () => {
    expect(() => selectedTestStores({ TEST_STORES: 'memory,mongo' })).toThrow('TEST_STORES names mongo; use a comma list of memory, mongodb, dynamodb');
  });
});
