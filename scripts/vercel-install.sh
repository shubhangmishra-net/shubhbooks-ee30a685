#!/usr/bin/env sh
# Vercel install step. Goals: never use the Lovable sandbox package cache (it returns 429 to Vercel),
# and never fail on optional package setup scripts (esbuild's postinstall can trip over bun's
# hoisted binaries, e.g. "Expected 0.28.2 but got 0.25.12"). The build itself needs none of those scripts.
set -e
REGISTRY="https://registry.npmjs.org/"
export NPM_CONFIG_REGISTRY="$REGISTRY"
export BUN_CONFIG_REGISTRY="$REGISTRY"

# 1. Point every locked download at the public npm registry (same packages, same integrity hashes).
sed -i 's#https://europe-west4-npm.pkg.dev/lovable-core-prod/sandbox-npm-cache/#https://registry.npmjs.org/#g' bun.lock

# 2. Install exactly what the lockfile says, skipping package setup scripts. Fall back to a normal install.
if ! bun install --frozen-lockfile --ignore-scripts --registry "$REGISTRY"; then
  echo "Frozen install failed; retrying without the frozen lockfile"
  rm -rf node_modules
  bun install --ignore-scripts --registry "$REGISTRY"
fi

# 3. Sanity check: the build tools must load.
node -e "require('esbuild'); console.log('esbuild ok')"
node -e "import('vite').then(() => console.log('vite ok'))"
