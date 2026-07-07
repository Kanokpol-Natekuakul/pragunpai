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

# Copy Prisma schema for runtime migrations
COPY --from=builder /app/prisma ./prisma
# Copy node_modules/.prisma for the generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

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

CMD ["node", "server.js"]
