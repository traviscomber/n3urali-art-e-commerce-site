#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('[v0] Clearing webpack build cache...');

// Remove .next directory if it exists
const nextDir = path.join(__dirname, '../.next');
if (fs.existsSync(nextDir)) {
  console.log('[v0] Removing .next build directory...');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

// Remove any stale cache from old directory path
const staleDir = '/vercel/share/v0-next-shadcn/.next';
if (fs.existsSync(staleDir)) {
  console.log('[v0] Removing stale cache from old path...');
  fs.rmSync(staleDir, { recursive: true, force: true });
}

// Remove node_modules/.cache if it exists
const cacheDir = path.join(__dirname, '../node_modules/.cache');
if (fs.existsSync(cacheDir)) {
  console.log('[v0] Clearing node_modules cache...');
  fs.rmSync(cacheDir, { recursive: true, force: true });
}

console.log('[v0] Build cache cleared successfully!');
console.log('[v0] Next build will use fresh webpack compilation from source code.');
