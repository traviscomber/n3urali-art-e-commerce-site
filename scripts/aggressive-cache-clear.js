#!/usr/bin/env node
import { rmSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const nextDir = join(projectRoot, '.next');

console.log(`[v0] Aggressively clearing .next build directory: ${nextDir}`);

try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log('[v0] Successfully removed .next directory');
  console.log('[v0] Build cache completely cleared');
  console.log('[v0] Restart the dev server to rebuild from scratch');
} catch (error) {
  console.error('[v0] Error clearing cache:', error.message);
  process.exit(1);
}
