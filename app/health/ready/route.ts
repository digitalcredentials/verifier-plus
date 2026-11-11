import { appContext } from '@/lib/context/context-store';
import { type ComponentHealth, type HealthCheck, runHealthChecks } from '@/lib/health';

// Answer every request fresh; never prerender or cache readiness.
export const dynamic = 'force-dynamic';

/**
 * GET /health/ready
 * 200 only when no setting has a problem and every dependency answers within
 * its timeout; otherwise 503. No writes and no calls back to this server.
 *
 * { "status": "UP" | "DOWN",
 *   "problems": ["CREDENTIAL_STORE is not set; ..."],
 *   "components": { "credentialStore": { "status": "UP", "durationMs": 3 } } }
 */
export async function GET() {
  const { settings, credentialStore } = await appContext();

  const checks: Record<string, HealthCheck> = {};
  if (credentialStore) checks.credentialStore = () => credentialStore.ping();
  const components: Record<string, ComponentHealth> = await runHealthChecks(checks);
  if (!credentialStore) {
    components.credentialStore = { status: 'DOWN', durationMs: 0, error: 'not configured' };
  }

  const up = settings.problems.length === 0 && Object.values(components).every((c) => c.status === 'UP');
  return Response.json(
    { status: up ? 'UP' : 'DOWN', problems: settings.problems, components },
    { status: up ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
