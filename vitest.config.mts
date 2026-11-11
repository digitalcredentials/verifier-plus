import { defineConfig } from 'vitest/config';

// Unit tests only. Playwright's end-to-end tests in tests/ run with `npm run test:e2e`.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts'],
  },
});
