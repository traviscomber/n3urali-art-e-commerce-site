-- Populate sample data for n3urali.art e-commerce site
-- This script adds realistic example data for testing and demonstration

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM download_logs;
-- DELETE FROM downloads;
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM images;
-- DELETE FROM licenses;
-- DELETE FROM categories;
-- DELETE FROM user_profiles WHERE email != 'travis@nuanu.com';

-- Insert sample categories
INSERT INTO categories (id, name, slug, description, image_url, active, sort_order) VALUES
(gen_random_uuid(), 'Equirectangular', 'equirectangular', 'Full 360° spherical panoramic images perfect for VR and immersive experiences', '/placeholder.svg?height=300&width=400', true, 1),
(gen_random_uuid(), 'Fisheye', 'fisheye', 'Ultra-wide angle fisheye images capturing unique perspectives and creative distortions', '/placeholder.svg?height=300&width=400', true, 2),
(gen_random_uuid(), 'Nature & Landscapes', 'nature-landscapes', 'Stunning natural environments captured in 360° and fisheye formats', '/placeholder.svg?height=300&width=400', true, 3),
(gen_random_uuid(), 'Urban & Architecture', 'urban-architecture', 'City scenes, buildings, and architectural marvels in immersive formats', '/placeholder.svg?height=300&width=400', true, 4),
(gen_random_uuid(), 'Interior Spaces', 'interior-spaces', 'Indoor environments perfect for virtual tours and real estate', '/placeholder.svg?height=300&width=400', true, 5);

-- Insert sample licenses
INSERT INTO licenses (id, name, description, terms, price_multiplier, active) VALUES
(gen_random_uuid(), 'Personal Use', 'For personal, non-commercial projects only', 'License grants the right to use the image for personal, non-commercial purposes only. No resale or redistribution allowed.', 1.00, true),
(gen_random_uuid(), 'Commercial Standard', 'Standard commercial license for business use', 'License grants commercial usage rights including marketing materials, websites, and presentations. Up to 500,000 print run or digital impressions.', 3.00, true),
(gen_random_uuid(), 'Extended Commercial', 'Extended commercial rights with broader usage', 'Extended commercial license allowing unlimited print runs, digital usage, and resale as part of end products. Includes merchandise and product packaging rights.', 8.00, true),
(gen_random_uuid(), 'Editorial Use', 'For editorial and journalistic purposes', 'License for editorial use in newspapers, magazines, blogs, and news websites. Not for commercial advertising or promotional use.', 2.00, true),
(gen_random_uuid(), 'Exclusive Rights', 'Exclusive usage rights with image removal from marketplace', 'Exclusive license granting sole usage rights. Image will be removed from marketplace after purchase. Includes all commercial and editorial rights.', 25.00, true);

-- Get category IDs for image insertion
DO $$
DECLARE
    equirectangular_id uuid;
    fisheye_id uuid;
    nature_id uuid;
    urban_id uuid;
    interior_id uuid;
