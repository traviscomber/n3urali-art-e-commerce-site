#!/usr/bin/env node
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('[v0] Nuking .next directory and node_modules cache...')

try {
  // Remove .next
  if (fs.existsSync('.next')) {
    console.log('[v0] Removing .next directory...')
    fs.rmSync('.next', { recursive: true, force: true })
    console.log('[v0] ✅ .next removed')
  }

  // Remove node_modules/.cache if it exists
  if (fs.existsSync('node_modules/.cache')) {
    console.log('[v0] Removing node_modules/.cache...')
    fs.rmSync('node_modules/.cache', { recursive: true, force: true })
    console.log('[v0] ✅ node_modules/.cache removed')
  }

  console.log('[v0] All caches cleared. Restart the dev server to rebuild from scratch.')
} catch (error) {
  console.error('[v0] Error clearing caches:', error.message)
  process.exit(1)
}
