-- Enhanced Tag Classification System for N3urali.art
-- This script improves the existing tag system with better categorization, validation, and management

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a dedicated tags table for better organization and management
CREATE TABLE IF NOT EXISTS tag_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6B7280', -- Tailwind gray-500 as default
    icon TEXT, -- Lucide icon name
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a comprehensive tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES tag_categories(id) ON DELETE SET NULL,
    usage_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    synonyms TEXT[] DEFAULT '{}', -- Alternative names for this tag
    related_tags UUID[] DEFAULT '{}', -- Related tag IDs
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for image-tag relationships (many-to-many)
CREATE TABLE IF NOT EXISTS image_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    confidence DECIMAL(3,2) DEFAULT 1.00, -- AI confidence score for auto-generated tags
    source TEXT DEFAULT 'manual', -- 'manual', 'auto', 'ai', 'import'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_id, tag_id)
);

-- Insert tag categories based on existing patterns
INSERT INTO tag_categories (name, description, color, icon, sort_order) VALUES
('Technical Format', 'Image format and technical specifications', '#3B82F6', 'Settings', 1),
('Subject Matter', 'Main subject or content of the image', '#10B981', 'Image', 2),
('Environment', 'Location and environmental context', '#059669', 'MapPin', 3),
('Mood & Style', 'Artistic style and emotional tone', '#8B5CF6', 'Palette', 4),
('Time & Weather', 'Temporal and weather conditions', '#F59E0B', 'Sun', 5),
('Architecture', 'Architectural styles and building types', '#EF4444', 'Building', 6),
('Usage Context', 'Intended use cases and applications', '#6366F1', 'Target', 7)
ON CONFLICT (name) DO NOTHING;

-- Get category IDs for tag insertion
DO $$
DECLARE
    technical_id UUID;
    subject_id UUID;
    environment_id UUID;
    mood_id UUID;
    time_id UUID;
    architecture_id UUID;
    usage_id UUID;
