-- Add upscaled_url and featured_collection fields to images table
ALTER TABLE public.images
ADD COLUMN IF NOT EXISTS upscaled_url TEXT,
ADD COLUMN IF NOT EXISTS featured_collection BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS image_format TEXT CHECK (image_format IN ('dome', 'equirectangular', 'other'));

-- Create index for faster queries on featured_collection
CREATE INDEX IF NOT EXISTS idx_images_featured_collection ON public.images(featured_collection) WHERE featured_collection = TRUE;

-- Create index for image_format
CREATE INDEX IF NOT EXISTS idx_images_format ON public.images(image_format);

COMMENT ON COLUMN public.images.upscaled_url IS 'URL for the upscaled version of the image, provided after download';
COMMENT ON COLUMN public.images.featured_collection IS 'Whether this image is featured in the Collection tab (max 20 images)';
COMMENT ON COLUMN public.images.image_format IS 'Format type: dome, equirectangular, or other';
