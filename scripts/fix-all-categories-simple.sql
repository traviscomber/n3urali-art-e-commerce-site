-- FRESH START - Add Ice & Snow Images Correctly
-- Step 1: Delete old Ice & Snow data
DELETE FROM images WHERE category_id IN (SELECT id FROM categories WHERE name = 'Ice & Snow');

-- Step 2: Create fresh Ice & Snow category
DELETE FROM categories WHERE name = 'Ice & Snow';

INSERT INTO categories (name, description, created_at)
VALUES ('Ice & Snow', 'Ultra high-resolution 360° panoramic imagery of ice formations, glaciers, aurora borealis, and snow landscapes', NOW());

-- Step 3: Insert 5 new Ice & Snow images with CORRECT blob URLs
INSERT INTO images (
  title, description, category_id, file_path, original_url,
  thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url,
  image_format, price, active, created_at, is_featured
)
SELECT
  title, description,
  (SELECT id FROM categories WHERE name = 'Ice & Snow'),
  url, url, url, url, url,
  'equirectangular', 99.00, true, NOW(), true
FROM (
  VALUES
    ('Aurora Borealis Ice Formations', 'Mystical arctic scene with fractal-like ice formations and aurora borealis effect. Blending crystalline structures in blues, whites, and creams with ethereal northern lights.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatIce5-Yn6rJGrSblQs3za4imgIHNPYgLRdja.png'),
    ('Glacial Valley Aurora', 'Aerial view of glacial formations showing flowing ice patterns in deep blues, whites, and browns. Capturing the dynamic nature of glacier movement.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatIce4-YQ5AGswx7X78xA2q6SKbOc1bjWPwkZ.png'),
    ('Abstract Mountain Ice Vortex', 'Surreal abstract landscape blending snow-capped mountains with organic flowing patterns in white, brown, and gold stripes.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatIce2-sgT1w3De3cWZgCdCENQVQjaOzgx60D.png'),
    ('Radiant Ice Cave', 'Dramatic ice cave environment with radiating golden sunlight creating starburst effects through layered blue and white ice formations.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatIce1-sO2U4GPIGK0jpJdu91kC505jMFSVkN.png'),
    ('Crystalline Ice Shards', 'Abstract crystalline ice formations and flowing patterns photographed panoramically with intricate details in ultra high-resolution.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatIce3-A7tbwRJugLMDAvy62xmDj3uU1DhVt0.png')
) AS new_images(title, description, url);

-- Step 4: Merge Underwater → Ocean
UPDATE images i
SET category_id = (SELECT id FROM categories WHERE name = 'Ocean' LIMIT 1)
WHERE category_id IN (SELECT id FROM categories WHERE name = 'Underwater');

-- Step 5: Delete Underwater category
DELETE FROM categories WHERE name = 'Underwater';

-- Step 6: Create Forest category (replace Underwater)
DELETE FROM categories WHERE name = 'Forest';
INSERT INTO categories (name, description, created_at)
VALUES ('Forest', 'Ultra high-resolution 360° panoramic imagery of forests, woodlands, and dense vegetation', NOW());

-- Step 7: FINAL CHECK - Show all categories with image counts
SELECT 
  c.name,
  COUNT(i.id) as total_images,
  COUNT(i.id) FILTER (WHERE i.active = true) as active_images,
  COUNT(i.id) FILTER (WHERE i.image_format = 'equirectangular') as equirectangular_format
FROM categories c
LEFT JOIN images i ON c.id = i.category_id
GROUP BY c.id, c.name
ORDER BY c.name;
