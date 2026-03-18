#!/bin/bash

echo "[v0] Clearing webpack build cache..."

# Remove .next directory if it exists
if [ -d "/vercel/share/v0-project/.next" ]; then
  echo "[v0] Removing .next build directory..."
  rm -rf /vercel/share/v0-project/.next
fi

# Remove any stale cache from old directory path
if [ -d "/vercel/share/v0-next-shadcn/.next" ]; then
  echo "[v0] Removing stale cache from old path..."
  rm -rf /vercel/share/v0-next-shadcn/.next
fi

# Remove node_modules/.cache if it exists
if [ -d "/vercel/share/v0-project/node_modules/.cache" ]; then
  echo "[v0] Clearing node_modules cache..."
  rm -rf /vercel/share/v0-project/node_modules/.cache
fi

echo "[v0] Build cache cleared successfully!"
echo "[v0] Next build will use fresh webpack compilation from source code."
