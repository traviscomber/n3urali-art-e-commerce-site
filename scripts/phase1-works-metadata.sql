-- Phase 1: N3uralia360 Foundation
-- Add Works metadata fields to collections and images tables
-- These fields are optional and don't affect existing data

-- Step 1: Add metadata columns to collections table (Works become collections with metadata)
ALTER TABLE collections ADD COLUMN IF NOT EXISTS work_title TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS synopsis TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS cultural_inspiration TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS audience_type TEXT; -- e.g., "General", "Children", "Institutional"
ALTER TABLE collections ADD COLUMN IF NOT EXISTS format_types TEXT[]; -- e.g., ["dome", "vr", "loop", "social"]
ALTER TABLE collections ADD COLUMN IF NOT EXISTS work_status TEXT DEFAULT 'active'; -- active, archived, draft

-- Step 2: Add format and content metadata to images table
ALTER TABLE images ADD COLUMN IF NOT EXISTS content_category TEXT; -- e.g., "film", "environment", "loop", "social_cut"
ALTER TABLE images ADD COLUMN IF NOT EXISTS work_id UUID; -- Links image back to parent work/collection
ALTER TABLE images ADD COLUMN IF NOT EXISTS format_edition TEXT; -- e.g., "Dome Edition", "VR Environment", "Performance Loop"

-- Step 3: Create Works view (groups collections with metadata as "Works")
CREATE OR REPLACE VIEW works AS
SELECT
  collections.id,
  collections.id AS work_id,
  COALESCE(collections.work_title, collections.title) AS title,
  collections.synopsis,
  collections.cultural_inspiration,
  collections.audience_type,
  collections.format_types,
  collections.description,
  collections.code,
  collections.is_active AS active,
  collections.created_at,
  collections.updated_at,
  COUNT(DISTINCT images.id) AS image_count
FROM collections
LEFT JOIN collection_images ON collections.id = collection_images.collection_id
LEFT JOIN images ON collection_images.image_id = images.id
GROUP BY collections.id;

-- Step 4: Create comment documentation
COMMENT ON COLUMN collections.work_title IS 'Main title for this Work (film/environment/experience name)';
COMMENT ON COLUMN collections.synopsis IS 'Short description of the Work for institutional/screening contexts';
COMMENT ON COLUMN collections.cultural_inspiration IS 'Cultural heritage or inspiration source for this Work';
COMMENT ON COLUMN collections.audience_type IS 'Target audience category (General, Children, Institutional, Professional)';
COMMENT ON COLUMN collections.format_types IS 'Available formats for this Work (dome, vr, loop, social)';
COMMENT ON COLUMN images.content_category IS 'Type of content (film, environment, loop, social_cut)';
COMMENT ON COLUMN images.work_id IS 'Reference to parent Work/Collection';
COMMENT ON COLUMN images.format_edition IS 'Edition label describing image format context';

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_images_work_id ON images(work_id);
CREATE INDEX IF NOT EXISTS idx_images_content_category ON images(content_category);
CREATE INDEX IF NOT EXISTS idx_collections_work_title ON collections(work_title);
