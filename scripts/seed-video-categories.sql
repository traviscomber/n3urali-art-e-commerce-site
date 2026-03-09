-- Seed 32 Video Categories mapped to 4 parent categories
-- This script adds all video subcategories to the existing categories table

-- NATURE Categories
INSERT INTO public.categories (name, description) VALUES 
  ('Ocean-Surreal', 'Surreal oceanic experiences and dreamlike water environments'),
  ('Ocean-Underwater-Life', 'Underwater life and marine ecosystems'),
  ('Insects', 'Close-up immersive experiences with insects and micro-nature'),
  ('Beads', 'Organic and natural bead patterns and textures');

-- CULTURE Categories  
INSERT INTO public.categories (name, description) VALUES
  ('Turkey', 'Turkish cultural heritage and architectural wonders'),
  ('Japan', 'Japanese cultural traditions and landscapes'),
  ('Halloween', 'Halloween-themed cultural celebrations and atmospheres'),
  ('Indonesia-Tribes', 'Indonesian tribal cultures and traditions'),
  ('Thailand', 'Thai cultural heritage and temple experiences'),
  ('Australia', 'Australian aboriginal cultures and landscapes'),
  ('Indonesian-Temples', 'Indonesian temple architecture and spiritual spaces'),
  ('Africa', 'African cultural heritage and landscapes'),
  ('Chile-Tribes', 'Chilean indigenous tribes and cultures'),
  ('Argentina-Rio', 'Argentine landscapes and Rio cultural experiences'),
  ('Korea', 'Korean cultural heritage and traditions'),
  ('Galleries', 'Gallery installations and art spaces'),
  ('Vietnam-Theatre', 'Vietnamese theatre traditions and performances'),
  ('India-Taj-Mahal', 'Indian architectural wonders and cultural landmarks');

-- MYTHIC Categories
INSERT INTO public.categories (name, description) VALUES
  ('Mythic-Indonesia', 'Indonesian mythology and legendary narratives'),
  ('Mythic-Chile', 'Chilean mythology and indigenous legends');

-- ART Categories
INSERT INTO public.categories (name, description) VALUES
  ('Bosch-Graspher', 'Hieronymus Bosch-inspired surreal art experiences'),
  ('Faces', 'Abstract facial forms and expressions'),
  ('Golden-Objects', 'Golden objects and treasures'),
  ('Shapes', 'Geometric shapes and form explorations'),
  ('Children', 'Art and experiences for and about children'),
  ('Architecture', 'Architectural forms and structures'),
  ('Silver-Techno', 'Silver and technological aesthetic experiences'),
  ('Bifi-Geometry', 'Bifurcated and complex geometric patterns'),
  ('Tunnels', 'Tunnel experiences and passage art'),
  ('Uncategorized', 'Content that doesnt fit standard categories');

-- Verify insertion
-- SELECT COUNT(*) as total_categories FROM public.categories;
-- SELECT name, description FROM public.categories ORDER BY created_at DESC LIMIT 32;
