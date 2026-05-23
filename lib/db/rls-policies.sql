-- Enable RLS on critical tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Categories: public read, admin write
DROP POLICY IF EXISTS categories_read ON categories;
CREATE POLICY categories_read ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS categories_write ON categories;
CREATE POLICY categories_write ON categories FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Collections: public read, creator write
DROP POLICY IF EXISTS collections_read ON collections;
CREATE POLICY collections_read ON collections FOR SELECT USING (is_active = true OR auth.uid() = created_by);
DROP POLICY IF EXISTS collections_write ON collections;
CREATE POLICY collections_write ON collections FOR UPDATE USING (auth.uid() = created_by);
DROP POLICY IF EXISTS collections_insert ON collections;
CREATE POLICY collections_insert ON collections FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Downloads: user views own
DROP POLICY IF EXISTS downloads_read ON downloads;
CREATE POLICY downloads_read ON downloads FOR SELECT USING (auth.uid() IN (SELECT user_id FROM orders WHERE id = order_id));

-- Images: public read, admin/owner write  
DROP POLICY IF EXISTS images_read ON images;
CREATE POLICY images_read ON images FOR SELECT USING (active = true OR auth.uid() = tenant_id);
DROP POLICY IF EXISTS images_write ON images;
CREATE POLICY images_write ON images FOR UPDATE USING (auth.uid() = tenant_id);

-- Licenses: public read
DROP POLICY IF EXISTS licenses_read ON licenses;
CREATE POLICY licenses_read ON licenses FOR SELECT USING (true);

-- Orders: user views own, admin views all
DROP POLICY IF EXISTS orders_read ON orders;
CREATE POLICY orders_read ON orders FOR SELECT USING (auth.uid()::text = user_email OR auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Order Items: user views own
DROP POLICY IF EXISTS order_items_read ON order_items;
CREATE POLICY order_items_read ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE auth.uid()::text = user_email));

-- Profiles: user views own
DROP POLICY IF EXISTS profiles_read ON profiles;
CREATE POLICY profiles_read ON profiles FOR SELECT USING (auth.uid() = id);

-- Screening Programs: public read
DROP POLICY IF EXISTS screening_programs_read ON screening_programs;
CREATE POLICY screening_programs_read ON screening_programs FOR SELECT USING (is_active = true);

-- Tags: public read
DROP POLICY IF EXISTS tags_read ON tags;
CREATE POLICY tags_read ON tags FOR SELECT USING (active = true);

-- Tag Categories: public read
DROP POLICY IF EXISTS tag_categories_read ON tag_categories;
CREATE POLICY tag_categories_read ON tag_categories FOR SELECT USING (active = true);

-- User Profiles: user views own
DROP POLICY IF EXISTS user_profiles_read ON user_profiles;
CREATE POLICY user_profiles_read ON user_profiles FOR SELECT USING (auth.uid() = id);
