-- Add indexes to improve query performance for image pagination
-- This will significantly speed up the getCachedImagesPaginated queries

-- Index for active images ordered by featured and created_at (most common query)
CREATE INDEX IF NOT EXISTS idx_images_active_featured_created 
ON images (active, featured DESC, created_at DESC) 
WHERE active = true;

-- Index for category-based queries
CREATE INDEX IF NOT EXISTS idx_images_category_active_featured 
ON images (category_id, active, featured DESC, created_at DESC) 
WHERE active = true;

-- Index for featured images
CREATE INDEX IF NOT EXISTS idx_images_featured_active_created 
ON images (featured, active, created_at DESC) 
WHERE active = true AND featured = true;

-- Index for categories name lookup (used in JOINs)
CREATE INDEX IF NOT EXISTS idx_categories_name 
ON categories (name) 
WHERE active = true;

-- Index for license lookups
CREATE INDEX IF NOT EXISTS idx_licenses_active 
ON licenses (id) 
WHERE active = true;

-- Composite index for the most common query pattern
CREATE INDEX IF NOT EXISTS idx_images_main_query 
ON images (active, category_id, featured DESC, created_at DESC) 
WHERE active = true;

-- Show index creation results
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('images', 'categories', 'licenses')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Show query performance improvement
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    i.id, i.title, i.description, i.price, i.image_url, i.thumbnail_url,
    i.active, i.featured, i.created_at, i.updated_at,
    c.name as category_name, c.id as category_id,
    l.name as license_name, l.description as license_description
FROM images i
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN licenses l ON i.license_id = l.id
WHERE i.active = true
ORDER BY i.featured DESC, i.created_at DESC
LIMIT 20 OFFSET 0;
