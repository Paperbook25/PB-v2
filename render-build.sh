#!/usr/bin/env bash
set -o errexit

# Enable corepack so Node uses the pnpm version from package.json
corepack enable
corepack prepare pnpm@9.15.0 --activate

echo "pnpm version: $(pnpm --version)"

# Install all workspace dependencies
pnpm install --no-frozen-lockfile

# Prisma: generate client + push schema
pnpm -C apps/server exec prisma generate
pnpm -C apps/server exec prisma db push --accept-data-loss || echo "DB sync skipped"

# Build all apps via turbo (respects dependency order)
pnpm run build

# Copy frontend builds into server directory for production serving
cp -r apps/school/dist apps/server/client-dist
mkdir -p apps/server/admin-dist
cp -r apps/admin/dist/* apps/server/admin-dist/

echo "Build complete"
