-- Add VR/Stereographic categories for 360 and 180 degree images
INSERT INTO categories (id, name, description, created_at) VALUES 
(gen_random_uuid(), '360', '360-degree stereographic images for full immersive VR experience', NOW()),
(gen_random_uuid(), '180', '180-degree stereographic images for front-facing VR content', NOW())
ON CONFLICT (name) DO NOTHING;

-- Verify the categories were added
SELECT name, description FROM categories WHERE name IN ('360', '180');
