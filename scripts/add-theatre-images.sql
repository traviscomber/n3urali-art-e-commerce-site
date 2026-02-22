-- Insert sample equirectangular images for Theatre mode testing
-- These are test images with Backblaze URLs

INSERT INTO images (
  id,
  title,
  description,
  image_format,
  content_category,
  original_url,
  upscaled_url,
  thumbnail_medium_url,
  thumbnail_large_url,
  thumbnail_small_url,
  active,
  created_at,
  updated_at,
  is_featured
) VALUES
  (
    gen_random_uuid(),
    'Immersive Worlds - Panoramic View',
    'Explore boundless digital realms in 360 degrees',
    'equirectangular',
    'theatre',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-4.mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-4.mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-4.mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-4.mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-4.mov',
    true,
    now(),
    now(),
    true
  ),
  (
    gen_random_uuid(),
    'Cultural Journeys - Indo Expedition',
    'Stories from around the world in immersive 360 panorama',
    'equirectangular',
    'theatre',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-Indo+(1).mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-Indo+(1).mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-Indo+(1).mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-Indo+(1).mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-Indo+(1).mov',
    true,
    now(),
    now(),
    false
  ),
  (
    gen_random_uuid(),
    'Digital Art - Contemporary Expression',
    'Contemporary artistic expressions in 360 immersive format',
    'equirectangular',
    'theatre',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop5.mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop5.mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop5.mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop5.mov',
    'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop5.mov',
    true,
    now(),
    now(),
    false
  );
