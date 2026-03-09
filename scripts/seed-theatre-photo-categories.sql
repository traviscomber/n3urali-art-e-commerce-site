-- Seed 32 Theatre Photo Categories (Equirectangular Images)
-- Maps to the same 4 parent categories as video categories
-- Using the same structure and naming conventions

-- NATURE Categories for Theatre Photos
INSERT INTO public.categories (name, description) VALUES 
  ('Theatre-Ocean-Surreal', 'Surreal oceanic equirectangular experiences'),
  ('Theatre-Ocean-Underwater-Life', 'Underwater panoramic environments'),
  ('Theatre-Insects', 'Macro equirectangular insect experiences'),
  ('Theatre-Beads', 'Organic pattern panoramic imagery')
ON CONFLICT (name) DO NOTHING;

-- CULTURE Categories for Theatre Photos
INSERT INTO public.categories (name, description) VALUES
  ('Theatre-Turkey', 'Turkish cultural equirectangular panoramas'),
  ('Theatre-Japan', 'Japanese panoramic environments'),
  ('Theatre-Halloween', 'Halloween panoramic atmospheres'),
  ('Theatre-Indonesia-Tribes', 'Indonesian tribal panoramic views'),
  ('Theatre-Thailand', 'Thai cultural equirectangular panoramas'),
  ('Theatre-Australia', 'Australian panoramic landscapes'),
  ('Theatre-Indonesian-Temples', 'Indonesian temple panoramic views'),
  ('Theatre-Africa', 'African panoramic heritage'),
  ('Theatre-Chile-Tribes', 'Chilean tribal panoramic environments'),
  ('Theatre-Argentina-Rio', 'Argentine panoramic journeys'),
  ('Theatre-Korea', 'Korean cultural equirectangular panoramas'),
  ('Theatre-Galleries', 'Gallery equirectangular experiences'),
  ('Theatre-Vietnam-Theatre', 'Vietnamese theatre panoramic views'),
  ('Theatre-India-Taj-Mahal', 'Indian architectural panoramic experiences')
ON CONFLICT (name) DO NOTHING;

-- MYTHIC Categories for Theatre Photos
INSERT INTO public.categories (name, description) VALUES
  ('Theatre-Mythic-Indonesia', 'Indonesian mythology equirectangular experiences'),
  ('Theatre-Mythic-Chile', 'Chilean mythology panoramic views')
ON CONFLICT (name) DO NOTHING;

-- ART Categories for Theatre Photos
INSERT INTO public.categories (name, description) VALUES
  ('Theatre-Bosch-Graspher', 'Surreal art equirectangular experiences'),
  ('Theatre-Faces', 'Facial expression panoramic art'),
  ('Theatre-Golden-Objects', 'Golden object panoramic environments'),
  ('Theatre-Shapes', 'Geometric panoramic art'),
  ('Theatre-Children', 'Children-focused equirectangular art'),
  ('Theatre-Architecture', 'Architectural panoramic views'),
  ('Theatre-Silver-Techno', 'Technological aesthetic panoramas'),
  ('Theatre-Bifi-Geometry', 'Complex geometric equirectangular patterns'),
  ('Theatre-Tunnels', 'Tunnel equirectangular experiences'),
  ('Theatre-Uncategorized', 'Uncategorized theatre panoramas')
ON CONFLICT (name) DO NOTHING;
