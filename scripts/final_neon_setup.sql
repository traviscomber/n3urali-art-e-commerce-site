-- Final Neon Database Setup for N3urali.art E-commerce Platform
-- This script ensures all e-commerce tables are properly configured with data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. POPULATE CATEGORIES
-- =============================================
INSERT INTO categories (id, name, description, image_url, active, created_at, updated_at) 
VALUES 
  (uuid_generate_v4(), '360° Images', 'Full spherical panoramic images perfect for VR and immersive experiences', '/images/categories/360-images.jpg', true, NOW(), NOW()),
  (uuid_generate_v4(), 'Fisheye', 'Ultra-wide angle fisheye lens captures for unique perspectives', '/images/categories/fisheye.jpg', true, NOW(), NOW()),
  (uuid_generate_v4(), 'VR Ready', 'Images optimized and ready for virtual reality applications', '/images/categories/vr-ready.jpg', true, NOW(), NOW()),
  (uuid_generate_v4(), 'Nature & Landscapes', 'Stunning natural environments and landscape photography', '/images/categories/nature.jpg', true, NOW(), NOW()),
  (uuid_generate_v4(), 'Architecture', 'Architectural photography including buildings and structures', '/images/categories/architecture.jpg', true, NOW(), NOW()),
  (uuid_generate_v4(), 'Urban Scenes', 'City life, streets, and urban environments', '/images/categories/urban.jpg', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. POPULATE LICENSES
-- =============================================
INSERT INTO licenses (id, name, description, price, active, created_at, updated_at) 
VALUES 
  (uuid_generate_v4(), 'Standard License', 'Personal and commercial use with attribution required. Perfect for blogs, websites, and small projects.', 29.99, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Extended License', 'Commercial use without attribution required. Ideal for marketing materials and client projects.', 79.99, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Premium License', 'Unlimited commercial use including resale rights. Best for agencies and large-scale projects.', 199.99, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Editorial License', 'For editorial and educational use only. Cannot be used for commercial purposes.', 19.99, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =============================================
-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Images indexes
CREATE INDEX IF NOT EXISTS idx_images_active ON images(active);
CREATE INDEX IF NOT EXISTS idx_images_featured ON images(featured);
CREATE INDEX IF NOT EXISTS idx_images_category_id ON images(category_id);
CREATE INDEX IF NOT EXISTS idx_images_license_id ON images(license_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_price ON images(price);
CREATE INDEX IF NOT EXISTS idx_images_download_count ON images(download_count DESC);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_image_id ON order_items(image_id);

-- Downloads indexes
CREATE INDEX IF NOT EXISTS idx_downloads_user_email ON downloads(user_email);
CREATE INDEX IF NOT EXISTS idx_downloads_image_id ON downloads(image_id);
CREATE INDEX IF NOT EXISTS idx_downloads_expires_at ON downloads(expires_at);

-- =============================================
-- 4. ADD CONSTRAINTS AND FOREIGN KEYS
-- =============================================
-- Fixed constraint creation using DO blocks to handle existing constraints safely
DO $$ 
BEGIN
    -- Add foreign key constraints with proper error handling
    BEGIN
        ALTER TABLE images ADD CONSTRAINT fk_images_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
    END;
    
    BEGIN
        ALTER TABLE images ADD CONSTRAINT fk_images_license 
        FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
    END;
    
    BEGIN
        ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
    END;
    
    BEGIN
        ALTER TABLE order_items ADD CONSTRAINT fk_order_items_image 
        FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
    END;
    
    BEGIN
        ALTER TABLE order_items ADD CONSTRAINT fk_order_items_license 
        FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
    END;
    
    BEGIN
        ALTER TABLE downloads ADD CONSTRAINT fk_downloads_image 
        FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
    END;
    
    BEGIN
        ALTER TABLE downloads ADD CONSTRAINT fk_downloads_order 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
    END;
    
    BEGIN
        ALTER TABLE download_logs ADD CONSTRAINT fk_download_logs_download 
        FOREIGN KEY (download_id) REFERENCES downloads(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
    END;
END $$;

-- =============================================
-- 5. SET DEFAULT VALUES AND CONSTRAINTS
-- =============================================
-- Using DO blocks for ALTER TABLE operations to handle existing defaults safely
DO $$ 
BEGIN
    -- Set defaults for images table
    BEGIN
        ALTER TABLE images ALTER COLUMN active SET DEFAULT true;
    EXCEPTION WHEN others THEN
        -- Default already exists or column doesn't exist, skip
    END;
    
    BEGIN
        ALTER TABLE images ALTER COLUMN featured SET DEFAULT false;
    EXCEPTION WHEN others THEN
        -- Default already exists or column doesn't exist, skip
    END;
    
    BEGIN
        ALTER TABLE images ALTER COLUMN download_count SET DEFAULT 0;
    EXCEPTION WHEN others THEN
        -- Default already exists or column doesn't exist, skip
    END;
    
    BEGIN
        ALTER TABLE images ALTER COLUMN created_at SET DEFAULT NOW();
    EXCEPTION WHEN others THEN
        -- Default already exists or column doesn't exist, skip
    END;
    
    BEGIN
        ALTER TABLE images ALTER COLUMN updated_at SET DEFAULT NOW();
    EXCEPTION WHEN others THEN
        -- Default already exists or column doesn't exist, skip
    END;
END $$;

-- =============================================
-- 6. CREATE TRIGGERS FOR UPDATED_AT
-- =============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at 
    BEFORE UPDATE ON images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_licenses_updated_at ON licenses;
CREATE TRIGGER update_licenses_updated_at 
    BEFORE UPDATE ON licenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. VERIFICATION QUERIES
-- =============================================
-- Check that all tables exist and have data
SELECT 'Categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 'Licenses' as table_name, COUNT(*) as record_count FROM licenses
UNION ALL
SELECT 'Images' as table_name, COUNT(*) as record_count FROM images
UNION ALL
SELECT 'Orders' as table_name, COUNT(*) as record_count FROM orders
UNION ALL
SELECT 'Order Items' as table_name, COUNT(*) as record_count FROM order_items
UNION ALL
SELECT 'Downloads' as table_name, COUNT(*) as record_count FROM downloads
UNION ALL
SELECT 'Download Logs' as table_name, COUNT(*) as record_count FROM download_logs;

-- Show categories
SELECT id, name, active FROM categories ORDER BY name;

-- Show licenses
SELECT id, name, price, active FROM licenses ORDER BY price;

-- Show database is ready
SELECT 'N3urali.art E-commerce Database Setup Complete!' as status;
