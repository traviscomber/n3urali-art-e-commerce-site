#!/usr/bin/env node

/**
 * Create all 32 video category folders in Backblaze B2
 * Uses environment variables: BACKBLAZE_API_KEY, BACKBLAZE_APPLICATION_KEY, BACKBLAZE_BUCKET_NAME
 */

import fetch from 'node-fetch';

const B2_API_URL = 'https://api.backblazeb2.com';
const BACKBLAZE_BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME || 'Neuraliart';
const BACKBLAZE_API_KEY = process.env.BACKBLAZE_API_KEY;
const BACKBLAZE_APPLICATION_KEY = process.env.BACKBLAZE_APPLICATION_KEY;

// All 32 video categories organized by parent
const categories = {
  Nature: ['Ocean-Surreal', 'Ocean-Underwater-Life', 'Insects', 'Beads'],
  Culture: [
    'Turkey',
    'Japan',
    'Halloween',
    'Indonesia-Tribes',
    'Thailand',
    'Australia',
    'Indonesian-Temples',
    'Africa',
    'Chile-Tribes',
    'Argentina-Rio',
    'Korea',
    'Galleries',
    'Vietnam-Theatre',
    'India-Taj-Mahal',
  ],
  Mythic: ['Mythic-Indonesia', 'Mythic-Chile'],
  Art: [
    'Bosch-Graspher',
    'Faces',
    'Golden-Objects',
    'Shapes',
    'Children',
    'Architecture',
    'Silver-Techno',
    'Bifi-Geometry',
    'Tunnels',
    'Uncategorized',
  ],
};

async function authorizeB2() {
  console.log('[v0] Authorizing with Backblaze B2...');

  const credentials = Buffer.from(`${BACKBLAZE_API_KEY}:${BACKBLAZE_APPLICATION_KEY}`).toString('base64');

  const response = await fetch(`${B2_API_URL}/b2api/v2/b2_authorize_account`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    throw new Error(`B2 Authorization failed: ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  console.log('[v0] B2 Authorization successful');
  return data;
}

async function getBucketId(auth: any) {
  console.log(`[v0] Finding bucket: ${BACKBLAZE_BUCKET_NAME}`);

  const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_list_buckets`, {
    method: 'POST',
    headers: {
      Authorization: auth.authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accountId: auth.accountId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to list buckets: ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  const bucket = data.buckets.find((b: any) => b.bucketName === BACKBLAZE_BUCKET_NAME);

  if (!bucket) {
    throw new Error(`Bucket ${BACKBLAZE_BUCKET_NAME} not found`);
  }

  console.log(`[v0] Found bucket: ${bucket.bucketId}`);
  return bucket.bucketId;
}

async function getUploadUrl(auth: any, bucketId: string) {
  const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: 'POST',
    headers: {
      Authorization: auth.authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bucketId: bucketId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get upload URL: ${response.statusText}`);
  }

  return (await response.json()) as any;
}

async function createFolder(auth: any, bucketId: string, folderPath: string) {
  try {
    const uploadUrl = await getUploadUrl(auth, bucketId);

    // Create an empty file to represent the folder
    const folderMarkerPath = `${folderPath}/.folder`;
    const emptyBuffer = Buffer.from('');

    const response = await fetch(uploadUrl.uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: uploadUrl.authorizationToken,
        'X-Bz-File-Name': folderMarkerPath,
        'Content-Type': 'application/octet-stream',
        'X-Bz-Content-Sha1': 'da39a3ee5e6b4b0d3255bfef95601890afd80709', // SHA1 of empty string
      },
      body: emptyBuffer,
    });

    if (!response.ok) {
      console.warn(`[v0] ⚠ Could not create folder marker for ${folderPath}: ${response.statusText}`);
      return false;
    }

    console.log(`[v0] ✓ Created folder: VIDS/Categories/${folderPath}`);
    return true;
  } catch (error) {
    console.warn(`[v0] ⚠ Error creating folder ${folderPath}:`, error);
    return false;
  }
}

async function main() {
  console.log('\n========================================');
  console.log('Backblaze B2 - Create Video Categories');
  console.log('========================================\n');

  // Validate environment variables
  if (!BACKBLAZE_API_KEY || !BACKBLAZE_APPLICATION_KEY) {
    console.error('[v0] ERROR: Missing B2 credentials');
    console.error('[v0] Required environment variables:');
    console.error('[v0]   - BACKBLAZE_API_KEY');
    console.error('[v0]   - BACKBLAZE_APPLICATION_KEY');
    process.exit(1);
  }

  try {
    // Authorize with B2
    const auth = await authorizeB2();
    const bucketId = await getBucketId(auth);

    // Create all folders
    let successCount = 0;
    let totalFolders = 0;

    for (const [parent, subs] of Object.entries(categories)) {
      console.log(`\n[v0] Creating ${parent} category folders...`);

      for (const subcategory of subs) {
        totalFolders++;
        const folderPath = `${parent}/${subcategory}`;
        const created = await createFolder(auth, bucketId, folderPath);
        if (created) successCount++;

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log('\n========================================');
    console.log(`[v0] Complete: ${successCount}/${totalFolders} folders created`);
    console.log('========================================\n');

    if (successCount === totalFolders) {
      console.log('[v0] ✓ All 32 video category folders created successfully!');
      console.log('[v0] Folder structure: VIDS/Categories/[Parent]/[Subcategory]/');
      process.exit(0);
    } else {
      console.warn(`[v0] ⚠ Only ${successCount} of ${totalFolders} folders were created`);
      process.exit(1);
    }
  } catch (error) {
    console.error('[v0] ERROR:', error);
    process.exit(1);
  }
}

main();
