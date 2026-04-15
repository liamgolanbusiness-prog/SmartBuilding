# ---------------------------------------------------------------
# Lobbix — production Docker image
# Monorepo layout: all app code lives inside backend/
# Used by: Railway, Render, Fly.io, DigitalOcean App Platform
# ---------------------------------------------------------------

# ---- Stage 1: builder ----
FROM node:20-alpine AS builder

# better-sqlite3 is a native module and needs python3 + make + g++
# to compile. We install them as a virtual package so they can be
# easily removed after the build.
RUN apk add --no-cache --virtual .gyp python3 make g++

WORKDIR /app

# Install deps first (leverages Docker layer cache)
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

# Copy source + build TypeScript
COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY backend/public ./public
RUN npm run build

# tsc only emits .ts -> .js; copy non-TS assets (SQL schema) into dist so
# the runtime auto-migrate in config/database.ts can find the schema file.
RUN mkdir -p dist/db && cp src/db/schema.sqlite.sql dist/db/schema.sqlite.sql

# Remove dev dependencies for a slimmer final image
RUN npm prune --omit=dev

# Clean up the build-only system packages
RUN apk del .gyp

# ---- Stage 2: runtime ----
FROM node:20-alpine AS runtime

# Non-root user for security
RUN addgroup -S lobbix && adduser -S lobbix -G lobbix

WORKDIR /app

# Copy only what the runtime needs
COPY --from=builder --chown=lobbix:lobbix /app/node_modules ./node_modules
COPY --from=builder --chown=lobbix:lobbix /app/dist ./dist
COPY --from=builder --chown=lobbix:lobbix /app/public ./public
COPY --from=builder --chown=lobbix:lobbix /app/package.json ./

# Create the persistent data directory so the SQLite fallback works
# even if no volume is mounted. On Railway, attach a volume at /app/data
# from the service Settings → Volumes tab (the VOLUME directive is banned
# by Railway — volumes are managed externally).
RUN mkdir -p /app/data && chown -R lobbix:lobbix /app/data

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER lobbix

# Lightweight healthcheck — fails fast if the process is wedged
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/server.js"]
