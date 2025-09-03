-- Add sample images to test the endless gallery functionality
INSERT INTO images (
  id,
  title,
  description,
  image_url,
  thumbnail_url,
  category_id,
  price,
  is_active,
  is_featured,
  created_at
) VALUES 
-- 360° Equirectangular samples
('sample-360-001', '360° Office Space', 'Modern office interior with natural lighting', '/placeholder.svg?height=400&width=800&text=360°+Office', '/placeholder.svg?height=200&width=400&text=360°+Office', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 29.99, true, true, NOW()),
('sample-360-002', '360° Living Room', 'Cozy living room with fireplace', '/placeholder.svg?height=400&width=800&text=360°+Living', '/placeholder.svg?height=200&width=400&text=360°+Living', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 24.99, true, false, NOW()),
('sample-360-003', '360° Kitchen', 'Modern kitchen with island', '/placeholder.svg?height=400&width=800&text=360°+Kitchen', '/placeholder.svg?height=200&width=400&text=360°+Kitchen', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 34.99, true, true, NOW()),
('sample-360-004', '360° Bedroom', 'Master bedroom with city view', '/placeholder.svg?height=400&width=800&text=360°+Bedroom', '/placeholder.svg?height=200&width=400&text=360°+Bedroom', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 27.99, true, false, NOW()),
('sample-360-005', '360° Bathroom', 'Luxury bathroom with marble', '/placeholder.svg?height=400&width=800&text=360°+Bathroom', '/placeholder.svg?height=200&width=400&text=360°+Bathroom', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 22.99, true, false, NOW()),
('sample-360-006', '360° Restaurant', 'Fine dining restaurant interior', '/placeholder.svg?height=400&width=800&text=360°+Restaurant', '/placeholder.svg?height=200&width=400&text=360°+Restaurant', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 39.99, true, true, NOW()),
('sample-360-007', '360° Hotel Lobby', 'Luxury hotel lobby', '/placeholder.svg?height=400&width=800&text=360°+Lobby', '/placeholder.svg?height=200&width=400&text=360°+Lobby', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 44.99, true, false, NOW()),
('sample-360-008', '360° Conference Room', 'Modern conference room', '/placeholder.svg?height=400&width=800&text=360°+Conference', '/placeholder.svg?height=200&width=400&text=360°+Conference', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 32.99, true, false, NOW()),
('sample-360-009', '360° Retail Store', 'Fashion retail store interior', '/placeholder.svg?height=400&width=800&text=360°+Retail', '/placeholder.svg?height=200&width=400&text=360°+Retail', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 36.99, true, true, NOW()),
('sample-360-010', '360° Gym', 'Modern fitness center', '/placeholder.svg?height=400&width=800&text=360°+Gym', '/placeholder.svg?height=200&width=400&text=360°+Gym', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 28.99, true, false, NOW()),

-- 180° Fisheye samples
('sample-fisheye-001', '180° Park View', 'Beautiful park with walking paths', '/placeholder.svg?height=400&width=400&text=180°+Park', '/placeholder.svg?height=200&width=200&text=180°+Park', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 19.99, true, true, NOW()),
('sample-fisheye-002', '180° Beach Scene', 'Tropical beach with palm trees', '/placeholder.svg?height=400&width=400&text=180°+Beach', '/placeholder.svg?height=200&width=200&text=180°+Beach', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 24.99, true, false, NOW()),
('sample-fisheye-003', '180° Mountain View', 'Scenic mountain landscape', '/placeholder.svg?height=400&width=400&text=180°+Mountain', '/placeholder.svg?height=200&width=200&text=180°+Mountain', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 22.99, true, true, NOW()),
('sample-fisheye-004', '180° City Street', 'Busy urban street scene', '/placeholder.svg?height=400&width=400&text=180°+Street', '/placeholder.svg?height=200&width=200&text=180°+Street', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 26.99, true, false, NOW()),
('sample-fisheye-005', '180° Garden', 'Botanical garden with flowers', '/placeholder.svg?height=400&width=400&text=180°+Garden', '/placeholder.svg?height=200&width=200&text=180°+Garden', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 18.99, true, false, NOW()),
('sample-fisheye-006', '180° Plaza', 'Town square with fountain', '/placeholder.svg?height=400&width=400&text=180°+Plaza', '/placeholder.svg?height=200&width=200&text=180°+Plaza', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 21.99, true, true, NOW()),
('sample-fisheye-007', '180° Forest', 'Dense forest with tall trees', '/placeholder.svg?height=400&width=400&text=180°+Forest', '/placeholder.svg?height=200&width=200&text=180°+Forest', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 23.99, true, false, NOW()),
('sample-fisheye-008', '180° Lake', 'Serene lake with reflections', '/placeholder.svg?height=400&width=400&text=180°+Lake', '/placeholder.svg?height=200&width=200&text=180°+Lake', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 20.99, true, false, NOW()),
('sample-fisheye-009', '180° Bridge', 'Historic bridge over river', '/placeholder.svg?height=400&width=400&text=180°+Bridge', '/placeholder.svg?height=200&width=200&text=180°+Bridge', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 25.99, true, true, NOW()),
('sample-fisheye-010', '180° Skyline', 'City skyline at sunset', '/placeholder.svg?height=400&width=400&text=180°+Skyline', '/placeholder.svg?height=200&width=200&text=180°+Skyline', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 29.99, true, false, NOW()),

-- Additional samples for testing endless scroll
('sample-360-011', '360° Art Gallery', 'Contemporary art gallery space', '/placeholder.svg?height=400&width=800&text=360°+Gallery', '/placeholder.svg?height=200&width=400&text=360°+Gallery', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 41.99, true, false, NOW()),
('sample-360-012', '360° Library', 'Modern library with reading areas', '/placeholder.svg?height=400&width=800&text=360°+Library', '/placeholder.svg?height=200&width=400&text=360°+Library', (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1), 33.99, true, true, NOW()),
('sample-fisheye-011', '180° Waterfall', 'Majestic waterfall in nature', '/placeholder.svg?height=400&width=400&text=180°+Waterfall', '/placeholder.svg?height=200&width=200&text=180°+Waterfall', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 27.99, true, false, NOW()),
('sample-fisheye-012', '180° Desert', 'Desert landscape with dunes', '/placeholder.svg?height=400&width=400&text=180°+Desert', '/placeholder.svg?height=200&width=200&text=180°+Desert', (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1), 24.99, true, true, NOW());
