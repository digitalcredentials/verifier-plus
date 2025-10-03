import { defineConfig, devices } from "@playwright/test";
import path from "path";

// Use process.env.PORT if set, otherwise fallback to port 3000
const PORT = process.env.PORT || 3000;

// run tests against env value if set, otherwise fallback to localhost
const baseURL = process.env.PLAYWRIGHT_TEST_URL || `http://localhost:${PORT}`;
const baseURLAPI = `${baseURL}/api/credentials/`

// Reference: https://playwright.dev/docs/test-configuration
export default defineConfig({
  // Timeout per test
  timeout: 30 * 1000,
  // Test directory
  testDir: path.join(__dirname, "tests"),
  // If a test fails, retry it additional 2 times
  retries: 2,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: "test-results/",

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests

  // can have playwright fire up a server against which to test, say for CI
  // but for the verifierPlus api tests you'd need a running mongo instance too
  /*webServer: {
    command: "npm run dev",
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },*/

  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Retry a test if its failing with enabled tracing. This allows you to analyze the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: "retry-with-trace",

    // All available context options: https://playwright.dev/docs/api/class-browser#browser-new-context
    // contextOptions: {
    //   ignoreHTTPSErrors: true,
    // },
  },

  projects: [
    {
      name: 'API',
      testMatch: /.*api.spec.ts/,
      retries: 0,
      use: {
        extraHTTPHeaders: {
          // not sure if this header is really needed
          'Content-Type': 'application/json'
      }
      }
    },
    {
      name: "DesktopChrome",
      testIgnore: /.*api.spec.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    // {
    //   name: 'Desktop Firefox',
    //.  testIgnore: /.*api.spec.ts/,
    //   use: {
    //     ...devices['Desktop Firefox'],
    //   },
    // },
    // {
    //   name: 'Desktop Safari',
    //.  testIgnore: /.*api.spec.ts/,
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },
    // Test against mobile viewports.
    {
      name: "MobileChrome",
      testIgnore: /.*api.spec.ts/,
      use: {
        ...devices["Pixel 5"],
      },
    },
    {
      name: "MobileSafari",
      testIgnore: /.*api.spec.ts/,
      use: devices["iPhone 12"],
    },
  ],
});