BEGIN
    SELECT id INTO equirectangular_id FROM categories WHERE slug = 'equirectangular';
    SELECT id INTO fisheye_id FROM categories WHERE slug = 'fisheye';
    SELECT id INTO nature_id FROM categories WHERE slug = 'nature-landscapes';
    SELECT id INTO urban_id FROM categories WHERE slug = 'urban-architecture';
    SELECT id INTO interior_id FROM categories WHERE slug = 'interior-spaces';

    -- Insert sample images
    INSERT INTO images (id, title, description, category_id, file_url, preview_url, thumbnail_url, price, dimensions, file_size, tags, metadata, featured, active) VALUES
    
    -- Equirectangular Images
    (gen_random_uuid(), 'Sunset Beach Paradise 360°', 'Breathtaking 360° sunset view from a tropical beach with crystal clear waters and palm trees swaying in the breeze', equirectangular_id, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=512&width=1024', '/placeholder.svg?height=200&width=300', 49.99, '4096x2048', 15728640, ARRAY['sunset', 'beach', 'tropical', '360', 'panorama', 'ocean'], '{"camera": "Canon EOS R5", "lens": "Canon RF 15-35mm", "settings": "f/8, 1/125s, ISO 100", "location": "Maldives", "weather": "Clear", "time": "Golden Hour"}', true, true),
    
    (gen_random_uuid(), 'Mountain Peak Summit 360°', 'Epic 360° view from a mountain summit showing endless peaks, valleys, and dramatic cloud formations', equirectangular_id, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=512&width=1024', '/placeholder.svg?height=200&width=300', 59.99, '4096x2048', 18874368, ARRAY['mountain', 'summit', 'clouds', '360', 'landscape', 'peaks'], '{"camera": "Sony A7R IV", "lens": "Sony FE 16-35mm", "settings": "f/11, 1/60s, ISO 200", "location": "Swiss Alps", "elevation": "3200m", "weather": "Partly Cloudy"}', true, true),
    
    (gen_random_uuid(), 'Ancient Forest Cathedral 360°', 'Immersive 360° view inside an ancient redwood forest with towering trees and filtered sunlight', equirectangular_id, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=512&width=1024', '/placeholder.svg?height=200&width=300', 44.99, '4096x2048', 14680064, ARRAY['forest', 'redwood', 'trees', '360', 'nature', 'cathedral'], '{"camera": "Nikon Z7 II", "lens": "Nikkor Z 14-30mm", "settings": "f/8, 1/30s, ISO 400", "location": "California Redwoods", "time": "Morning", "weather": "Foggy"}', false, true),
    
    -- Fisheye Images
    (gen_random_uuid(), 'Urban Skyscraper Fisheye', 'Dramatic fisheye perspective looking up at towering skyscrapers creating geometric patterns against the sky', fisheye_id, '/placeholder.svg?height=2048&width=2048', '/placeholder.svg?height=512&width=512', '/placeholder.svg?height=200&width=200', 39.99, '2048x2048', 8388608, ARRAY['fisheye', 'skyscraper', 'urban', 'architecture', 'geometric'], '{"camera": "Canon EOS 5D Mark IV", "lens": "Canon EF 8-15mm Fisheye", "settings": "f/8, 1/250s, ISO 100", "location": "New York City", "time": "Midday", "weather": "Clear"}', true, true),
    
    (gen_random_uuid(), 'Spiral Staircase Fisheye', 'Mesmerizing fisheye view of an ornate spiral staircase creating perfect circular symmetry', fisheye_id, '/placeholder.svg?height=2048&width=2048', '/placeholder.svg?height=512&width=512', '/placeholder.svg?height=200&width=200', 34.99, '2048x2048', 7340032, ARRAY['fisheye', 'staircase', 'spiral', 'architecture', 'symmetry'], '{"camera": "Sony A7 III", "lens": "Sony FE 8-15mm Fisheye", "settings": "f/5.6, 1/60s, ISO 800", "location": "Historic Library", "style": "Art Nouveau", "lighting": "Natural"}', false, true),
    
    -- Nature & Landscapes
    (gen_random_uuid(), 'Aurora Borealis 360° Spectacle', 'Magnificent 360° capture of the Northern Lights dancing across the Arctic sky with snow-covered landscape', nature_id, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=512&width=1024', '/placeholder.svg?height=200&width=300', 79.99, '4096x2048', 22020096, ARRAY['aurora', 'northern lights', '360', 'arctic', 'night', 'landscape'], '{"camera": "Nikon D850", "lens": "Nikkor 14-24mm", "settings": "f/2.8, 15s, ISO 3200", "location": "Iceland", "temperature": "-15°C", "time": "11:30 PM"}', true, true),
    
    (gen_random_uuid(), 'Desert Dunes Sunrise 360°', 'Spectacular 360° sunrise over endless sand dunes with dramatic shadows and golden light', nature_id, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=512&width=1024', '/placeholder.svg?height=200&width=300', 54.99, '4096x2048', 16777216, ARRAY['desert', 'dunes', 'sunrise', '360', 'sand', 'golden hour'], '{"camera": "Canon EOS R6", "lens": "Canon RF 15-35mm", "settings": "f/11, 1/125s, ISO 100", "location": "Sahara Desert", "time": "6:15 AM", "weather": "Clear"}', false, true),
    
    -- Urban & Architecture
    (gen_random_uuid(), 'Gothic Cathedral Interior 360°', 'Awe-inspiring 360° view inside a Gothic cathedral with soaring arches, stained glass, and intricate stonework', urban_id, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=512&width=1024', '/placeholder.svg?height=200&width=300', 64.99, '4096x2048', 19922944, ARRAY['cathedral', 'gothic', 'architecture', '360', 'interior', 'stained glass'], '{"camera": "Sony A7R V", "lens": "Sony FE 12-24mm", "settings": "f/8, 1/15s, ISO 1600", "location": "Notre-Dame de Paris", "style": "Gothic", "era": "12th Century"}', true, true),
    
    (gen_random_uuid(), 'Modern City Intersection Fisheye', 'Dynamic fisheye view of a busy modern city intersection with traffic, pedestrians, and urban energy', urban_id, '/placeholder.svg?height=2048&width=2048', '/placeholder.svg?height=512&width=512', '/placeholder.svg?height=200&width=200', 42.99, '2048x2048', 9437184, ARRAY['fisheye', 'city', 'intersection', 'traffic', 'urban', 'street'], '{"camera": "Fujifilm X-T4", "lens": "Fujinon XF 8-16mm", "settings": "f/8, 1/125s, ISO 200", "location": "Tokyo", "time": "Rush Hour", "weather": "Overcast"}', false, true),
    
    -- Interior Spaces
    (gen_random_uuid(), 'Luxury Hotel Lobby 360°', 'Elegant 360° view of a luxury hotel lobby with marble floors, crystal chandeliers, and sophisticated décor', interior_id, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=512&width=1024', '/placeholder.svg?height=200&width=300', 69.99, '4096x2048', 20971520, ARRAY['interior', 'hotel', 'luxury', '360', 'lobby', 'marble'], '{"camera": "Canon EOS R5", "lens": "Canon RF 15-35mm", "settings": "f/8, 1/60s, ISO 400", "location": "Grand Hotel", "style": "Contemporary Luxury", "lighting": "Mixed"}', true, true),
    
    (gen_random_uuid(), 'Cozy Coffee Shop 360°', 'Warm and inviting 360° view of a cozy coffee shop with exposed brick, wooden furniture, and ambient lighting', interior_id, '/placeholder.svg?height=2048&width=4096', '/placeholder.svg?height=512&width=1024', '/placeholder.svg?height=200&width=300', 29.99, '4096x2048', 12582912, ARRAY['interior', 'coffee shop', 'cozy', '360', 'brick', 'wooden'], '{"camera": "Sony A7 IV", "lens": "Sony FE 16-35mm", "settings": "f/5.6, 1/30s, ISO 800", "location": "Local Café", "style": "Industrial Rustic", "lighting": "Warm LED"}', false, true);

END $$;

-- Insert sample user profiles (in addition to admin)
INSERT INTO user_profiles (id, email, full_name, is_admin, avatar_url) VALUES
(gen_random_uuid(), 'photographer@example.com', 'Alex Chen', false, '/placeholder.svg?height=100&width=100'),
(gen_random_uuid(), 'designer@example.com', 'Sarah Johnson', false, '/placeholder.svg?height=100&width=100'),
(gen_random_uuid(), 'developer@local.dev', 'Developer', true, '/placeholder.svg?height=100&width=100');

-- Insert sample orders (optional - for demonstration)
DO $$
DECLARE
    sample_user_id uuid;
    sample_order_id uuid;
    sample_image_id uuid;
    sample_license_id uuid;
BEGIN
    -- Get a sample user
    SELECT id INTO sample_user_id FROM user_profiles WHERE email = 'photographer@example.com' LIMIT 1;
    
    -- Create a sample order
    INSERT INTO orders (id, user_id, email, status, payment_status, total_amount, currency, billing_address)
    VALUES (gen_random_uuid(), sample_user_id, 'photographer@example.com', 'completed', 'paid', 149.97, 'USD', 
            '{"street": "123 Main St", "city": "San Francisco", "state": "CA", "zip": "94102", "country": "USA"}')
    RETURNING id INTO sample_order_id;
    
    -- Get sample image and license
    SELECT id INTO sample_image_id FROM images WHERE title LIKE '%Sunset Beach%' LIMIT 1;
    SELECT id INTO sample_license_id FROM licenses WHERE name = 'Commercial Standard' LIMIT 1;
    
    -- Create sample order items
    INSERT INTO order_items (id, order_id, image_id, license_id, quantity, unit_price, total_price, image_title, license_name)
    VALUES (gen_random_uuid(), sample_order_id, sample_image_id, sample_license_id, 1, 149.97, 149.97, 'Sunset Beach Paradise 360°', 'Commercial Standard');
    
END $$;

-- Update statistics
ANALYZE categories;
ANALYZE images;
ANALYZE licenses;
ANALYZE user_profiles;
ANALYZE orders;
ANALYZE order_items;

-- Display summary
SELECT 
    'Sample data populated successfully!' as message,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM images) as images_count,
    (SELECT COUNT(*) FROM licenses) as licenses_count,
    (SELECT COUNT(*) FROM user_profiles) as users_count,
    (SELECT COUNT(*) FROM orders) as orders_count;
