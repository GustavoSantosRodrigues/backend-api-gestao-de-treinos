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

RUN npx prisma generate
RUN npx tsc

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