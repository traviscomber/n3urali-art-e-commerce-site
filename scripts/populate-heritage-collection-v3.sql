-- Populate Heritage Collection with All Active Images
-- This script adds all active images to the Heritage collection

DO $$
DECLARE
  v_collection_id uuid;
  v_image_count integer := 0;
BEGIN
  -- Get the Heritage collection ID
  SELECT id INTO v_collection_id
  FROM collections
  WHERE code = 'HERITAGE';

  -- If collection doesn't exist, create it first
  IF v_collection_id IS NULL THEN
    INSERT INTO collections (
      id,
      title,
      code,
      description,
      bundle_price,
      is_active,
      is_auto_curated,
      start_date,
      end_date,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      'Heritage Collection',
      'HERITAGE',
      'Explore the world''s most iconic cultural and historical landmarks captured in stunning 360° immersive format. From ancient monuments to architectural masterpieces, each image preserves the grandeur of human heritage in ultra-high resolution, perfect for VR experiences, virtual tours, and educational projects.',
      899.00,
      true,
      false,
      NOW(),
      NOW() + INTERVAL '1 year',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_collection_id;
    
    RAISE NOTICE 'Created new Heritage collection with ID: %', v_collection_id;
  ELSE
    RAISE NOTICE 'Found existing Heritage collection with ID: %', v_collection_id;
  END IF;

  -- Clear existing collection images to avoid duplicates
  DELETE FROM collection_images WHERE collection_id = v_collection_id;
  RAISE NOTICE 'Cleared existing collection images';

  -- Insert all active images into the Heritage collection
  INSERT INTO collection_images (id, collection_id, image_id, position, created_at)
  SELECT 
    gen_random_uuid(),
    v_collection_id,
    i.id,
    ROW_NUMBER() OVER (ORDER BY i.created_at DESC),
    NOW()
  FROM images i
  WHERE i.active = true
  ORDER BY i.created_at DESC;

  -- Get the count of images added
  GET DIAGNOSTICS v_image_count = ROW_COUNT;

  -- Update the collection to ensure it's active
  UPDATE collections 
  SET 
    is_active = true,
    updated_at = NOW()
  WHERE id = v_collection_id;

  RAISE NOTICE 'Successfully added % images to Heritage collection', v_image_count;
  
  -- Show success message
  IF v_image_count > 0 THEN
    RAISE NOTICE '✓ Heritage collection is now ready with % images!', v_image_count;
  ELSE
    RAISE WARNING 'No active images found in database. Please upload and activate images first.';
  END IF;
END $$;

-- Verify the results
SELECT 
  c.title,
  c.code,
  c.bundle_price,
  c.is_active,
  c.start_date,
  c.end_date,
  COUNT(ci.id) as image_count
FROM collections c
LEFT JOIN collection_images ci ON c.id = ci.collection_id
WHERE c.code = 'HERITAGE'
GROUP BY c.id, c.title, c.code, c.bundle_price, c.is_active, c.start_date, c.end_date;

-- Show first 5 images in the collection
SELECT 
  ci.position,
  i.title,
  i.active,
  i.created_at
FROM collection_images ci
JOIN images i ON ci.image_id = i.id
JOIN collections c ON ci.collection_id = c.id
WHERE c.code = 'HERITAGE'
ORDER BY ci.position
LIMIT 5;
