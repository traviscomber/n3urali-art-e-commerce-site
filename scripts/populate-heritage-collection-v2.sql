-- Populate Heritage Collection with Images
-- This script associates existing images with the Heritage collection

DO $$
DECLARE
  v_collection_id uuid;
  v_image_count integer := 0;
BEGIN
  -- Get the Heritage collection ID
  SELECT id INTO v_collection_id
  FROM collections
  WHERE code = 'HERITAGE';

  -- If collection doesn't exist, raise an error
  IF v_collection_id IS NULL THEN
    RAISE EXCEPTION 'Heritage collection not found. Please run create-heritage-collection.sql first';
  END IF;

  -- Clear existing collection images (in case this script is run multiple times)
  DELETE FROM collection_images WHERE collection_id = v_collection_id;

  -- Insert all active images into the Heritage collection
  -- You can modify the WHERE clause to filter specific images
  INSERT INTO collection_images (id, collection_id, image_id, position, created_at)
  SELECT 
    gen_random_uuid(),
    v_collection_id,
    i.id,
    ROW_NUMBER() OVER (ORDER BY i.created_at DESC),
    NOW()
  FROM images i
  WHERE i.active = true
  ORDER BY i.created_at DESC
  LIMIT 50;

  -- Get the count of images added
  GET DIAGNOSTICS v_image_count = ROW_COUNT;

  -- Update the collection to mark it as active
  UPDATE collections 
  SET 
    is_active = true,
    updated_at = NOW()
  WHERE id = v_collection_id;

  RAISE NOTICE 'Successfully added % images to Heritage collection', v_image_count;
END $$;

-- Verify the results
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
