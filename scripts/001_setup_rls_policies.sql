-- Enable RLS on all tables and create policies for the e-commerce site

-- Categories table policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read categories (public data)
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);

-- Only authenticated users can manage categories (admin functionality)
CREATE POLICY "categories_insert_auth" ON categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "categories_update_auth" ON categories FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "categories_delete_auth" ON categories FOR DELETE USING (auth.uid() IS NOT NULL);

-- Licenses table policies
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read licenses (public data)
CREATE POLICY "licenses_select_all" ON licenses FOR SELECT USING (true);

-- Only authenticated users can manage licenses (admin functionality)
CREATE POLICY "licenses_insert_auth" ON licenses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "licenses_update_auth" ON licenses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "licenses_delete_auth" ON licenses FOR DELETE USING (auth.uid() IS NOT NULL);

-- Images table policies
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read images (public data for browsing)
CREATE POLICY "images_select_all" ON images FOR SELECT USING (true);

-- Only authenticated users can manage images (admin functionality)
CREATE POLICY "images_insert_auth" ON images FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "images_update_auth" ON images FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "images_delete_auth" ON images FOR DELETE USING (auth.uid() IS NOT NULL);

-- Orders table policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own orders
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Users can create orders with their own email
CREATE POLICY "orders_insert_own" ON orders FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Users can update their own orders (for status changes)
CREATE POLICY "orders_update_own" ON orders FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

-- Order items table policies
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can see order items for their own orders
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_email = auth.jwt() ->> 'email'
  )
);

-- Users can create order items for their own orders
CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_email = auth.jwt() ->> 'email'
  )
);

-- Downloads table policies
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Users can only see their own downloads
CREATE POLICY "downloads_select_own" ON downloads FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- System can create downloads for completed orders
CREATE POLICY "downloads_insert_system" ON downloads FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.id = downloads.order_item_id 
    AND o.user_email = downloads.user_email
    AND o.status = 'completed'
  )
);
