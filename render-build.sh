#!/usr/bin/env bash
# Render build script — uses pnpm with --filter for workspace compatibility
set -o errexit

echo "=== Node version ==="
node --version

echo "=== Installing pnpm globally ==="
npm install -g pnpm@9

echo "=== Installing all workspace dependencies ==="
pnpm install --no-frozen-lockfile

echo "=== Generating Prisma client ==="
pnpm --filter "@paperbook/server" exec prisma generate

echo "=== Syncing database schema ==="
pnpm --filter "@paperbook/server" exec prisma db push --accept-data-loss 2>/dev/null || echo "DB sync skipped"

echo "=== Building server ==="
pnpm --filter "@paperbook/server" run build

echo "=== Building school app ==="
pnpm --filter "@paperbook/school" run build

echo "=== Building admin app (Gravity Portal) ==="
pnpm --filter "@paperbook/admin" run build

echo "=== Copying frontend builds ==="
cp -r apps/school/dist apps/server/client-dist
mkdir -p apps/server/admin-dist
cp -r apps/admin/dist/* apps/server/admin-dist/

echo "=== Build complete ==="
