#!/bin/sh
set -e

echo "→ Running Prisma migrations..."
# Invoke the Prisma CLI directly: the runner image copies node_modules/prisma
# but not the node_modules/.bin/prisma symlink, so `npx prisma` / PATH lookup
# fails with "prisma: not found". Running its bin entry via node is symlink-free.
node node_modules/prisma/build/index.js migrate deploy

echo "→ Starting Next.js..."
exec node server.js