BEGIN
    SELECT id INTO technical_id FROM tag_categories WHERE name = 'Technical Format';
    SELECT id INTO subject_id FROM tag_categories WHERE name = 'Subject Matter';
    SELECT id INTO environment_id FROM tag_categories WHERE name = 'Environment';
    SELECT id INTO mood_id FROM tag_categories WHERE name = 'Mood & Style';
    SELECT id INTO time_id FROM tag_categories WHERE name = 'Time & Weather';
    SELECT id INTO architecture_id FROM tag_categories WHERE name = 'Architecture';
    SELECT id INTO usage_id FROM tag_categories WHERE name = 'Usage Context';

    -- Insert comprehensive tag library based on existing patterns
    INSERT INTO tags (name, slug, description, category_id, is_featured, synonyms) VALUES
    
    -- Technical Format Tags
    ('360°', '360-degree', 'Full 360-degree spherical panoramic images', technical_id, true, ARRAY['360', 'spherical', 'equirectangular']),
    ('Fisheye', 'fisheye', 'Ultra-wide angle fisheye lens photography', technical_id, true, ARRAY['fisheye-lens', 'circular']),
    ('Panoramic', 'panoramic', 'Wide panoramic format images', technical_id, true, ARRAY['panorama', 'wide-angle']),
    ('High Resolution', 'high-resolution', '4K, 8K, or higher resolution images', technical_id, false, ARRAY['4k', '8k', '16k', 'hires']),
    ('VR Ready', 'vr-ready', 'Optimized for virtual reality applications', technical_id, true, ARRAY['virtual-reality', 'vr', 'immersive']),
    
    -- Subject Matter Tags
    ('Landscape', 'landscape', 'Natural landscape photography', subject_id, true, ARRAY['scenery', 'vista', 'terrain']),
    ('Architecture', 'architecture', 'Buildings and architectural structures', subject_id, true, ARRAY['building', 'structure', 'construction']),
    ('Interior', 'interior', 'Indoor spaces and interior design', subject_id, true, ARRAY['indoor', 'room', 'inside']),
    ('Nature', 'nature', 'Natural environments and wildlife', subject_id, true, ARRAY['natural', 'wilderness', 'outdoor']),
    ('Urban', 'urban', 'City scenes and urban environments', subject_id, true, ARRAY['city', 'metropolitan', 'downtown']),
    ('Abstract', 'abstract', 'Abstract and artistic compositions', subject_id, false, ARRAY['artistic', 'creative', 'conceptual']),
    
    -- Environment Tags
    ('Ocean', 'ocean', 'Ocean, sea, and marine environments', environment_id, true, ARRAY['sea', 'water', 'marine', 'seascape']),
    ('Mountain', 'mountain', 'Mountain ranges and alpine environments', environment_id, true, ARRAY['alpine', 'peak', 'summit', 'hills']),
    ('Forest', 'forest', 'Wooded areas and forest environments', environment_id, true, ARRAY['woods', 'trees', 'woodland', 'jungle']),
    ('Desert', 'desert', 'Desert landscapes and arid environments', environment_id, false, ARRAY['arid', 'sand', 'dunes', 'dry']),
    ('Beach', 'beach', 'Coastal and beach environments', environment_id, true, ARRAY['coast', 'shore', 'seaside', 'tropical']),
    ('Sky', 'sky', 'Sky, clouds, and atmospheric elements', environment_id, true, ARRAY['clouds', 'atmosphere', 'heavens']),
    
    -- Mood & Style Tags
    ('Dramatic', 'dramatic', 'High contrast and dramatic lighting', mood_id, false, ARRAY['intense', 'striking', 'bold']),
    ('Serene', 'serene', 'Peaceful and calming atmosphere', mood_id, false, ARRAY['peaceful', 'calm', 'tranquil', 'meditation']),
    ('Vibrant', 'vibrant', 'Rich colors and vibrant tones', mood_id, false, ARRAY['colorful', 'bright', 'vivid']),
    ('Minimalist', 'minimalist', 'Clean, simple, minimalist composition', mood_id, false, ARRAY['simple', 'clean', 'minimal']),
    ('Moody', 'moody', 'Dark, atmospheric, and moody lighting', mood_id, false, ARRAY['atmospheric', 'dark', 'mysterious']),
    
    -- Time & Weather Tags
    ('Golden Hour', 'golden-hour', 'Warm golden hour lighting', time_id, true, ARRAY['sunset', 'sunrise', 'golden-light']),
    ('Blue Hour', 'blue-hour', 'Twilight blue hour photography', time_id, false, ARRAY['twilight', 'dusk', 'evening']),
    ('Night', 'night', 'Nighttime photography', time_id, true, ARRAY['dark', 'evening', 'nocturnal']),
    ('Stormy', 'stormy', 'Storm clouds and dramatic weather', time_id, false, ARRAY['storm', 'dramatic-weather', 'tempest']),
    ('Clear Sky', 'clear-sky', 'Clear weather conditions', time_id, false, ARRAY['sunny', 'clear', 'bright']),
    
    -- Architecture Tags
    ('Gothic', 'gothic', 'Gothic architectural style', architecture_id, false, ARRAY['cathedral', 'medieval', 'pointed-arch']),
    ('Modern', 'modern', 'Contemporary modern architecture', architecture_id, true, ARRAY['contemporary', 'sleek', 'glass']),
    ('Industrial', 'industrial', 'Industrial architecture and spaces', architecture_id, false, ARRAY['factory', 'warehouse', 'steel']),
    ('Historic', 'historic', 'Historical buildings and structures', architecture_id, false, ARRAY['heritage', 'old', 'traditional']),
    ('Skyscraper', 'skyscraper', 'High-rise buildings and towers', architecture_id, true, ARRAY['tower', 'high-rise', 'tall-building']),
    
    -- Usage Context Tags
    ('Commercial Use', 'commercial-use', 'Suitable for commercial applications', usage_id, true, ARRAY['business', 'marketing', 'advertising']),
    ('VR Experience', 'vr-experience', 'Perfect for VR and immersive experiences', usage_id, true, ARRAY['virtual-tour', 'immersive', 'vr-app']),
    ('Real Estate', 'real-estate', 'Ideal for real estate and property marketing', usage_id, false, ARRAY['property', 'home', 'listing']),
    ('Gaming', 'gaming', 'Suitable for game development and environments', usage_id, false, ARRAY['game-dev', 'environment', 'texture']),
    ('Education', 'education', 'Educational and training applications', usage_id, false, ARRAY['learning', 'training', 'academic'])
    
    ON CONFLICT (name) DO NOTHING;
END $$;

-- Create function to automatically suggest tags based on image metadata
CREATE OR REPLACE FUNCTION suggest_tags_for_image(
    image_title TEXT,
    image_description TEXT,
    category_name TEXT DEFAULT NULL
) RETURNS TEXT[] AS $$
DECLARE
    suggested_tags TEXT[] := '{}';
    title_lower TEXT := LOWER(image_title);
    desc_lower TEXT := LOWER(COALESCE(image_description, ''));
    combined_text TEXT := title_lower || ' ' || desc_lower;
