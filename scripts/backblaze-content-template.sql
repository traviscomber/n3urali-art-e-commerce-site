-- Migration Script for Backblaze Organized Content
-- Use this template to insert images and videos organized in PICS/VIDS folders

-- Example: Insert Standard Images from PICS/Environments
INSERT INTO images (
  id,
  title,
  description,
  file_path,
  original_url,
  image_format,
  content_category,
  active,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    'Dome Environment 01',
    'Immersive dome environment',
    'PICS/Environments/dome-01.jpg',
    'https://f005.backblazeb2.com/file/Neuraliart/PICS/Environments/dome-01.jpg',
    'standard',
    'environments',
    true,
    now(),
    now()
  );

-- Example: Insert Theatre Videos from VIDS/Theatre
INSERT INTO images (
  id,
  title,
  description,
  file_path,
  original_url,
  image_format,
  content_category,
  active,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    'Theatre Experience - Immersive Worlds',
    'Explore boundless digital realms in 360 degrees',
    'VIDS/Theatre/immersive-worlds.mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDS/Theatre/immersive-worlds.mov',
    'equirectangular',
    'theatre',
    true,
    now(),
    now()
  );

-- Example: Insert Studio Images from PICS/Studio
INSERT INTO images (
  id,
  title,
  description,
  file_path,
  original_url,
  image_format,
  content_category,
  active,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    'Studio Workspace',
    'Professional studio setup',
    'PICS/Studio/workspace-01.jpg',
    'https://f005.backblazeb2.com/file/Neuraliart/PICS/Studio/workspace-01.jpg',
    'standard',
    'studio',
    true,
    now(),
    now()
  );

-- Template for Batch Inserts
-- Replace [CATEGORY], [FILENAME], [TITLE], [DESCRIPTION] as needed

-- For PICS folder:
-- INSERT INTO images (id, title, description, file_path, original_url, image_format, content_category, active, created_at, updated_at)
-- VALUES (gen_random_uuid(), '[TITLE]', '[DESCRIPTION]', 'PICS/[CATEGORY]/[FILENAME]', 'https://f005.backblazeb2.com/file/Neuraliart/PICS/[CATEGORY]/[FILENAME]', 'standard', '[CATEGORY]', true, now(), now());

-- For VIDS folder:
-- INSERT INTO images (id, title, description, file_path, original_url, image_format, content_category, active, created_at, updated_at)
-- VALUES (gen_random_uuid(), '[TITLE]', '[DESCRIPTION]', 'VIDS/[CATEGORY]/[FILENAME]', 'https://f005.backblazeb2.com/file/Neuraliart/VIDS/[CATEGORY]/[FILENAME]', 'equirectangular', '[CATEGORY]', true, now(), now());
