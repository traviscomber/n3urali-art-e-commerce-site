-- Apply database indexes for improved query performance
-- This will significantly speed up the image queries

-- Index for the main images query with JOINs
CREATE INDEX IF NOT EXISTS idx_images_main_query 
ON images (created_at DESC, is_featured DESC, category_id, license_id);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_images_category_featured 
ON images (category_id, is_featured DESC, created_at DESC);

-- Index for featured images
CREATE INDEX IF NOT EXISTS idx_images_featured_created 
ON images (is_featured DESC, created_at DESC) 
WHERE is_featured = true;

-- Index for categories lookup
CREATE INDEX IF NOT EXISTS idx_categories_name 
ON categories (name);

-- Index for licenses lookup  
CREATE INDEX IF NOT EXISTS idx_licenses_id 
ON licenses (id);

-- Show applied indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('images', 'categories', 'licenses')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
