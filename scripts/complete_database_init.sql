-- Complete Database Initialization Script for n3urali.art E-commerce Site
-- This script sets up the entire database schema from scratch

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. USER PROFILES AND AUTHENTICATION
-- =============================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE WHEN NEW.email = 'travis@nuanu.com' THEN TRUE ELSE FALSE END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 2. IMAGE CATEGORIES AND MANAGEMENT
-- =============================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    preview_url TEXT,
    thumbnail_url TEXT,
    dimensions TEXT, -- e.g., "8192x4096"
    file_size BIGINT, -- in bytes
    tags TEXT[], -- array of tags
    metadata JSONB DEFAULT '{}',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. LICENSING SYSTEM
-- =============================================

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    price_multiplier DECIMAL(5,2) DEFAULT 1.00, -- multiplier for base image price
    terms TEXT, -- license terms and conditions
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. E-COMMERCE SYSTEM
-- =============================================

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL, -- store email even if user is deleted
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_intent_id TEXT, -- Stripe payment intent ID
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
    billing_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    image_id UUID REFERENCES images(id) ON DELETE SET NULL,
    license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    image_title TEXT, -- store title even if image is deleted
    license_name TEXT, -- store license name even if license is deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. DOWNLOAD AND TRACKING SYSTEM
-- =============================================

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    download_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    download_url TEXT, -- generated download URL
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    downloaded_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 3,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create download_logs table for tracking
CREATE TABLE IF NOT EXISTS download_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    download_id UUID REFERENCES downloads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    image_title TEXT,
    license_name TEXT,
    ip_address INET,
    user_agent TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Images policies (public read, admin write)
CREATE POLICY "Anyone can view active images" ON images FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage images" ON images FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Licenses policies (public read, admin write)
CREATE POLICY "Anyone can view active licenses" ON licenses FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage licenses" ON licenses FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Orders policies (users can view their own, admins can view all)
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Downloads policies
CREATE POLICY "Users can view their own downloads" ON downloads FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM order_items oi 
        JOIN orders o ON oi.order_id = o.id 
        WHERE oi.id = order_item_id AND o.user_id = auth.uid()
    )
);
CREATE POLICY "Admins can view all downloads" ON downloads FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Download logs policies (admin only)
CREATE POLICY "Admins can view download logs" ON download_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "System can insert download logs" ON download_logs FOR INSERT WITH CHECK (TRUE);

-- =============================================
-- 7. HELPER FUNCTIONS
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log downloads
CREATE OR REPLACE FUNCTION log_download(
    download_id_param UUID,
    ip_address_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    download_record RECORD;
    order_record RECORD;
BEGIN
    -- Get download and order information
    SELECT d.*, oi.image_id, oi.license_id, oi.image_title, oi.license_name, o.user_id, o.email
    INTO download_record
    FROM downloads d
    JOIN order_items oi ON d.order_item_id = oi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE d.id = download_id_param;
    
    IF download_record IS NOT NULL THEN
        -- Insert download log
        INSERT INTO download_logs (
            download_id, user_id, user_email, image_title, license_name, 
            ip_address, user_agent
        ) VALUES (
            download_id_param, download_record.user_id, download_record.email,
            download_record.image_title, download_record.license_name,
            ip_address_param, user_agent_param
        );
        
        -- Update download record
        UPDATE downloads 
        SET 
            downloaded_at = NOW(),
            download_count = download_count + 1,
            ip_address = COALESCE(ip_address_param, ip_address),
            user_agent = COALESCE(user_agent_param, user_agent)
        WHERE id = download_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Images indexes
CREATE INDEX IF NOT EXISTS idx_images_category_id ON images(category_id);
CREATE INDEX IF NOT EXISTS idx_images_active ON images(active);
CREATE INDEX IF NOT EXISTS idx_images_featured ON images(featured);
CREATE INDEX IF NOT EXISTS idx_images_price ON images(price);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_image_id ON order_items(image_id);

-- Downloads indexes
CREATE INDEX IF NOT EXISTS idx_downloads_order_item_id ON downloads(order_item_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_downloads_expires_at ON downloads(expires_at);

-- Download logs indexes
CREATE INDEX IF NOT EXISTS idx_download_logs_download_id ON download_logs(download_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_user_id ON download_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_downloaded_at ON download_logs(downloaded_at);

-- =============================================
-- 9. INITIAL DATA
-- =============================================

-- Insert default categories
INSERT INTO categories (name, description, slug, sort_order) VALUES
('360° Images', 'Equirectangular panoramic images for VR and immersive experiences', 'equirectangular', 1),
('Fisheye', 'Fisheye lens photography with unique perspective distortion', 'fisheye', 2),
('HDR Panoramas', 'High Dynamic Range panoramic images', 'hdr-panoramas', 3),
('Virtual Tours', 'Complete virtual tour packages', 'virtual-tours', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert default licenses
INSERT INTO licenses (name, description, price_multiplier, terms) VALUES
('Personal Use', 'For personal, non-commercial use only', 1.00, 'This license allows you to use the image for personal projects only. Commercial use is prohibited.'),
('Commercial Use', 'For commercial projects and business use', 2.50, 'This license allows you to use the image for commercial projects, advertising, and business purposes.'),
('Extended License', 'For unlimited use including resale and distribution', 5.00, 'This license provides unlimited usage rights including the right to resell and distribute the image.'),
('Exclusive Rights', 'Exclusive ownership with full rights', 15.00, 'This license provides exclusive ownership of the image with full rights to use, modify, and distribute.')
ON CONFLICT (name) DO NOTHING;

-- Set up admin user (will be created when they first sign up)
-- The trigger function will automatically set is_admin = TRUE for travis@nuanu.com

-- =============================================
-- 10. FINAL SETUP
-- =============================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for tables with updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully!';
    RAISE NOTICE 'Created tables: user_profiles, categories, images, licenses, orders, order_items, downloads, download_logs';
    RAISE NOTICE 'Set up RLS policies, indexes, and helper functions';
    RAISE NOTICE 'Admin user will be automatically created when travis@nuanu.com signs up';
    RAISE NOTICE 'Ready to use!';
END $$;
