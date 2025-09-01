-- Simple Database Initialization for N3urali.art
-- Creates tables step by step to avoid dependency issues

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create categories table (no dependencies)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create licenses table (no dependencies)
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create user_profiles table (no dependencies)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create images table (depends on categories)
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category_id UUID REFERENCES categories(id),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create orders table (depends on user_profiles)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create order_items table (depends on orders, images, licenses)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    image_id UUID REFERENCES images(id),
    license_id UUID REFERENCES licenses(id),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create downloads table (depends on user_profiles, images)
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id),
    image_id UUID REFERENCES images(id),
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create download_logs table (depends on downloads)
CREATE TABLE IF NOT EXISTS download_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    download_id UUID REFERENCES downloads(id),
    user_id UUID REFERENCES user_profiles(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert basic categories
INSERT INTO categories (name, description)
SELECT * FROM (VALUES 
    ('360° Images', 'Full 360-degree panoramic images'),
    ('Fisheye', 'Fisheye lens photography'),
    ('VR Ready', 'Virtual reality compatible images')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories.name = v.name);

-- Insert basic licenses
INSERT INTO licenses (name, description, price)
SELECT * FROM (VALUES 
    ('Standard', 'Standard commercial license', 29.99),
    ('Extended', 'Extended commercial license with more usage rights', 59.99),
    ('Commercial', 'Full commercial license for unlimited usage', 99.99)
) AS v(name, description, price)
WHERE NOT EXISTS (SELECT 1 FROM licenses WHERE licenses.name = v.name);

-- Create admin user profile
INSERT INTO user_profiles (email, full_name, is_admin) 
SELECT 'admin@n3urali.art', 'Admin User', true
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'admin@n3urali.art');

-- Verification queries
SELECT 'Categories created:' as status, count(*) as count FROM categories;
SELECT 'Licenses created:' as status, count(*) as count FROM licenses;
SELECT 'User profiles created:' as status, count(*) as count FROM user_profiles;
SELECT 'Images table exists:' as status, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'images') 
            THEN 'YES' ELSE 'NO' END as exists;
SELECT 'Orders table exists:' as status, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') 
            THEN 'YES' ELSE 'NO' END as exists;
