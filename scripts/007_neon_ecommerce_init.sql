-- N3urali.art E-commerce Database Initialization for Neon
-- Creates all necessary tables for the 360° image marketplace

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table for organizing images (360°, fisheye, etc.)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Licenses table for different licensing options
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Images table - main product catalog
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    license_id UUID REFERENCES licenses(id),
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    price DECIMAL(10,2) NOT NULL,
    tags TEXT[],
    metadata JSONB,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table for purchase records
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table for items within orders
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    image_id UUID REFERENCES images(id),
    license_id UUID REFERENCES licenses(id),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Downloads table for tracking downloads
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    image_id UUID REFERENCES images(id),
    user_email VARCHAR(255) NOT NULL,
    download_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Download logs table for download history
CREATE TABLE IF NOT EXISTS download_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    download_id UUID REFERENCES downloads(id),
    user_email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category_id);
CREATE INDEX IF NOT EXISTS idx_images_license ON images(license_id);
CREATE INDEX IF NOT EXISTS idx_images_active ON images(active);
CREATE INDEX IF NOT EXISTS idx_images_featured ON images(featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_email ON downloads(user_email);

-- Insert initial categories
INSERT INTO categories (name, description, image_url) VALUES
('360° Images', 'Full 360-degree panoramic images for immersive experiences', '/placeholder.svg?height=200&width=300'),
('Fisheye', 'Ultra-wide fisheye lens photography with unique perspective', '/placeholder.svg?height=200&width=300'),
('VR Ready', 'Virtual reality optimized content for VR headsets', '/placeholder.svg?height=200&width=300')
ON CONFLICT (name) DO NOTHING;

-- Insert initial licenses
INSERT INTO licenses (name, description, price) VALUES
('Standard', 'Personal and small business use, up to 500,000 views', 29.99),
('Extended', 'Commercial use, unlimited views, resale rights', 79.99),
('Commercial', 'Full commercial rights, including broadcast and advertising', 199.99)
ON CONFLICT (name) DO NOTHING;

-- Insert sample images
INSERT INTO images (title, description, category_id, license_id, image_url, thumbnail_url, price, tags, metadata) 
SELECT 
    'Sunset Beach 360°',
    'Stunning 360-degree view of a tropical beach at sunset with crystal clear waters',
    c.id,
    l.id,
    '/placeholder.svg?height=400&width=800',
    '/placeholder.svg?height=200&width=300',
    49.99,
    ARRAY['beach', 'sunset', 'tropical', '360'],
    '{"resolution": "8K", "format": "equirectangular", "camera": "Insta360 Pro"}'::jsonb
FROM categories c, licenses l 
WHERE c.name = '360° Images' AND l.name = 'Standard'
ON CONFLICT DO NOTHING;

INSERT INTO images (title, description, category_id, license_id, image_url, thumbnail_url, price, tags, metadata) 
SELECT 
    'Urban Fisheye Perspective',
    'Dynamic fisheye view of a bustling city intersection with unique architectural perspective',
    c.id,
    l.id,
    '/placeholder.svg?height=400&width=800',
    '/placeholder.svg?height=200&width=300',
    39.99,
    ARRAY['urban', 'fisheye', 'architecture', 'street'],
    '{"resolution": "6K", "format": "fisheye", "lens": "8mm fisheye"}'::jsonb
FROM categories c, licenses l 
WHERE c.name = 'Fisheye' AND l.name = 'Standard'
ON CONFLICT DO NOTHING;

INSERT INTO images (title, description, category_id, license_id, image_url, thumbnail_url, price, tags, metadata) 
SELECT 
    'VR Forest Experience',
    'Immersive VR-ready forest environment with spatial audio mapping',
    c.id,
    l.id,
    '/placeholder.svg?height=400&width=800',
    '/placeholder.svg?height=200&width=300',
    89.99,
    ARRAY['VR', 'forest', 'nature', 'immersive'],
    '{"resolution": "8K", "format": "stereoscopic", "audio": "spatial"}'::jsonb
FROM categories c, licenses l 
WHERE c.name = 'VR Ready' AND l.name = 'Extended'
ON CONFLICT DO NOTHING;

-- Verification queries
SELECT 'Categories created:' as info, COUNT(*) as count FROM categories;
SELECT 'Licenses created:' as info, COUNT(*) as count FROM licenses;
SELECT 'Images created:' as info, COUNT(*) as count FROM images;
SELECT 'Tables created successfully' as status;
