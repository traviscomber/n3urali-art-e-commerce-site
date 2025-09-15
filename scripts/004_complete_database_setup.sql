-- Complete database setup for N3urali.art e-commerce platform
-- This script creates all necessary tables with proper relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table with proper foreign key relationships
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    resolution TEXT DEFAULT '4096x4096',
    format TEXT DEFAULT 'JPG',
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    download_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create download_logs table
CREATE TABLE IF NOT EXISTS download_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    download_id UUID REFERENCES downloads(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_category_id ON images(category_id);
CREATE INDEX IF NOT EXISTS idx_images_license_id ON images(license_id);
CREATE INDEX IF NOT EXISTS idx_images_active ON images(active);
CREATE INDEX IF NOT EXISTS idx_images_featured ON images(featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_image_id ON order_items(image_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_licenses_updated_at ON licenses;
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description, slug) VALUES 
    ('360° Images', 'Full 360-degree panoramic images', '360-images'),
    ('Fisheye', '180-degree fisheye lens images', 'fisheye'),
    ('VR Ready', 'Virtual reality compatible images', 'vr-ready'),
    ('Nature', 'Natural landscapes and environments', 'nature'),
    ('Architecture', 'Buildings and architectural structures', 'architecture'),
    ('Urban', 'City and urban environments', 'urban')
ON CONFLICT (name) DO NOTHING;

-- Insert default licenses
INSERT INTO licenses (name, description, price) VALUES 
    ('Standard', 'Personal and small commercial use', 29.99),
    ('Extended', 'Extended commercial use with broader rights', 79.99),
    ('Premium', 'Full commercial use with unlimited rights', 199.99),
    ('Editorial', 'Editorial use only, not for commercial purposes', 19.99)
ON CONFLICT (name) DO NOTHING;

-- Create admin user
INSERT INTO user_profiles (email, full_name, is_admin) VALUES 
    ('travis@nuanu.com', 'Travis Admin', TRUE)
ON CONFLICT (email) DO UPDATE SET is_admin = TRUE;

-- Create RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.jwt() ->> 'email' = email);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.jwt() ->> 'email' = email);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE email = auth.jwt() ->> 'email' AND is_admin = TRUE)
);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE email = auth.jwt() ->> 'email' AND is_admin = TRUE)
);

-- Licenses policies (public read, admin write)
CREATE POLICY "Anyone can view active licenses" ON licenses FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage licenses" ON licenses FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE email = auth.jwt() ->> 'email' AND is_admin = TRUE)
);

-- Images policies (public read active, admin write)
CREATE POLICY "Anyone can view active images" ON images FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage images" ON images FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE email = auth.jwt() ->> 'email' AND is_admin = TRUE)
);

-- Orders policies (users see their own, admins see all)
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (user_email = auth.jwt() ->> 'email');
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE email = auth.jwt() ->> 'email' AND is_admin = TRUE)
);

-- Order items policies
CREATE POLICY "Users can view their order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_email = auth.jwt() ->> 'email')
);
CREATE POLICY "Users can create order items for their orders" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_email = auth.jwt() ->> 'email')
);
CREATE POLICY "Admins can manage all order items" ON order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE email = auth.jwt() ->> 'email' AND is_admin = TRUE)
);

-- Downloads policies
CREATE POLICY "Users can view their downloads" ON downloads FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM order_items 
        JOIN orders ON orders.id = order_items.order_id 
        WHERE order_items.id = downloads.order_item_id 
        AND orders.user_email = auth.jwt() ->> 'email'
    )
);
CREATE POLICY "Admins can manage all downloads" ON downloads FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE email = auth.jwt() ->> 'email' AND is_admin = TRUE)
);

-- Download logs policies
CREATE POLICY "Admins can view download logs" ON download_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE email = auth.jwt() ->> 'email' AND is_admin = TRUE)
);
CREATE POLICY "System can insert download logs" ON download_logs FOR INSERT WITH CHECK (TRUE);

-- Create database stats function
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    total_images BIGINT,
    total_orders BIGINT,
    total_downloads BIGINT,
    active_categories BIGINT,
    active_licenses BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM images WHERE active = TRUE) as total_images,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM downloads) as total_downloads,
        (SELECT COUNT(*) FROM categories WHERE active = TRUE) as active_categories,
        (SELECT COUNT(*) FROM licenses WHERE active = TRUE) as active_licenses;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_database_stats() TO authenticated, anon;

COMMIT;
