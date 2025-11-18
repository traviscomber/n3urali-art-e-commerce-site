-- Complete Heritage Collection Setup Script
-- This will create or update the HERITAGE collection and populate it with images

-- Step 1: Ensure the collection exists with proper settings
INSERT INTO collections (
  code,
  title,
  description,
  start_date,
  end_date,
  bundle_price,
  is_auto_curated,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'HERITAGE',
  'Heritage Collection',
  'A curated collection of architectural and cultural landmarks captured in stunning 360° immersive format. From ancient monuments to architectural masterpieces, each image preserves the grandeur of human heritage in ultra-high resolution, perfect for VR experiences, virtual tours, and educational projects.',
  '2024-01-01',
  '2030-12-31',
  899,
  false,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (code) 
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = NOW();

-- Step 2: Get the collection ID
DO $$
DECLARE
  v_collection_id UUID;
  v_image_record RECORD;
  v_position INT := 1;
BEGIN
  -- Get collection ID
  SELECT id INTO v_collection_id
  FROM collections
  WHERE code = 'HERITAGE';

  -- Clear existing images from this collection (if any)
  DELETE FROM collection_images
  WHERE collection_id = v_collection_id;

  -- Add all active images to the collection
  FOR v_image_record IN (
    SELECT id
    FROM images
    WHERE active = true
    ORDER BY created_at ASC
  )
  LOOP
    INSERT INTO collection_images (
      collection_id,
      image_id,
      position,
      created_at
    )
    VALUES (
      v_collection_id,
      v_image_record.id,
      v_position,
      NOW()
    );
    
    v_position := v_position + 1;
  END LOOP;

  -- Display summary
  RAISE NOTICE 'Heritage Collection Setup Complete!';
  RAISE NOTICE 'Collection ID: %', v_collection_id;
  RAISE NOTICE 'Total Images Added: %', v_position - 1;
END $$;

-- Step 3: Verify the setup
SELECT 
  c.code,
  c.title,
  c.is_active,
  c.bundle_price,
  COUNT(ci.id) as total_images
FROM collections c
LEFT JOIN collection_images ci ON ci.collection_id = c.id
WHERE c.code = 'HERITAGE'
GROUP BY c.id, c.code, c.title, c.is_active, c.bundle_price;
