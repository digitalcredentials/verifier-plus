import { describeCredentialStore } from './contract';
import { MemoryCredentialStore } from './memory-store';

describeCredentialStore('memory', () => MemoryCredentialStore());
