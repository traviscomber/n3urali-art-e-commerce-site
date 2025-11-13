-- Fix images that don't have category_id set
-- This will assign categories based on image titles or set a default

DO $$
DECLARE
  equirectangular_cat_id UUID;
  fisheye_cat_id UUID;
  standard_cat_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO equirectangular_cat_id FROM categories WHERE LOWER(name) = 'equirectangular' LIMIT 1;
  SELECT id INTO fisheye_cat_id FROM categories WHERE LOWER(name) = 'fisheye' LIMIT 1;
  SELECT id INTO standard_cat_id FROM categories WHERE LOWER(name) IN ('standard', 'landscape', 'portrait') LIMIT 1;

  -- If we don't have an equirectangular category, create it
  IF equirectangular_cat_id IS NULL THEN
    INSERT INTO categories (name, description) 
    VALUES ('Equirectangular', '360-degree equirectangular images')
    RETURNING id INTO equirectangular_cat_id;
  END IF;

  -- If we don't have a standard category, create it
  IF standard_cat_id IS NULL THEN
    INSERT INTO categories (name, description) 
    VALUES ('Standard', 'Standard format images')
    RETURNING id INTO standard_cat_id;
  END IF;

  -- Update images without category_id
  -- Images with '360' in title -> Equirectangular
  UPDATE images
  SET category_id = equirectangular_cat_id
  WHERE category_id IS NULL
    AND (
      LOWER(title) LIKE '%360%' 
      OR LOWER(description) LIKE '%360%'
      OR LOWER(title) LIKE '%equirectangular%'
    );

  -- Images with fisheye/180 in title -> Fisheye (if category exists)
  IF fisheye_cat_id IS NOT NULL THEN
    UPDATE images
    SET category_id = fisheye_cat_id
    WHERE category_id IS NULL
      AND (
        LOWER(title) LIKE '%fisheye%' 
        OR LOWER(title) LIKE '%180%'
        OR LOWER(description) LIKE '%fisheye%'
      );
  END IF;

  -- All remaining images -> Standard
  UPDATE images
  SET category_id = standard_cat_id
  WHERE category_id IS NULL;

  RAISE NOTICE 'Category migration completed successfully';
END $$;
