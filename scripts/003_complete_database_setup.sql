-- Complete Database Setup Script for N3urali.art E-commerce Platform
-- This script ensures all tables, policies, data, and configurations are ready for production

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- RLS POLICIES SETUP
-- ============================================================================

-- Categories: Public read, admin write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Categories are manageable by admins" ON categories;
CREATE POLICY "Categories are manageable by admins" ON categories
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Licenses: Public read, admin write
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Licenses are viewable by everyone" ON licenses;
CREATE POLICY "Licenses are viewable by everyone" ON licenses
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Licenses are manageable by admins" ON licenses;
CREATE POLICY "Licenses are manageable by admins" ON licenses
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Images: Public read active images, admin manage all
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active images are viewable by everyone" ON images;
CREATE POLICY "Active images are viewable by everyone" ON images
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Images are manageable by admins" ON images;
CREATE POLICY "Images are manageable by admins" ON images
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- User Profiles: Users can read/update own profile, admins can manage all
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Orders: Users can view own orders, admins can manage all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id OR email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Orders are manageable by admins" ON orders;
CREATE POLICY "Orders are manageable by admins" ON orders
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Order Items: Users can view items from own orders, admins can manage all
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.email = auth.jwt() ->> 'email')
        )
    );

DROP POLICY IF EXISTS "Order items are manageable by admins" ON order_items;
CREATE POLICY "Order items are manageable by admins" ON order_items
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Downloads: Users can view own downloads, admins can manage all
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own downloads" ON downloads;
CREATE POLICY "Users can view own downloads" ON downloads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.id = downloads.order_item_id 
            AND (o.user_id = auth.uid() OR o.email = auth.jwt() ->> 'email')
        )
    );

DROP POLICY IF EXISTS "Downloads are manageable by admins" ON downloads;
CREATE POLICY "Downloads are manageable by admins" ON downloads
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Download Logs: Admin only
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Download logs are manageable by admins" ON download_logs;
CREATE POLICY "Download logs are manageable by admins" ON download_logs
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Images
CREATE INDEX IF NOT EXISTS idx_images_active ON images(active);
CREATE INDEX IF NOT EXISTS idx_images_featured ON images(featured);
CREATE INDEX IF NOT EXISTS idx_images_category_id ON images(category_id);
CREATE INDEX IF NOT EXISTS idx_images_price ON images(price);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_image_id ON order_items(image_id);

-- Downloads
CREATE INDEX IF NOT EXISTS idx_downloads_order_item_id ON downloads(order_item_id);
CREATE INDEX IF NOT EXISTS idx_downloads_download_token ON downloads(download_token);

-- ============================================================================
-- ESSENTIAL DATA POPULATION
-- ============================================================================

