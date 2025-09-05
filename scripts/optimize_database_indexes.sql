-- Adding database indexes for performance optimization
-- Create indexes for frequently queried fields to improve query performance

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

-- JSONB index for metadata queries (if using metadata field)
CREATE INDEX IF NOT EXISTS idx_images_metadata_gin ON images USING gin(metadata) WHERE metadata IS NOT NULL;

-- Analyze tables to update statistics for query planner
ANALYZE images;
ANALYZE categories;
ANALYZE orders;
ANALYZE order_items;
ANALYZE licenses;
