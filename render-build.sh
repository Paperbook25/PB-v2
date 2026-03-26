#!/usr/bin/env bash
# Render build script — uses npm directly (not pnpm) for compatibility
set -o errexit

echo "=== Node version ==="
node --version

echo "=== Installing ALL dependencies via npm ==="
# Install root dependencies
npm install

# Install each app's dependencies
cd apps/server && npm install && cd ../..
cd apps/school && npm install && cd ../..
cd apps/admin && npm install && cd ../..

echo "=== Generating Prisma client ==="
cd apps/server
npx prisma generate

echo "=== Syncing database ==="
npx prisma db push --accept-data-loss 2>/dev/null || echo "DB sync skipped"

echo "=== Building server (TypeScript) ==="
npx tsc
cd ../..

echo "=== Building school app (Vite) ==="
cd apps/school
npx vite build
cd ../..

echo "=== Building admin app (Vite) ==="
cd apps/admin
npx vite build
cd ../..

echo "=== Copying frontend builds ==="
cp -r apps/school/dist apps/server/client-dist
mkdir -p apps/server/admin-dist
cp -r apps/admin/dist/* apps/server/admin-dist/

echo "=== Build complete ==="
