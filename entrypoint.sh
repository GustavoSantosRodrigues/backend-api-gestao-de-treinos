#!/bin/sh
set -e

echo "▶ Running database migrations..."
./node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma

echo "▶ Starting application..."
exec node dist/index.js