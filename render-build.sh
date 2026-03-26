#!/usr/bin/env bash
# Render build script — builds all apps for production deployment
# Uses pnpm workspaces + Turborepo
set -o errexit

echo "=== Installing pnpm ==="
npm install -g pnpm@9

echo "=== Installing dependencies ==="
pnpm install --frozen-lockfile

echo "=== Generating Prisma client ==="
cd apps/server
npx prisma generate

echo "=== Running database migrations ==="
npx prisma migrate deploy || echo "Migration skipped (using db push in dev)"

echo "=== Building server ==="
pnpm build
cd ../..

echo "=== Building school app (frontend) ==="
cd apps/school
pnpm build
cd ../..

echo "=== Building admin app (Gravity Portal) ==="
cd apps/admin
pnpm build
cd ../..

echo "=== Moving frontend builds to server directory ==="
# School app → served by Express in production
cp -r apps/school/dist apps/server/client-dist

# Admin app → served separately or as subfolder
mkdir -p apps/server/admin-dist
cp -r apps/admin/dist/* apps/server/admin-dist/

echo "=== Build complete ==="
echo "Server: apps/server/dist/"
echo "School frontend: apps/server/client-dist/"
echo "Admin frontend: apps/server/admin-dist/"
