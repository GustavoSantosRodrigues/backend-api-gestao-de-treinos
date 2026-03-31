FROM node:24-slim AS base

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
FROM base AS deps

RUN npm ci

# Build the application
FROM deps AS build

COPY . .

RUN npm run build && cp -r src/generated ./dist/generated || true

# Production
FROM node:24-slim AS production

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh

CMD ["sh", "entrypoint.sh"]