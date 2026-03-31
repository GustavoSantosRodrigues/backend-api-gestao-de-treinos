FROM node:24-bookworm-slim AS base

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./ 

# Install dependencies
FROM base AS deps

RUN npm ci

# Build the application
FROM deps AS build

COPY . .

RUN npx prisma generate
RUN npx tsc

# Production
FROM node:24-bookworm-slim AS production

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./ 

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma 
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh

CMD ["sh", "entrypoint.sh"]