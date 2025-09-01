-- N3urali.art Database Initialization Script (Simplified)
-- This script initializes the database with core data needed for the e-commerce site
-- Avoids foreign key constraint issues by not creating user profiles

-- Clear existing data (in correct order to avoid foreign key violations)
DELETE FROM download_logs;
DELETE FROM downloads;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM images;
DELETE FROM licenses;
DELETE FROM categories;

-- Disable RLS for admin operations
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE images DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs DISABLE ROW LEVEL SECURITY;

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, active, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Nature & Landscapes', 'nature-landscapes', 'Stunning 360° views of natural environments and landscapes', '/placeholder.svg?height=300&width=400', true, 1, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Interior Spaces', 'interior-spaces', 'Professional 360° photography of interior spaces and architecture', '/placeholder.svg?height=300&width=400', true, 2, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Urban & Architecture', 'urban-architecture', 'City skylines, buildings, and urban environments in 360°', '/placeholder.svg?height=300&width=400', true, 3, NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Fisheye', 'fisheye', 'Creative fisheye lens photography with unique perspectives', '/placeholder.svg?height=300&width=400', true, 4, NOW());

-- Insert Licenses
INSERT INTO licenses (id, name, description, terms, price_multiplier, active, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Standard', 'Personal and small commercial use', 'Can be used for personal projects and small commercial applications with up to 500,000 impressions', 1.0, true, NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'Extended', 'Large commercial and unlimited use', 'Unlimited commercial use including resale, merchandise, and large-scale applications', 2.0, true, NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'Editorial', 'Editorial and news use only', 'For editorial, news, and educational purposes only. No commercial use permitted', 0.8, true, NOW());

-- Insert Sample Images
INSERT INTO images (id, title, description, category_id, price, file_url, preview_url, thumbnail_url, dimensions, file_size, tags, featured, active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Sunset Beach 360° Panorama', 'Stunning 360° panoramic view of a tropical beach at sunset with crystal clear waters and palm trees', '550e8400-e29b-41d4-a716-446655440001', 29.99, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=1024&width=2048', '/placeholder.svg?height=300&width=400', '4096x2048', 15728640, ARRAY['beach', 'sunset', 'tropical', 'panorama', '360'], true, true, NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440021', 'Modern Office Interior', 'Professional 360° view of a contemporary office space with modern furniture and natural lighting', '550e8400-e29b-41d4-a716-446655440002', 39.99, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=1024&width=2048', '/placeholder.svg?height=300&width=400', '4096x2048', 18874368, ARRAY['office', 'interior', 'modern', 'business', '360'], false, true, NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440022', 'City Skyline Fisheye', 'Creative fisheye view of a bustling city skyline with dramatic perspective and urban energy', '550e8400-e29b-41d4-a716-446655440004', 24.99, '/placeholder.svg?height=2048&width=2048', '/placeholder.svg?height=1024&width=1024', '/placeholder.svg?height=300&width=300', '2048x2048', 12582912, ARRAY['city', 'skyline', 'fisheye', 'urban', 'architecture'], true, true, NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440023', 'Forest Trail 360°', 'Immersive 360° view of a peaceful forest trail surrounded by tall trees and dappled sunlight', '550e8400-e29b-41d4-a716-446655440001', 34.99, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=1024&width=2048', '/placeholder.svg?height=300&width=400', '4096x2048', 16777216, ARRAY['forest', 'nature', 'trail', 'trees', '360'], false, true, NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440024', 'Luxury Hotel Lobby', 'Elegant 360° panorama of a luxury hotel lobby with marble floors and crystal chandeliers', '550e8400-e29b-41d4-a716-446655440002', 49.99, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=1024&width=2048', '/placeholder.svg?height=300&width=400', '4096x2048', 20971520, ARRAY['hotel', 'luxury', 'interior', 'lobby', '360'], true, true, NOW(), NOW());

-- Success message
SELECT 'Database initialized successfully with categories, licenses, and sample images!' as result;
