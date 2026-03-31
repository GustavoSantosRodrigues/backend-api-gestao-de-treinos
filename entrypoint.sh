#!/bin/sh
set -e

echo "▶ Resolving existing migrations (safe to ignore errors)..."
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260312170534_init 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260313164037_add_weight_suggestion_and_notes_to_exercise 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260313164802_rename_note_to_notes_in_exercise 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260314180519_add_exercise_log 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260318155108_add_nutrition_feature 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260318184038_remove_nutrition_cover_image 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260330144653_add_exercise_relation 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260330150705_add_exercise_relation 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260330164331_add_exercise_relation 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260330215615_add_exercise_relation 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260330220428_add_exercise_relation 2>/dev/null || true
./node_modules/.bin/prisma migrate resolve --schema=prisma/schema.prisma --applied 20260330221353_add_exercise_relation 2>/dev/null || true

echo "▶ Running database migrations..."
./node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma

echo "▶ Starting application..."
exec node dist/index.js