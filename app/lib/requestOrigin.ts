/**
 * The origin the caller used to reach this server, for building links back to
 * it. No host is hardcoded, so the same build works behind API Gateway, a
 * CloudFront distribution in front of it, or Docker.
 *
 * X-Forwarded-Proto and X-Forwarded-Host win when present (the first value of
 * each, when a chain of proxies has listed several); otherwise the Host header
 * and the protocol of the request URL.
 */
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto = firstValue(request.headers.get('x-forwarded-proto')) ?? url.protocol.replace(/:$/, '');
  const host = firstValue(request.headers.get('x-forwarded-host')) ?? request.headers.get('host') ?? url.host;
  return `${proto}://${host}`;
}

function firstValue(header: string | null): string | undefined {
  return header?.split(',')[0].trim() || undefined;
}
