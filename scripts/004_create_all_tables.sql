-- Complete Database Initialization for N3urali.art E-commerce Platform
-- Creates all necessary tables, relationships, and initial data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price_multiplier DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image_url TEXT NOT NULL,
    preview_url TEXT,
    file_size BIGINT,
    dimensions VARCHAR(50),
    format VARCHAR(20),
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Added DEFAULT uuid_generate_v4() to fix foreign key constraint issues
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create download_logs table
CREATE TABLE IF NOT EXISTS download_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    download_id UUID REFERENCES downloads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_category_id ON images(category_id);
CREATE INDEX IF NOT EXISTS idx_images_active ON images(active);
CREATE INDEX IF NOT EXISTS idx_images_featured ON images(featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_image_id ON order_items(image_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_image_id ON downloads(image_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_download_id ON download_logs(download_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_licenses_updated_at ON licenses;
CREATE TRIGGER update_licenses_updated_at
    BEFORE UPDATE ON licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at
    BEFORE UPDATE ON images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_downloads_updated_at ON downloads;
CREATE TRIGGER update_downloads_updated_at
    BEFORE UPDATE ON downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for admin operations (temporary for setup)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE images DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs DISABLE ROW LEVEL SECURITY;

-- Insert initial categories
INSERT INTO categories (name, description) VALUES
('360° Panoramas', 'Full 360-degree panoramic images for immersive experiences')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, description) VALUES
('Fisheye', 'Ultra-wide fisheye lens photography with unique perspective')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, description) VALUES
('VR Ready', 'Virtual reality optimized images for VR applications')
ON CONFLICT (name) DO NOTHING;

-- Insert initial licenses
INSERT INTO licenses (name, description, price_multiplier) VALUES
('Standard', 'Personal and commercial use with attribution', 1.00)
ON CONFLICT (name) DO NOTHING;

INSERT INTO licenses (name, description, price_multiplier) VALUES
('Extended', 'Commercial use without attribution required', 2.50)
ON CONFLICT (name) DO NOTHING;

INSERT INTO licenses (name, description, price_multiplier) VALUES
('Commercial', 'Full commercial rights including resale', 5.00)
ON CONFLICT (name) DO NOTHING;

-- Insert sample images
INSERT INTO images (title, description, category_id, base_price, image_url, preview_url, dimensions, format, featured) 
SELECT 
    'Urban Skyline 360°',
    'Stunning 360-degree view of a modern city skyline at golden hour',
    c.id,
    29.99,
    '/placeholder.svg?height=2048&width=4096',
    '/placeholder.svg?height=512&width=1024',
    '4096x2048',
    'JPEG',
    true
FROM categories c WHERE c.name = '360° Panoramas'
AND NOT EXISTS (SELECT 1 FROM images WHERE title = 'Urban Skyline 360°');

INSERT INTO images (title, description, category_id, base_price, image_url, preview_url, dimensions, format, featured)
SELECT 
    'Forest Canopy Fisheye',
    'Dramatic fisheye perspective looking up through dense forest canopy',
    c.id,
    24.99,
    '/placeholder.svg?height=2048&width=2048',
    '/placeholder.svg?height=512&width=512',
    '2048x2048',
    'JPEG',
    true
FROM categories c WHERE c.name = 'Fisheye'
AND NOT EXISTS (SELECT 1 FROM images WHERE title = 'Forest Canopy Fisheye');

INSERT INTO images (title, description, category_id, base_price, image_url, preview_url, dimensions, format)
SELECT 
    'VR Beach Paradise',
    'Tropical beach scene optimized for virtual reality experiences',
    c.id,
    39.99,
    '/placeholder.svg?height=2048&width=4096',
    '/placeholder.svg?height=512&width=1024',
    '4096x2048',
    'JPEG'
FROM categories c WHERE c.name = 'VR Ready'
AND NOT EXISTS (SELECT 1 FROM images WHERE title = 'VR Beach Paradise');

-- Verification queries
SELECT 'Categories created:' as info, COUNT(*) as count FROM categories;
SELECT 'Licenses created:' as info, COUNT(*) as count FROM licenses;
SELECT 'Images created:' as info, COUNT(*) as count FROM images;

-- Success message
SELECT 'Database initialization completed successfully!' as status;
