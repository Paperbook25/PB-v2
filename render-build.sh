#!/usr/bin/env bash
# Render build script — builds all apps for production deployment
set -o errexit

echo "=== Node version ==="
node --version
npm --version

echo "=== Installing pnpm ==="
npm install -g pnpm@9

echo "=== Installing dependencies ==="
pnpm install --no-frozen-lockfile

echo "=== Generating Prisma client ==="
cd apps/server
npx prisma generate

echo "=== Running database migrations ==="
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null || echo "DB sync skipped"

echo "=== Building server ==="
npx tsc
cd ../..

echo "=== Building school app ==="
cd apps/school
npx vite build
cd ../..

echo "=== Building admin app (Gravity Portal) ==="
cd apps/admin
npx vite build
cd ../..

echo "=== Moving frontend builds to server ==="
cp -r apps/school/dist apps/server/client-dist
mkdir -p apps/server/admin-dist
cp -r apps/admin/dist/* apps/server/admin-dist/

echo "=== Build complete ==="
