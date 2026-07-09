# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

# ============================================================
# Stage 2: Build the application
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Next.js "Collecting page data" imports src/lib/prisma.ts, which throws if
# DATABASE_URL is unset. The build never connects — the real URL is injected
# at runtime by docker-compose. This throwaway value only satisfies the check.
# (Not an ENV in the runner stage, so it never reaches the running container.)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?sslmode=disable"

# Build Next.js in standalone mode
RUN npm run build

# ============================================================
# Stage 3: Production runner
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Install sharp for Next.js Image Optimization in self-hosted mode
RUN npm install --os=linux --cpu=x64 sharp@latest && \
    rm -rf /root/.npm

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone server output
COPY --from=builder /app/.next/standalone ./
# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
# Copy public folder (favicon, images, etc.)
COPY --from=builder /app/public ./public

# Prisma schema + config for runtime `prisma migrate deploy` (see docker-entrypoint.sh).
# The generated client (generator "prisma-client") outputs to src/generated/prisma and
# is bundled into .next; @prisma (the pg driver adapter) is copied for the app runtime.
# There is no node_modules/.prisma to copy (driver adapter, no native query engine).
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Install the Prisma CLI plus its full dependency tree (effect, c12, @prisma/engines, …)
# for runtime migrations. Copying node_modules/prisma alone failed at runtime because
# these transitive deps live at the node_modules root and are absent from the slim
# standalone output. dotenv is imported by prisma.config.ts.
RUN npm install prisma@7.8.0 dotenv@^17 && rm -rf /root/.npm

# Copy entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create uploads directory as a volume mount point
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

# Set correct permissions for prerender cache
RUN mkdir -p /app/.next && chown -R nextjs:nodejs /app/.next

USER nextjs

EXPOSE 3000

# Healthcheck: verify the app responds on /
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Enable graceful shutdown (Next.js listens for SIGTERM)
STOPSIGNAL SIGTERM

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
