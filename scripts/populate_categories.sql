-- Creating script to populate categories table with relevant image categories for n3urali.art
INSERT INTO categories (id, name, description, active, created_at, updated_at) VALUES
(gen_random_uuid(), '360° Images', 'Full 360-degree panoramic images for immersive viewing', true, NOW(), NOW()),
(gen_random_uuid(), 'Fisheye', 'Wide-angle fisheye lens photography with unique perspective', true, NOW(), NOW()),
(gen_random_uuid(), 'VR Ready', 'Virtual reality compatible panoramic content', true, NOW(), NOW()),
(gen_random_uuid(), 'Equirectangular', 'Standard equirectangular projection format', true, NOW(), NOW()),
(gen_random_uuid(), 'Nature & Landscapes', 'Natural environments and scenic landscapes', true, NOW(), NOW()),
(gen_random_uuid(), 'Architecture', 'Buildings, interiors, and architectural spaces', true, NOW(), NOW()),
(gen_random_uuid(), 'Urban Scenes', 'City streets, urban environments, and metropolitan areas', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Also populate licenses table with standard licensing options
INSERT INTO licenses (id, name, description, price, active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Standard License', 'Basic usage rights for personal and commercial projects', 29.99, true, NOW(), NOW()),
(gen_random_uuid(), 'Extended License', 'Enhanced usage rights with broader commercial applications', 79.99, true, NOW(), NOW()),
(gen_random_uuid(), 'Premium License', 'Full commercial rights with unlimited usage', 149.99, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
