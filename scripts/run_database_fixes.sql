-- Comprehensive Database Fix Script
-- Combines multiple fixes for common database issues

BEGIN;

-- =============================================
-- 1. FIX BROKEN IMAGE URLS
-- =============================================

-- Check current broken URLs
SELECT 
    'BEFORE FIX' as status,
    COUNT(*) as total_images,
    COUNT(CASE WHEN image_url LIKE '%/uploads/%' THEN 1 END) as broken_image_urls,
    COUNT(CASE WHEN thumbnail_url LIKE '%/uploads/%' THEN 1 END) as broken_thumb_urls
FROM images;

-- Update broken URLs to use placeholder images temporarily
UPDATE images 
SET 
    image_url = CASE 
        WHEN image_url LIKE '%/uploads/%' THEN '/placeholder.svg?height=800&width=800'
        ELSE image_url
    END,
    thumbnail_url = CASE 
        WHEN thumbnail_url LIKE '%/uploads/%' THEN '/placeholder.svg?height=200&width=200'
        ELSE thumbnail_url
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'migration_status', 'placeholder_urls_set',
        'migration_date', NOW()::text,
        'original_broken_url', CASE WHEN image_url LIKE '%/uploads/%' THEN image_url ELSE NULL END
    )
WHERE image_url LIKE '%/uploads/%' OR thumbnail_url LIKE '%/uploads/%';

-- =============================================
-- 2. ADD PERFORMANCE INDEXES
-- =============================================

-- Index for images table - most frequently queried fields
CREATE INDEX IF NOT EXISTS idx_images_active ON images(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_images_category_active ON images(category_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_images_featured_created ON images(featured DESC, created_at DESC) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_price ON images(price);

-- Index for categories table
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Index for orders table
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Index for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_image_id ON order_items(image_id);

-- Index for licenses table
CREATE INDEX IF NOT EXISTS idx_licenses_active ON licenses(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_licenses_name ON licenses(name);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_images_category_featured_created ON images(category_id, featured DESC, created_at DESC) WHERE active = true;

-- JSONB index for metadata queries
CREATE INDEX IF NOT EXISTS idx_images_metadata_gin ON images USING gin(metadata) WHERE metadata IS NOT NULL;

-- =============================================
-- 3. ENSURE PROPER CONSTRAINTS
-- =============================================

-- Add foreign key constraints with proper error handling
DO $$ 
BEGIN
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
END $$;

-- =============================================
-- 4. UPDATE TABLE STATISTICS
-- =============================================

-- Analyze tables to update statistics for query planner
ANALYZE images;
ANALYZE categories;
ANALYZE orders;
ANALYZE order_items;
ANALYZE licenses;

COMMIT;

-- =============================================
-- 5. VERIFICATION RESULTS
-- =============================================

-- Show results after fixes
SELECT 
    'AFTER FIX' as status,
    COUNT(*) as total_images,
    COUNT(CASE WHEN image_url LIKE '/placeholder.svg%' THEN 1 END) as placeholder_images,
    COUNT(CASE WHEN image_url LIKE '%backblazeb2.com%' THEN 1 END) as backblaze_images,
    COUNT(CASE WHEN image_url LIKE '%/uploads/%' THEN 1 END) as remaining_broken_urls
FROM images;

-- Show created indexes
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE tablename IN ('images', 'categories', 'licenses', 'orders', 'order_items')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Show table record counts
SELECT 'Categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 'Licenses' as table_name, COUNT(*) as record_count FROM licenses
UNION ALL
SELECT 'Images' as table_name, COUNT(*) as record_count FROM images
UNION ALL
SELECT 'Orders' as table_name, COUNT(*) as record_count FROM orders
UNION ALL
SELECT 'Order Items' as table_name, COUNT(*) as record_count FROM order_items;

SELECT 'Database fixes completed successfully!' as status;