-- Insert Categories (if not exists)
INSERT INTO categories (id, name, slug, description, image_url, active, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '360° Images', '360-images', 'Full 360-degree panoramic images for immersive experiences', '/placeholder.svg?height=200&width=300', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Fisheye Photos', 'fisheye-photos', 'Ultra-wide fisheye lens photography with unique perspectives', '/placeholder.svg?height=200&width=300', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'VR Content', 'vr-content', 'Virtual reality ready content and environments', '/placeholder.svg?height=200&width=300', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert Licenses (if not exists)
INSERT INTO licenses (id, name, description, price, features, active, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', 'Standard License', 'Perfect for personal projects and small businesses', 29.99, 
     '{"usage": "Personal and commercial use", "prints": "Up to 500,000 copies", "digital": "Unlimited digital use", "exclusive": false, "resale": false}', 
     true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440011', 'Extended License', 'Ideal for larger commercial projects and marketing campaigns', 99.99, 
     '{"usage": "Extended commercial use", "prints": "Unlimited copies", "digital": "Unlimited digital use", "exclusive": false, "resale": true, "merchandise": true}', 
     true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440012', 'Commercial License', 'Full commercial rights for enterprise and broadcast use', 299.99, 
     '{"usage": "Full commercial rights", "prints": "Unlimited copies", "digital": "Unlimited digital use", "exclusive": true, "resale": true, "merchandise": true, "broadcast": true}', 
     true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Images (if not exists)
INSERT INTO images (id, title, description, category_id, price, file_url, preview_url, thumbnail_url, file_size, dimensions, tags, metadata, featured, active, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440020', 'Urban Skyline 360°', 'Stunning 360-degree view of a modern city skyline at golden hour', '550e8400-e29b-41d4-a716-446655440001', 49.99, 
     '/placeholder.svg?height=2048&width=4096', 
     '/placeholder.svg?height=720&width=1440', 
     '/placeholder.svg?height=300&width=400', 
     15728640, '4096x2048', ARRAY['urban', 'skyline', '360', 'panorama', 'city'], 
     '{"camera": "Insta360 Pro 2", "location": "Downtown", "time": "Golden Hour", "weather": "Clear"}', 
     true, true, NOW(), NOW()),
    
    ('550e8400-e29b-41d4-a716-446655440021', 'Forest Path Fisheye', 'Immersive fisheye view of a serene forest trail surrounded by tall trees', '550e8400-e29b-41d4-a716-446655440002', 34.99, 
     '/placeholder.svg?height=2048&width=2048', 
     '/placeholder.svg?height=720&width=720', 
     '/placeholder.svg?height=300&width=300', 
     8388608, '2048x2048', ARRAY['forest', 'nature', 'fisheye', 'trees', 'path'], 
     '{"camera": "Canon 8-15mm", "location": "Pine Forest", "season": "Summer", "lighting": "Natural"}', 
     false, true, NOW(), NOW()),
    
    ('550e8400-e29b-41d4-a716-446655440022', 'Beach Sunset VR', 'Virtual reality ready beach sunset scene with crashing waves', '550e8400-e29b-41d4-a716-446655440003', 79.99, 
     '/placeholder.svg?height=2048&width=4096', 
     '/placeholder.svg?height=720&width=1440', 
     '/placeholder.svg?height=300&width=400', 
     20971520, '4096x2048', ARRAY['beach', 'sunset', 'VR', 'waves', 'ocean'], 
     '{"camera": "GoPro MAX", "location": "Pacific Coast", "time": "Sunset", "format": "VR180"}', 
     true, true, NOW(), NOW())
ON CONFLICT (title) DO NOTHING;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_licenses_updated_at ON licenses;
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fixed trigger function name reference
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ADMIN USER SETUP
-- ============================================================================

-- Create admin user in auth.users (if not exists)
-- Note: This requires service role permissions
DO $$
BEGIN
    -- Insert admin user if not exists
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        '550e8400-e29b-41d4-a716-446655440099',
        'authenticated',
        'authenticated',
        'admin@n3urali.art',
        crypt('C4rlit0s', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Admin User", "is_admin": true}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert corresponding user profile
    INSERT INTO user_profiles (
        id,
        email,
        full_name,
        is_admin,
        created_at,
        updated_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440099',
        'admin@n3urali.art',
        'Admin User',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        -- If we can't create auth user (permissions), just create profile
        INSERT INTO user_profiles (
            id,
            email,
            full_name,
            is_admin,
            created_at,
            updated_at
        ) VALUES (
            '550e8400-e29b-41d4-a716-446655440099',
            'admin@n3urali.art',
            'Admin User',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify setup
SELECT 'Database setup completed successfully!' as status;
SELECT 'Categories: ' || COUNT(*) as categories_count FROM categories WHERE active = true;
SELECT 'Licenses: ' || COUNT(*) as licenses_count FROM licenses WHERE active = true;
SELECT 'Sample Images: ' || COUNT(*) as images_count FROM images WHERE active = true;
SELECT 'Admin Users: ' || COUNT(*) as admin_count FROM user_profiles WHERE is_admin = true;
