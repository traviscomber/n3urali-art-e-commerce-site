-- CRITICAL: Run this script before production deployment
-- This enables Row Level Security on all tables

-- Enable RLS on all tables
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;

-- Public read access for images (everyone can view active images)
CREATE POLICY "Public images are viewable by everyone"
ON images FOR SELECT
USING (active = true);

-- Admin full access to images
CREATE POLICY "Admins have full access to images"
ON images FOR ALL
USING (
  auth.jwt() ->> 'email' = 'travis@nuanu.com'
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Public read access for categories
CREATE POLICY "Categories are viewable by everyone"
ON categories FOR SELECT
USING (true);

-- Admin full access to categories
CREATE POLICY "Admins have full access to categories"
ON categories FOR ALL
USING (
  auth.jwt() ->> 'email' = 'travis@nuanu.com'
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Public read access for licenses
CREATE POLICY "Licenses are viewable by everyone"
ON licenses FOR SELECT
USING (active = true);

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.jwt() ->> 'email' = user_email);

-- Users can create their own orders
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'travis@nuanu.com'
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update orders (for approval)
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (
  auth.jwt() ->> 'email' = 'travis@nuanu.com'
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Users can view order items for their orders
CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_email = auth.jwt() ->> 'email'
  )
);

-- Users can view their own downloads
CREATE POLICY "Users can view their own downloads"
ON downloads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM order_items
    JOIN orders ON orders.id = order_items.order_id
    WHERE order_items.id = downloads.order_item_id
    AND orders.user_email = auth.jwt() ->> 'email'
  )
);

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (id = auth.uid());

-- Public read access for collections
CREATE POLICY "Collections are viewable by everyone"
ON collections FOR SELECT
USING (is_active = true);

-- Public read access for tags
CREATE POLICY "Tags are viewable by everyone"
ON tags FOR SELECT
USING (active = true);

-- Public read access for tag categories
CREATE POLICY "Tag categories are viewable by everyone"
ON tag_categories FOR SELECT
USING (active = true);

-- IMPORTANT: Test these policies thoroughly before production
-- Verify that:
-- 1. Anonymous users can browse images
-- 2. Logged-in users can only see their own orders
-- 3. Admins can access everything
-- 4. Users cannot access other users' data
