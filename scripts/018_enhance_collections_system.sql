-- Enhanced collections system with better constraints and indexes

-- Add unique constraint to collection code
ALTER TABLE collections
ADD CONSTRAINT collections_code_unique UNIQUE (code);

-- Add check constraint for bundle price
ALTER TABLE collections
ADD CONSTRAINT collections_bundle_price_positive CHECK (bundle_price >= 0);

-- Add check constraint for date range
ALTER TABLE collections
ADD CONSTRAINT collections_date_range_valid CHECK (end_date > start_date);

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_collections_code ON collections(code);

-- Create index for active collections queries
CREATE INDEX IF NOT EXISTS idx_collections_active_dates ON collections(is_active, start_date, end_date);

-- Create index for collection images position ordering
CREATE INDEX IF NOT EXISTS idx_collection_images_position ON collection_images(collection_id, position);

-- Add updated_at trigger for collections
CREATE OR REPLACE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collections_updated_at_trigger
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_collections_updated_at();

-- Grant permissions
GRANT ALL ON collections TO authenticated;
GRANT ALL ON collection_images TO authenticated;

COMMENT ON TABLE collections IS 'Curated collections of images with unique codes and bundle pricing';
COMMENT ON COLUMN collections.code IS 'Unique collection code (e.g., NAT-001, ARCH-001)';
COMMENT ON COLUMN collections.bundle_price IS 'Bundle price for purchasing entire collection';
COMMENT ON COLUMN collections.is_auto_curated IS 'Whether collection was automatically curated by system';
