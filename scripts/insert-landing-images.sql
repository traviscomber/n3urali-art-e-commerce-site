-- N3uralia360 Landing Page Images Setup
-- Insert the 4 category images into the images table
-- Run this in Supabase SQL Editor

BEGIN;

-- Insert STUDIO image
INSERT INTO images (
  id,
  title,
  original_url,
  upscaled_url,
  thumbnail_large_url,
  content_category,
  active,
  created_at
)
VALUES (
  gen_random_uuid(),
  'Studio Collection',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Studio-F5dlmXiAmybWa59xZ5v3ZfVclowXES.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Studio-F5dlmXiAmybWa59xZ5v3ZfVclowXES.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Studio-F5dlmXiAmybWa59xZ5v3ZfVclowXES.png',
  'studio',
  true,
  NOW()
);

-- Insert REALITIES image
INSERT INTO images (
  id,
  title,
  original_url,
  upscaled_url,
  thumbnail_large_url,
  content_category,
  active,
  created_at
)
VALUES (
  gen_random_uuid(),
  'Realities Collection',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/R3alities%20-xYgwUsP7q8Z7tSTYKvDLGaMo9GbctW.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/R3alities%20-xYgwUsP7q8Z7tSTYKvDLGaMo9GbctW.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/R3alities%20-xYgwUsP7q8Z7tSTYKvDLGaMo9GbctW.png',
  'realities',
  true,
  NOW()
);

-- Insert ENVIRONMENTS image
INSERT INTO images (
  id,
  title,
  original_url,
  upscaled_url,
  thumbnail_large_url,
  content_category,
  active,
  created_at
)
VALUES (
  gen_random_uuid(),
  'Full Dome Environments',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Enve%CC%81s-w0foyLE584bjdidbZ7siakzp3ZJmoj.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Enve%CC%81s-w0foyLE584bjdidbZ7siakzp3ZJmoj.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Enve%CC%81s-w0foyLE584bjdidbZ7siakzp3ZJmoj.png',
  'environments',
  true,
  NOW()
);

-- Insert THEATRE image
INSERT INTO images (
  id,
  title,
  original_url,
  upscaled_url,
  thumbnail_large_url,
  content_category,
  active,
  created_at
)
VALUES (
  gen_random_uuid(),
  'Theatre Online',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatre-5R15ZYCfjpoGwinPlAne8bFdN0cpPr.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatre-5R15ZYCfjpoGwinPlAne8bFdN0cpPr.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatre-5R15ZYCfjpoGwinPlAne8bFdN0cpPr.png',
  'theatre',
  true,
  NOW()
);

COMMIT;

-- Verify insertion
SELECT 
  title,
  content_category,
  active,
  original_url
FROM images
WHERE content_category IN ('studio', 'realities', 'environments', 'theatre')
ORDER BY created_at DESC;
