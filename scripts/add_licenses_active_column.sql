-- Add active column to licenses table
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Update existing licenses to be active by default
UPDATE licenses SET active = true WHERE active IS NULL;

-- Add index for better performance on active column queries
CREATE INDEX IF NOT EXISTS idx_licenses_active ON licenses(active);
