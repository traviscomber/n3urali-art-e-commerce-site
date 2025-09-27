-- Add missing 'active' column to images table
-- This column is used to enable/disable images in the admin interface

ALTER TABLE public.images 
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_images_active ON public.images(active);

-- Update any existing records to be active by default
UPDATE public.images SET active = true WHERE active IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN public.images.active IS 'Whether the image is active and visible in the store';
