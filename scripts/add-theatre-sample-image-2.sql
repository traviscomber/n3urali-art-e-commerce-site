-- Add second equirectangular panorama to Theatre collection
INSERT INTO images (
  title,
  description,
  original_url,
  upscaled_url,
  thumbnail_medium_url,
  thumbnail_small_url,
  file_path,
  image_format,
  category,
  active,
  created_at,
  updated_at
) VALUES (
  'Ancient Monuments - Panoramic View',
  'Surreal panoramic landscape featuring colossal megalithic monuments with artistic interpretation. Van Gogh-inspired aurora lighting over verdant rolling hills and sky.',
  '/images/theatre-sample-2.jpg',
  '/images/theatre-sample-2.jpg',
  '/images/theatre-sample-2.jpg',
  '/images/theatre-sample-2.jpg',
  'PICS/Theatre/ancient-monuments-panorama.jpg',
  'equirectangular',
  'theatre',
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;
