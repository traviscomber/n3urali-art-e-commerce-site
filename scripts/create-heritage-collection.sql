-- Create Heritage Collection and associate images
-- This script creates the Heritage collection with curated images

DO $$
DECLARE
  v_collection_id uuid;
  v_image_record RECORD;
  v_position integer := 0;
BEGIN
  -- Create Heritage collection if it doesn't exist
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
  ON CONFLICT (code) DO UPDATE
  SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    bundle_price = EXCLUDED.bundle_price,
    is_active = EXCLUDED.is_active,
    end_date = EXCLUDED.end_date,
    updated_at = NOW()
  RETURNING id INTO v_collection_id;

  -- If collection already existed, get its ID
  IF v_collection_id IS NULL THEN
    SELECT id INTO v_collection_id
    FROM collections
    WHERE code = 'HERITAGE';
  END IF;

  RAISE NOTICE 'Heritage collection ID: %', v_collection_id;

  -- Clear existing collection images to avoid duplicates
  DELETE FROM collection_images WHERE collection_id = v_collection_id;

  -- Fixed SELECT DISTINCT to include created_at in SELECT for ORDER BY
  -- Associate images that match heritage criteria with the collection
  FOR v_image_record IN
    SELECT DISTINCT i.id, i.created_at
    FROM images i
    WHERE i.active = true
    AND (
      i.title ILIKE '%heritage%'
      OR i.title ILIKE '%monument%'
      OR i.title ILIKE '%temple%'
      OR i.title ILIKE '%palace%'
      OR i.title ILIKE '%castle%'
      OR i.title ILIKE '%cathedral%'
      OR i.title ILIKE '%historical%'
      OR i.title ILIKE '%ancient%'
      OR i.title ILIKE '%architecture%'
      OR i.description ILIKE '%heritage%'
      OR i.description ILIKE '%historical%'
      OR i.description ILIKE '%cultural%'
      OR 'heritage' = ANY(i.tags)
      OR 'historical' = ANY(i.tags)
      OR 'monument' = ANY(i.tags)
      OR 'architecture' = ANY(i.tags)
    )
    ORDER BY i.created_at DESC
    LIMIT 50
  LOOP
    v_position := v_position + 1;
    
    INSERT INTO collection_images (
      id,
      collection_id,
      image_id,
      position,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      v_collection_id,
      v_image_record.id,
      v_position,
      NOW()
    );
  END LOOP;

  RAISE NOTICE 'Added % images to Heritage collection', v_position;

END $$;

-- Verify the collection was created
SELECT 
  c.title,
  c.code,
  c.bundle_price,
  c.is_active,
  COUNT(ci.id) as image_count
FROM collections c
LEFT JOIN collection_images ci ON c.id = ci.collection_id
WHERE c.code = 'HERITAGE'
GROUP BY c.id, c.title, c.code, c.bundle_price, c.is_active;
