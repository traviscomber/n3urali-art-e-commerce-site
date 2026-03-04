-- Add Theatre tag category if not exists
INSERT INTO tag_categories (name, slug, description, active)
VALUES ('Immersive', 'immersive', 'Immersive 360° panoramic experiences', true)
ON CONFLICT DO NOTHING;

-- Add specific tags for theatre panoramas
INSERT INTO tags (name, slug, description, active, usage_count)
VALUES 
  ('360-Panorama', '360-panorama', 'Full 360° equirectangular panoramic image', true, 0),
  ('Surreal', 'surreal', 'Surrealistic artistic interpretation', true, 0),
  ('Landscape', 'landscape', 'Landscape scenery', true, 0),
  ('Monuments', 'monuments', 'Ancient or architectural monuments', true, 0),
  ('Escher', 'escher', 'Escher-inspired geometric art style', true, 0),
  ('Van Gogh', 'van-gogh', 'Van Gogh-inspired artistic style', true, 0),
  ('Immersive', 'immersive', 'Immersive viewer experience', true, 0),
  ('Relax', 'relax', 'Relaxing and meditative content', true, 0)
ON CONFLICT DO NOTHING;

-- Get the image IDs for tagging (based on title)
-- Tag Escher Channel Maze image
INSERT INTO image_tags (image_id, tag_id)
SELECT 
  i.id,
  t.id
FROM images i
CROSS JOIN tags t
WHERE i.title LIKE '%Escher%' 
  AND i.image_format = 'equirectangular'
  AND t.name IN ('360-Panorama', 'Surreal', 'Landscape', 'Escher', 'Immersive', 'Relax')
ON CONFLICT DO NOTHING;

-- Tag Ancient Monuments image
INSERT INTO image_tags (image_id, tag_id)
SELECT 
  i.id,
  t.id
FROM images i
CROSS JOIN tags t
WHERE i.title LIKE '%Ancient%'
  AND i.image_format = 'equirectangular'
  AND t.name IN ('360-Panorama', 'Surreal', 'Landscape', 'Monuments', 'Van Gogh', 'Immersive', 'Relax')
ON CONFLICT DO NOTHING;
