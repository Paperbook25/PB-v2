#!/usr/bin/env bash
# Render build script - builds both frontend and backend for single-instance deployment
set -o errexit

echo "=== Installing frontend dependencies ==="
npm ci

echo "=== Installing server dependencies ==="
cd server
npm ci

echo "=== Generating Prisma client ==="
npx prisma generate

echo "=== Running database migrations ==="
npx prisma migrate deploy

echo "=== Seeding database (if empty) ==="
npx prisma db seed || echo "Seed skipped or already seeded"

echo "=== Building server ==="
npm run build
cd ..

echo "=== Building frontend ==="
npm run build

echo "=== Moving frontend build to server directory ==="
# The server expects the frontend build at server/client-dist/
cp -r dist server/client-dist

echo "=== Build complete ==="
