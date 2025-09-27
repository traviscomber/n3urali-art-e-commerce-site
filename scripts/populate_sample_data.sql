-- Populate sample data for n3urali.art e-commerce site
-- This script adds realistic example data for testing and demonstration

-- Updated to match actual database schema columns
-- Insert sample categories (only using existing columns: id, name, description, created_at)
INSERT INTO categories (id, name, description) VALUES
(gen_random_uuid(), '360', 'Full 360° spherical panoramic images perfect for VR and immersive experiences'),
(gen_random_uuid(), '180', 'Front-facing 180° images ideal for VR content and wide-angle photography'),
(gen_random_uuid(), 'Landscape', 'Stunning natural environments and scenic vistas'),
(gen_random_uuid(), 'Portrait', 'People and portrait photography in various styles'),
(gen_random_uuid(), 'Abstract', 'Creative and artistic abstract compositions')
ON CONFLICT (name) DO NOTHING;

-- Updated to match actual database schema columns
-- Insert sample licenses (only using existing columns: id, name, description, created_at)
INSERT INTO licenses (id, name, description) VALUES
(gen_random_uuid(), 'Standard License', 'Standard commercial license for business use including marketing materials, websites, and presentations'),
(gen_random_uuid(), 'Extended License', 'Extended commercial license allowing unlimited usage, merchandise, and product packaging rights'),
(gen_random_uuid(), 'Exclusive License', 'Exclusive usage rights with image removal from marketplace after purchase')
ON CONFLICT (name) DO NOTHING;

-- Fixed column names to match actual database schema
-- Insert sample images using correct column names: original_url, thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url
DO $$
DECLARE
    cat_360_id uuid;
    cat_180_id uuid;
    cat_landscape_id uuid;
    standard_license_id uuid;
    extended_license_id uuid;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_360_id FROM categories WHERE name = '360' LIMIT 1;
    SELECT id INTO cat_180_id FROM categories WHERE name = '180' LIMIT 1;
    SELECT id INTO cat_landscape_id FROM categories WHERE name = 'Landscape' LIMIT 1;
    
    -- Get license IDs
    SELECT id INTO standard_license_id FROM licenses WHERE name = 'Standard License' LIMIT 1;
    SELECT id INTO extended_license_id FROM licenses WHERE name = 'Extended License' LIMIT 1;

    -- Insert sample images (using actual columns from schema)
    INSERT INTO images (
        id, title, description, category_id, license_id, price, is_featured,
        file_path, original_url, thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url
    ) VALUES
    (
        gen_random_uuid(), 
        'Sunset Beach Paradise 360°', 
        'Breathtaking 360° sunset view from a tropical beach with crystal clear waters and palm trees', 
        cat_360_id, 
        standard_license_id, 
        49.99, 
        true,
        '/samples/sunset-beach-360.jpg',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=4096&h=2048&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=150&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop'
    ),
    (
        gen_random_uuid(), 
        'Mountain Peak Summit 360°', 
        'Epic 360° view from a mountain summit showing endless peaks and dramatic cloud formations', 
        cat_360_id, 
        extended_license_id, 
        79.99, 
        true,
        '/samples/mountain-summit-360.jpg',
        'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=4096&h=2048&fit=crop',
        'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=300&h=150&fit=crop',
        'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=600&h=300&fit=crop',
        'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=1200&h=600&fit=crop'
    ),
    (
        gen_random_uuid(), 
        'Forest Path 180°', 
        'Immersive 180° view of a serene forest path with filtered sunlight through the canopy', 
        cat_180_id, 
        standard_license_id, 
        34.99, 
        false,
        '/samples/forest-path-180.jpg',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2048&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=150&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=300&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=600&fit=crop'
    ),
    (
        gen_random_uuid(), 
        'Desert Landscape', 
        'Stunning desert landscape with rolling sand dunes and dramatic lighting', 
        cat_landscape_id, 
        standard_license_id, 
        24.99, 
        false,
        '/samples/desert-landscape.jpg',
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&h=150&fit=crop',
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&h=300&fit=crop',
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&h=600&fit=crop'
    ),
    (
        gen_random_uuid(), 
        'Ocean Waves 360°', 
        'Immersive 360° ocean view with rolling waves and endless blue horizon', 
        cat_360_id, 
        standard_license_id, 
        39.99, 
        false,
        '/samples/ocean-waves-360.jpg',
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=4096&h=2048&fit=crop',
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=150&fit=crop',
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=300&fit=crop',
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&h=600&fit=crop'
    );

END $$;

-- Display summary
SELECT 
    'Sample data populated successfully!' as message,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM images) as images_count,
    (SELECT COUNT(*) FROM licenses) as licenses_count;
