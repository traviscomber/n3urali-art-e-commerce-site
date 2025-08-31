-- Disable RLS temporarily for admin operations on images table
-- This allows the service role key to perform CRUD operations without authentication
ALTER TABLE images DISABLE ROW LEVEL SECURITY;

-- Alternative: Create admin-friendly RLS policies (commented out)
-- If you prefer to keep RLS enabled, uncomment the following:

/*
-- Re-enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for service role
CREATE POLICY "Allow service role full access to images" ON images
FOR ALL USING (true);

-- Or create policies that allow admin users
CREATE POLICY "Allow admin users full access to images" ON images
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.is_admin = true
  )
);
*/

-- Also disable RLS on categories table for admin operations
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Create some default categories if they don't exist
INSERT INTO categories (id, name, description, slug, active, sort_order) VALUES
  (gen_random_uuid(), 'Nature & Landscapes', 'Beautiful natural landscapes and outdoor scenes', 'nature-landscapes', true, 1),
  (gen_random_uuid(), 'Interior Spaces', 'Indoor architectural and interior design photography', 'interior-spaces', true, 2),
  (gen_random_uuid(), 'Urban & Architecture', 'City scenes, buildings, and architectural photography', 'urban-architecture', true, 3),
  (gen_random_uuid(), 'Fisheye', 'Wide-angle fisheye lens photography', 'fisheye', true, 4),
  (gen_random_uuid(), 'Panoramic', 'Wide panoramic and 360-degree photography', 'panoramic', true, 5)
ON CONFLICT (name) DO NOTHING;
