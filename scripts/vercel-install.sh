#!/usr/bin/env sh
# Vercel cannot use the Lovable sandbox package cache recorded in bun.lock (it rate-limits outside callers).
# Rewrite those tarball URLs to the public npm registry (same packages, same integrity hashes), then install.
set -e
sed -i 's#https://europe-west4-npm.pkg.dev/lovable-core-prod/sandbox-npm-cache/#https://registry.npmjs.org/#g' bun.lock
bun install --frozen-lockfile --registry https://registry.npmjs.org/
