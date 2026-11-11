/** A readiness probe for one dependency. Resolves when the dependency is usable. */
export type HealthCheck = () => Promise<void>;

export type ComponentHealth = {
  status: 'UP' | 'DOWN';
  durationMs: number;
  error?: string;
};

export const DEFAULT_HEALTH_CHECK_TIMEOUT_MS = 2000;

/**
 * Runs every check at once, each against its own timeout, so one slow
 * dependency cannot stall the response. Never rejects.
 */
export async function runHealthChecks(
  checks: Record<string, HealthCheck>,
  timeoutMs = DEFAULT_HEALTH_CHECK_TIMEOUT_MS,
): Promise<Record<string, ComponentHealth>> {
  const entries = await Promise.all(
    Object.entries(checks).map(async ([name, check]) => [name, await runOne(check, timeoutMs)] as const),
  );
  return Object.fromEntries(entries);
}

async function runOne(check: HealthCheck, timeoutMs: number): Promise<ComponentHealth> {
  const started = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timeout after ${timeoutMs} ms`)), timeoutMs);
  });
  try {
    await Promise.race([check(), timeout]);
    return { status: 'UP', durationMs: Date.now() - started };
  } catch (error) {
    return {
      status: 'DOWN',
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}
