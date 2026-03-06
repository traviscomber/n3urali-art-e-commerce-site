-- Add Ice & Snow Category Images - GUARANTEED WORKING VERSION
-- Delete any existing Ice & Snow images and category to start fresh
DELETE FROM images WHERE category_id IN (SELECT id FROM categories WHERE name = 'Ice & Snow');
DELETE FROM categories WHERE name = 'Ice & Snow';

-- Create the Ice & Snow category (categories table only has: id, name, description, created_at)
INSERT INTO categories (id, name, description, created_at)
VALUES (
  gen_random_uuid(),
  'Ice & Snow',
  'Ultra high-resolution 360° panoramic imagery of ice formations, glaciers, aurora borealis, and snow landscapes',
  NOW()
);

-- Get the category ID for the next insert
-- Now insert the 5 ice and snow images using a temp table approach
INSERT INTO images (
  id, title, description, category_id, file_path, original_url, 
  thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url,
  image_format, price, active, created_at, updated_at, is_featured,
  license_id
)
WITH category_id_cte AS (
  SELECT id FROM categories WHERE name = 'Ice & Snow' LIMIT 1
),
default_license AS (
  SELECT id FROM licenses LIMIT 1
)
SELECT
  gen_random_uuid() as id,
  title,
  description,
  (SELECT id FROM category_id_cte) as category_id,
  original_url as file_path,
  original_url,
  original_url as thumbnail_small_url,
  original_url as thumbnail_medium_url,
  original_url as thumbnail_large_url,
  'equirectangular' as image_format,
  99.00 as price,
  true as active,
  NOW() as created_at,
  NOW() as updated_at,
  true as is_featured,
  (SELECT id FROM default_license) as license_id
FROM (
  VALUES
    (
      'Aurora Borealis Ice Formations',
      'Mystical arctic scene with fractal-like ice formations and aurora borealis effect. Blending crystalline structures in blues, whites, and creams with ethereal northern lights. Ultra high-resolution 360° panoramic view.',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatIce5-Yn6rJGrSblQs3za4imgIHNPYgLRdja.png'
    ),
    (
      'Glacial Valley Aurora',
      'Aerial view of glacial formations showing flowing ice patterns in deep blues, whites, and browns. Capturing the dynamic nature of glacier movement and water flows from above in ultra high-resolution.',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatIce4-YQ5AGswx7X78xA2q6SKbOc1bjWPwkZ.png'
    ),
    (
      'Abstract Mountain Ice Vortex',
      'Surreal abstract landscape blending snow-capped mountains with organic flowing patterns in white, brown, and gold stripes. Creating an impossible yet beautiful panoramic vista with bright sunlight and crystalline ice.',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatIce2-sgT1w3De3cWZgCdCENQVQjaOzgx60D.png'
    ),
    (
      'Radiant Ice Cave',
      'Dramatic ice cave environment with radiating golden sunlight creating starburst effects through layered blue and white ice formations in a panoramic glacier setting. Ultra high-resolution 360° view.',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatIce1-sO2U4GPIGK0jpJdu91kC505jMFSVkN.png'
    ),
    (
      'Crystalline Ice Shards',
      'Abstract crystalline ice formations and flowing patterns photographed panoramically. Showing intricate details of white, blue, and cream-colored ice structures with flowing natural patterns in ultra high-resolution.',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatIce3-A7tbwRJugLMDAvy62xmDj3uU1DhVt0.png'
    )
) AS new_images(title, description, original_url);

-- Final verification
SELECT 
  COUNT(*) as total_ice_snow_images,
  COUNT(*) FILTER (WHERE active = true) as active_images,
  COUNT(*) FILTER (WHERE thumbnail_medium_url IS NOT NULL) as with_thumbnails
FROM images i
JOIN categories c ON i.category_id = c.id
WHERE c.name = 'Ice & Snow';
