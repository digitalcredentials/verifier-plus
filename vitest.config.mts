import { defineConfig } from 'vitest/config';

// Unit tests, in app/ and scripts/. Playwright's end-to-end tests in tests/ run with `npm run test:e2e`.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
});
