-- Clear existing data first
DELETE FROM downloads;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM images;
DELETE FROM categories;
DELETE FROM licenses;

-- Insert categories
INSERT INTO categories (id, name, description, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Equirectangular', 'Full 360° panoramic images', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Fisheye', 'Circular fisheye projections', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Stereographic', 'Stereographic projections', NOW());

-- Insert licenses
INSERT INTO licenses (id, name, description, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Standard License', 'Standard commercial use license', NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Extended License', 'Extended commercial use with unlimited prints', NOW());

-- Insert images with working Unsplash URLs
INSERT INTO images (
    id, 
    title, 
    description, 
    category_id, 
    license_id, 
    price, 
    is_featured, 
    original_url,
    thumbnail_small_url,
    thumbnail_medium_url, 
    thumbnail_large_url,
    file_path,
    created_at, 
    updated_at
) VALUES
-- Equirectangular images
('770e8400-e29b-41d4-a716-446655440001', 'Ocean Sunset 360°', 'Beautiful ocean sunset panorama', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 29.99, true, 
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop', 
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
 'ocean-sunset-360.jpg', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440002', 'Mountain Peak 360°', 'Stunning mountain peak panorama', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 34.99, true,
 'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=300&h=200&fit=crop',
 'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=600&h=400&fit=crop',
 'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=1200&h=800&fit=crop',
 'mountain-peak-360.jpg', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440003', 'Forest Trail 360°', 'Immersive forest trail experience', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 24.99, false,
 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
 'forest-trail-360.jpg', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440004', 'Beach Paradise 360°', 'Tropical beach panorama', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 39.99, true,
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop',
 'beach-paradise-360.jpg', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440005', 'City Skyline 360°', 'Urban cityscape panorama', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 44.99, false,
 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop',
 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop',
 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop',
 'city-skyline-360.jpg', NOW(), NOW()),

-- Fisheye images
('770e8400-e29b-41d4-a716-446655440006', 'Architectural Fisheye', 'Modern building fisheye view', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 19.99, false,
 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop',
 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=300&fit=crop',
 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=600&fit=crop',
 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop',
 'architectural-fisheye.jpg', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440007', 'Nature Fisheye', 'Tree canopy fisheye perspective', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 22.99, true,
 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop',
 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop',
 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop',
 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop',
 'nature-fisheye.jpg', NOW(), NOW()),

-- Stereographic images  
('770e8400-e29b-41d4-a716-446655440008', 'Planet Earth View', 'Stereographic planet projection', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 49.99, true,
 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=800&fit=crop',
 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=300&fit=crop',
 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=600&h=600&fit=crop',
 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=800&fit=crop',
 'planet-earth-view.jpg', NOW(), NOW());
