# ---------- build ----------
FROM node:24-slim AS build

WORKDIR /app




# Dependencies change far less often than source. Installing them on their own
# layer means editing a .ts file reuses the cached npm ci instead of redoing it.
COPY package*.json ./
RUN npm ci

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# generate needs a connection string to parse, but contacts no database. The
# real one is injected at runtime.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate
RUN npm run build

# ---------- runtime ----------
FROM node:24-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

# Prisma's migration engine is a native binary linked against OpenSSL, which
# node:24-slim does not ship.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# Needed so `prisma migrate deploy` can run inside this image on first boot.
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./

# Product images the API serves from disk. They are committed, unlike the
# uploads and generated artwork under storage/.
COPY assets ./assets


EXPOSE 3000
CMD ["node", "dist/server.js"]