BEGIN
    -- Technical format tags based on category
    IF category_name = 'equirectangular' THEN
        suggested_tags := array_append(suggested_tags, '360°');
        suggested_tags := array_append(suggested_tags, 'VR Ready');
    ELSIF category_name = 'fisheye' THEN
        suggested_tags := array_append(suggested_tags, 'Fisheye');
    END IF;
    
    -- Subject matter detection
    IF combined_text ~ '(landscape|scenery|vista)' THEN
        suggested_tags := array_append(suggested_tags, 'Landscape');
    END IF;
    
    IF combined_text ~ '(building|architecture|structure)' THEN
        suggested_tags := array_append(suggested_tags, 'Architecture');
    END IF;
    
    IF combined_text ~ '(interior|indoor|room|inside)' THEN
        suggested_tags := array_append(suggested_tags, 'Interior');
    END IF;
    
    IF combined_text ~ '(nature|natural|wilderness)' THEN
        suggested_tags := array_append(suggested_tags, 'Nature');
    END IF;
    
    IF combined_text ~ '(city|urban|downtown|metropolitan)' THEN
        suggested_tags := array_append(suggested_tags, 'Urban');
    END IF;
    
    -- Environment detection
    IF combined_text ~ '(ocean|sea|water|marine)' THEN
        suggested_tags := array_append(suggested_tags, 'Ocean');
    END IF;
    
    IF combined_text ~ '(mountain|alpine|peak|summit)' THEN
        suggested_tags := array_append(suggested_tags, 'Mountain');
    END IF;
    
    IF combined_text ~ '(forest|woods|trees|woodland)' THEN
        suggested_tags := array_append(suggested_tags, 'Forest');
    END IF;
    
    IF combined_text ~ '(beach|coast|shore|tropical)' THEN
        suggested_tags := array_append(suggested_tags, 'Beach');
    END IF;
    
    IF combined_text ~ '(sky|clouds|atmosphere)' THEN
        suggested_tags := array_append(suggested_tags, 'Sky');
    END IF;
    
    -- Time and weather detection
    IF combined_text ~ '(sunset|sunrise|golden.hour)' THEN
        suggested_tags := array_append(suggested_tags, 'Golden Hour');
    END IF;
    
    IF combined_text ~ '(night|dark|evening)' THEN
        suggested_tags := array_append(suggested_tags, 'Night');
    END IF;
    
    IF combined_text ~ '(storm|dramatic.weather)' THEN
        suggested_tags := array_append(suggested_tags, 'Stormy');
    END IF;
    
    -- Architecture styles
    IF combined_text ~ '(gothic|cathedral|medieval)' THEN
        suggested_tags := array_append(suggested_tags, 'Gothic');
    END IF;
    
    IF combined_text ~ '(modern|contemporary|glass)' THEN
        suggested_tags := array_append(suggested_tags, 'Modern');
    END IF;
    
    IF combined_text ~ '(skyscraper|tower|high.rise)' THEN
        suggested_tags := array_append(suggested_tags, 'Skyscraper');
    END IF;
    
    -- Remove duplicates and return
    RETURN ARRAY(SELECT DISTINCT unnest(suggested_tags));
END;
$$ LANGUAGE plpgsql;

-- Create function to migrate existing array tags to new system
CREATE OR REPLACE FUNCTION migrate_existing_tags() RETURNS INTEGER AS $$
DECLARE
    image_record RECORD;
    tag_name TEXT;
    tag_record RECORD;
    migrated_count INTEGER := 0;
BEGIN
    -- Loop through all images with existing tags
    FOR image_record IN 
        SELECT id, title, description, tags, category_id
        FROM images 
        WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
    LOOP
        -- Loop through each tag in the image's tag array
        FOREACH tag_name IN ARRAY image_record.tags
        LOOP
            -- Find matching tag in new tags table (case insensitive)
            SELECT * INTO tag_record 
            FROM tags 
            WHERE LOWER(name) = LOWER(tag_name) 
               OR tag_name = ANY(synonyms)
            LIMIT 1;
            
            -- If tag exists, create relationship
            IF tag_record.id IS NOT NULL THEN
                INSERT INTO image_tags (image_id, tag_id, source)
                VALUES (image_record.id, tag_record.id, 'migration')
                ON CONFLICT (image_id, tag_id) DO NOTHING;
                
                -- Update usage count
                UPDATE tags 
                SET usage_count = usage_count + 1 
                WHERE id = tag_record.id;
                
                migrated_count := migrated_count + 1;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_category_id ON tags(category_id);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(active);
CREATE INDEX IF NOT EXISTS idx_tags_featured ON tags(is_featured);
CREATE INDEX IF NOT EXISTS idx_image_tags_image_id ON image_tags(image_id);
CREATE INDEX IF NOT EXISTS idx_image_tags_tag_id ON image_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_image_tags_source ON image_tags(source);

-- Create GIN indexes for array operations
CREATE INDEX IF NOT EXISTS idx_tags_synonyms ON tags USING GIN (synonyms);
CREATE INDEX IF NOT EXISTS idx_tags_related ON tags USING GIN (related_tags);

-- Enable RLS on new tables
ALTER TABLE tag_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active tag categories" ON tag_categories FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage tag categories" ON tag_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view active tags" ON tags FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage tags" ON tags FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view image tags" ON image_tags FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage image tags" ON image_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Run migration of existing tags
SELECT migrate_existing_tags() as migrated_tags_count;

-- Update tag usage counts
UPDATE tags SET usage_count = (
    SELECT COUNT(*) FROM image_tags WHERE tag_id = tags.id
);

-- Create updated_at trigger for tags using the function we defined above
CREATE TRIGGER update_tags_updated_at 
    BEFORE UPDATE ON tags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Display summary
SELECT 
    'Enhanced tag classification system created!' as message,
    (SELECT COUNT(*) FROM tag_categories) as tag_categories_count,
    (SELECT COUNT(*) FROM tags) as tags_count,
    (SELECT COUNT(*) FROM image_tag_relationships) as image_tag_relationships_count;
