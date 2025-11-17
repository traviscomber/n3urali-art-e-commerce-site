-- Create tag_categories table for organizing tags into logical groups
CREATE TABLE IF NOT EXISTS tag_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table for the enhanced tag system
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES tag_categories(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, category_id)
);

-- Create image_tags junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS image_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(image_id, tag_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tags_category_id ON tags(category_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_image_tags_image_id ON image_tags(image_id);
CREATE INDEX IF NOT EXISTS idx_image_tags_tag_id ON image_tags(tag_id);

-- Insert default tag categories
INSERT INTO tag_categories (name, slug, description, color, icon, active) VALUES
  ('Subject', 'subject', 'Main subject or focus of the image', '#3B82F6', 'Eye', true),
  ('Style', 'style', 'Artistic style or technique', '#8B5CF6', 'Palette', true),
  ('Color', 'color', 'Dominant colors in the image', '#EC4899', 'Droplet', true),
  ('Mood', 'mood', 'Emotional tone or atmosphere', '#F59E0B', 'Smile', true),
  ('Location', 'location', 'Geographic location or setting', '#10B981', 'MapPin', true),
  ('Time', 'time', 'Time period or season', '#06B6D4', 'Clock', true)
ON CONFLICT (slug) DO NOTHING;

-- Create function to update tag usage counts
CREATE OR REPLACE FUNCTION update_tag_usage_counts()
RETURNS void AS $$
BEGIN
  UPDATE tags
  SET usage_count = (
    SELECT COUNT(*)
    FROM image_tags
    WHERE image_tags.tag_id = tags.id
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update tag usage count when image_tags changes
CREATE OR REPLACE FUNCTION update_tag_usage_on_image_tag_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET usage_count = GREATEST(usage_count - 1, 0) WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_usage
AFTER INSERT OR DELETE ON image_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_on_image_tag_change();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON tags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tag_categories_updated_at
BEFORE UPDATE ON tag_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
