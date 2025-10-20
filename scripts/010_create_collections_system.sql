-- Create collections table for scheduled weekly collections
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_auto_curated BOOLEAN DEFAULT false,
  bundle_price DECIMAL(10, 2) DEFAULT 199.00,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create collection_images junction table
CREATE TABLE IF NOT EXISTS collection_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, image_id),
  UNIQUE(collection_id, position)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_dates ON collections(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active, start_date);
CREATE INDEX IF NOT EXISTS idx_collection_images_collection ON collection_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_images_position ON collection_images(collection_id, position);

-- Create function to get active collection
CREATE OR REPLACE FUNCTION get_active_collection()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  bundle_price DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.title, c.description, c.start_date, c.end_date, c.bundle_price
  FROM collections c
  WHERE c.is_active = true
    AND c.start_date <= NOW()
    AND c.end_date >= NOW()
  ORDER BY c.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-curate collection if none exists
CREATE OR REPLACE FUNCTION auto_curate_collection()
RETURNS UUID AS $$
DECLARE
  new_collection_id UUID;
  start_of_week TIMESTAMPTZ;
  end_of_week TIMESTAMPTZ;
BEGIN
  -- Calculate this week's Friday to next Friday
  start_of_week := date_trunc('week', NOW()) + INTERVAL '4 days'; -- Friday
  end_of_week := start_of_week + INTERVAL '7 days';
  
  -- Create auto-curated collection
  INSERT INTO collections (title, description, start_date, end_date, is_auto_curated, bundle_price)
  VALUES (
    'Weekly Collection - ' || to_char(start_of_week, 'Mon DD, YYYY'),
    'This week''s curated selection of 20 premium 360° images, automatically selected from our latest and most popular uploads.',
    start_of_week,
    end_of_week,
    true,
    199.00
  )
  RETURNING id INTO new_collection_id;
  
  -- Add 20 most recent active images to the collection
  INSERT INTO collection_images (collection_id, image_id, position)
  SELECT new_collection_id, i.id, ROW_NUMBER() OVER (ORDER BY i.created_at DESC)
  FROM images i
  WHERE i.is_active = true
  ORDER BY i.created_at DESC
  LIMIT 20;
  
  RETURN new_collection_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_images ENABLE ROW LEVEL SECURITY;

-- Allow public to read active collections
CREATE POLICY "Public can view active collections"
  ON collections FOR SELECT
  USING (is_active = true AND start_date <= NOW() AND end_date >= NOW());

-- Allow public to read collection images
CREATE POLICY "Public can view collection images"
  ON collection_images FOR SELECT
  USING (true);

-- Allow authenticated users to manage collections (admin only in practice)
CREATE POLICY "Authenticated users can manage collections"
  ON collections FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage collection images"
  ON collection_images FOR ALL
  USING (auth.role() = 'authenticated');
