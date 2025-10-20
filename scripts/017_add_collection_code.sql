-- Add code field to collections table for better organization
ALTER TABLE collections ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;

-- Create index for code lookups
CREATE INDEX IF NOT EXISTS idx_collections_code ON collections(code);

-- Update RLS policy to allow lookup by code
DROP POLICY IF EXISTS "Public can view active collections" ON collections;
CREATE POLICY "Public can view active collections"
  ON collections FOR SELECT
  USING (is_active = true);

-- Add comment
COMMENT ON COLUMN collections.code IS 'Unique collection code (e.g., NAT-001, ARCH-001) for easy reference and organization';
