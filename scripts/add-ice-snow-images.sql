-- Add Ice & Snow Category Images
-- These are the 5 stunning panoramic ice and snow environments to be restored

-- First, get the Ice & Snow category ID (or create if it doesn't exist)
INSERT INTO categories (name, description, created_at)
VALUES ('Ice & Snow', 'Ultra high-resolution 360° panoramic imagery of ice formations, glaciers, aurora borealis, and snow landscapes', NOW())
ON CONFLICT DO NOTHING;

-- Get the category ID for insertion
WITH ice_snow_category AS (
  SELECT id FROM categories WHERE name = 'Ice & Snow' LIMIT 1
)

-- Insert the 5 new ice and snow images
INSERT INTO images (
  id, title, description, category_id, file_path, original_url, 
  thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url,
  image_format, price, active, created_at, updated_at, is_featured
)
SELECT
  gen_random_uuid(),
  title,
  description,
  (SELECT id FROM ice_snow_category),
  file_path,
  original_url,
  original_url,
  original_url,
  original_url,
  'equirectangular',
  99.00,
  true,
  NOW(),
  NOW(),
  true
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
) AS new_images(title, description, original_url)
ON CONFLICT DO NOTHING;

-- Verify the images were inserted
SELECT COUNT(*) as ice_snow_images_count
FROM images i
JOIN categories c ON i.category_id = c.id
WHERE c.name = 'Ice & Snow' AND i.active = true;
