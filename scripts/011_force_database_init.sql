-- Force Database Initialization Script
-- This script will reset and initialize the database with working data

-- Disable RLS on all tables to allow admin operations
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Clear existing data
TRUNCATE TABLE public.download_logs CASCADE;
TRUNCATE TABLE public.downloads CASCADE;
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.images CASCADE;
TRUNCATE TABLE public.categories CASCADE;
TRUNCATE TABLE public.licenses CASCADE;
TRUNCATE TABLE public.user_profiles CASCADE;

-- Insert categories
INSERT INTO public.categories (id, name, slug, description, active, sort_order, image_url, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Nature & Landscapes', 'nature-landscapes', 'Stunning 360° views of natural environments', true, 1, '/placeholder.svg?height=200&width=300&text=Nature+Landscapes', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Interior Spaces', 'interior-spaces', 'Professional interior 360° photography', true, 2, '/placeholder.svg?height=200&width=300&text=Interior+Spaces', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Urban & Architecture', 'urban-architecture', 'City skylines and architectural marvels', true, 3, '/placeholder.svg?height=200&width=300&text=Urban+Architecture', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Fisheye', 'fisheye', 'Creative fisheye lens photography', true, 4, '/placeholder.svg?height=200&width=300&text=Fisheye+Photography', NOW());

-- Insert licenses
INSERT INTO public.licenses (id, name, description, terms, price_multiplier, active, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Standard', 'Personal and commercial use', 'Standard license terms for personal and commercial use', 1.0, true, NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Extended', 'Extended commercial rights', 'Extended license with additional commercial rights', 2.0, true, NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Premium', 'Full commercial and resale rights', 'Premium license with full commercial and resale rights', 3.0, true, NOW());

-- Insert sample images
INSERT INTO public.images (id, category_id, title, description, price, file_url, preview_url, thumbnail_url, dimensions, file_size, featured, active, tags, metadata, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Sunset Beach 360°', 'Stunning 360° panoramic view of a tropical beach at sunset with crystal clear waters and palm trees', 29.99, '/placeholder.svg?height=2048&width=4096&text=Sunset+Beach+360+Panorama', '/placeholder.svg?height=1024&width=2048&text=Sunset+Beach+Preview', '/placeholder.svg?height=300&width=400&text=Sunset+Beach+Thumb', '4096x2048', 15728640, true, true, ARRAY['sunset', 'beach', 'tropical', '360'], '{"camera": "Canon EOS R5", "lens": "Canon RF 15-35mm", "settings": "f/8, 1/125s, ISO 100"}', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Modern Office Interior', 'Professional 360° view of a contemporary office space with modern furniture and natural lighting', 39.99, '/placeholder.svg?height=2048&width=4096&text=Modern+Office+Interior+360', '/placeholder.svg?height=1024&width=2048&text=Modern+Office+Preview', '/placeholder.svg?height=300&width=400&text=Modern+Office+Thumb', '4096x2048', 18874368, false, true, ARRAY['office', 'interior', 'modern', 'business'], '{"camera": "Sony A7R IV", "lens": "Sony FE 16-35mm", "settings": "f/11, 1/60s, ISO 200"}', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'City Skyline Fisheye', 'Dynamic fisheye view of urban cityscape with towering skyscrapers and busy streets', 24.99, '/placeholder.svg?height=2048&width=2048&text=City+Skyline+Fisheye', '/placeholder.svg?height=1024&width=1024&text=City+Skyline+Preview', '/placeholder.svg?height=300&width=300&text=City+Skyline+Thumb', '2048x2048', 12582912, true, true, ARRAY['city', 'urban', 'fisheye', 'architecture'], '{"camera": "Nikon D850", "lens": "Nikkor 8-15mm Fisheye", "settings": "f/8, 1/250s, ISO 400"}', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Forest Trail 360°', 'Immersive 360° view of a serene forest trail with towering trees and dappled sunlight', 34.99, '/placeholder.svg?height=2048&width=4096&text=Forest+Trail+360+Panorama', '/placeholder.svg?height=1024&width=2048&text=Forest+Trail+Preview', '/placeholder.svg?height=300&width=400&text=Forest+Trail+Thumb', '4096x2048', 16777216, false, true, ARRAY['forest', 'nature', 'trail', 'trees'], '{"camera": "Canon EOS R6", "lens": "Canon RF 14-35mm", "settings": "f/8, 1/60s, ISO 800"}', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Luxury Hotel Lobby', 'Elegant 360° view of a five-star hotel lobby with marble floors and crystal chandeliers', 49.99, '/placeholder.svg?height=2048&width=4096&text=Luxury+Hotel+Lobby+360', '/placeholder.svg?height=1024&width=2048&text=Hotel+Lobby+Preview', '/placeholder.svg?height=300&width=400&text=Hotel+Lobby+Thumb', '4096x2048', 20971520, true, true, ARRAY['hotel', 'luxury', 'interior', 'elegant'], '{"camera": "Sony A7R V", "lens": "Sony FE 12-24mm", "settings": "f/8, 1/30s, ISO 1600"}', NOW(), NOW());

-- Create admin user profile
INSERT INTO public.user_profiles (id, email, full_name, is_admin, avatar_url, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440099', 'travis@nuanu.com', 'Travis Admin', true, '/placeholder.svg?height=100&width=100&text=TA', NOW(), NOW());

-- Create sample orders for testing
INSERT INTO public.orders (id, user_id, email, total_amount, currency, status, payment_status, billing_address, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440099', 'travis@nuanu.com', 89.97, 'USD', 'completed', 'paid', '{"name": "Travis Admin", "address": "123 Main St", "city": "San Francisco", "state": "CA", "zip": "94102", "country": "US"}', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440099', 'travis@nuanu.com', 149.95, 'USD', 'processing', 'pending', '{"name": "Travis Admin", "address": "123 Main St", "city": "San Francisco", "state": "CA", "zip": "94102", "country": "US"}', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- Create sample order items
INSERT INTO public.order_items (id, order_id, image_id, license_id, image_title, license_name, unit_price, quantity, total_price, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Sunset Beach 360°', 'Standard', 29.99, 1, 29.99, NOW() - INTERVAL '3 days'),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'Modern Office Interior', 'Extended', 39.99, 1, 59.98, NOW() - INTERVAL '3 days'),
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'Luxury Hotel Lobby', 'Premium', 49.99, 1, 149.97, NOW() - INTERVAL '1 day');

-- Create download records for completed orders
INSERT INTO public.downloads (id, order_item_id, download_token, download_url, max_downloads, download_count, expires_at, created_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'token_sunset_beach_001', '/api/download/token_sunset_beach_001', 5, 2, NOW() + INTERVAL '30 days', NOW() - INTERVAL '3 days'),
('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', 'token_office_interior_001', '/api/download/token_office_interior_001', 10, 0, NOW() + INTERVAL '30 days', NOW() - INTERVAL '3 days');

COMMIT;
