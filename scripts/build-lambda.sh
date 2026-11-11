#!/usr/bin/env bash
# Builds the app for AWS Lambda with the Lambda Web Adapter, into dist/lambda/.
#
# The result is a directory, not a zip: the deployment zips it. Lambda runs
# dist/lambda/run.sh through the adapter, which proxies each request to the
# Next.js standalone server on PORT.
#
# Build on Linux x86_64 for a deployable artifact: the standalone output holds
# native modules (sharp) for the platform it was built on.
set -euo pipefail

cd "$(dirname "$0")/.."
out=dist/lambda

npm run build

rm -rf "$out"
mkdir -p "$out"

# The same files the Dockerfile copies into its runner image.
cp -R .next/standalone/. "$out/"
mkdir -p "$out/.next"
cp -R .next/static "$out/.next/static"
cp -R public "$out/public"

# Lambda's file system is read-only except /tmp, so Next's cache goes there.
rm -rf "$out/.next/cache"
ln -s /tmp/cache "$out/.next/cache"

cat > "$out/run.sh" <<'EOF'
#!/bin/bash
# Lambda Web Adapter entry. The adapter starts this and proxies HTTP API
# events to the server on PORT. Lambda starts it from the code directory;
# the cd lets it run from anywhere else too (CI's smoke test).
cd "$(dirname "$0")"
mkdir -p /tmp/cache
export HOSTNAME=0.0.0.0
export PORT="${PORT:-8080}"
exec node server.js
EOF
chmod 755 "$out/run.sh"

missing=0
for path in run.sh server.js .next/static public; do
  if [ ! -e "$out/$path" ]; then
    echo "build:lambda: $out/$path is missing" >&2
    missing=1
  fi
done
if [ ! -x "$out/run.sh" ]; then
  echo "build:lambda: $out/run.sh is not executable" >&2
  missing=1
fi
if [ "$missing" -ne 0 ]; then
  exit 1
fi

echo "build:lambda: wrote $out/"
