-- Insert sample equirectangular image for Theatre mode
-- This image is stored locally in public/images/

INSERT INTO images (
  id,
  title,
  description,
  image_format,
  content_category,
  file_path,
  original_url,
  upscaled_url,
  thumbnail_medium_url,
  thumbnail_large_url,
  thumbnail_small_url,
  active,
  created_at,
  updated_at,
  is_featured
) VALUES (
  gen_random_uuid(),
  'Escher Channel Maze - Panoramic View',
  'Surreal geometric landscape with columnar formations and flowing waterways. A 360° immersive experience through impossible architecture and natural wonder.',
  'equirectangular',
  'theatre',
  'PICS/Theatre/escher-channel-maze-2026.jpg',
  '/images/theatre-sample.jpg',
  '/images/theatre-sample.jpg',
  '/images/theatre-sample.jpg',
  '/images/theatre-sample.jpg',
  '/images/theatre-sample.jpg',
  true,
  now(),
  now(),
  true
);
