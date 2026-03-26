#!/usr/bin/env bash
set -o errexit

echo "=== Installing pnpm ==="
corepack enable 2>/dev/null || npm install -g pnpm@9
pnpm --version

echo "=== Installing dependencies ==="
pnpm install --no-frozen-lockfile

echo "=== Prisma generate ==="
cd apps/server
node_modules/.bin/prisma generate 2>/dev/null || ../node_modules/.bin/prisma generate 2>/dev/null || ../../node_modules/.bin/prisma generate 2>/dev/null || pnpm dlx prisma generate
echo "Prisma client generated"

echo "=== Database sync ==="
node_modules/.bin/prisma db push --accept-data-loss 2>/dev/null || ../../node_modules/.bin/prisma db push --accept-data-loss 2>/dev/null || echo "DB sync skipped"
cd ../..

echo "=== Building all apps ==="
# Use turbo if available, otherwise build each app individually
if command -v turbo &>/dev/null || [ -f node_modules/.bin/turbo ]; then
  echo "Using turbo build..."
  node_modules/.bin/turbo run build 2>/dev/null || pnpm turbo run build 2>/dev/null || {
    echo "Turbo failed, building individually..."
    cd apps/server && ../../node_modules/.bin/tsc && cd ../..
    cd apps/school && ../../node_modules/.bin/vite build && cd ../..
    cd apps/admin && ../../node_modules/.bin/vite build && cd ../..
  }
else
  echo "Building individually..."
  cd apps/server && ../../node_modules/.bin/tsc && cd ../..
  cd apps/school && ../../node_modules/.bin/vite build && cd ../..
  cd apps/admin && ../../node_modules/.bin/vite build && cd ../..
fi

echo "=== Copying frontend builds ==="
cp -r apps/school/dist apps/server/client-dist
mkdir -p apps/server/admin-dist
cp -r apps/admin/dist/* apps/server/admin-dist/

echo "=== Done ==="
