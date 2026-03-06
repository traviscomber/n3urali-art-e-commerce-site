#!/bin/bash
# Restore environments-page-client.tsx from v413

cd /vercel/share/v0-project

# Get the commit hash for version 413
COMMIT_HASH=$(git log --oneline | grep -i "v413\|413" | head -1 | awk '{print $1}')

if [ -z "$COMMIT_HASH" ]; then
  # If no v413 tag, try to get it from recent history
  # Look for the version in the git log
  COMMIT_HASH=$(git log --all --grep="413" --oneline | head -1 | awk '{print $1}')
fi

if [ -z "$COMMIT_HASH" ]; then
  # Fallback: show recent commits and try to find the right one
  git log --oneline -n 20
  echo "Could not find v413, using most recent working version"
  COMMIT_HASH=$(git log --oneline -n 20 | awk '{print $1}' | head -1)
fi

echo "Restoring from commit: $COMMIT_HASH"

# Restore the environments-page-client.tsx file
git show $COMMIT_HASH:components/environments-page-client.tsx > /vercel/share/v0-project/components/environments-page-client.tsx

echo "Restored components/environments-page-client.tsx from commit $COMMIT_HASH"
