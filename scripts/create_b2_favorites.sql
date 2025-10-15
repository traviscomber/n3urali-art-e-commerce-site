-- Create table for storing Backblaze B2 favorites
CREATE TABLE IF NOT EXISTS public.b2_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_b2_favorites_file_name ON public.b2_favorites(file_name);

-- Enable RLS (Row Level Security)
ALTER TABLE public.b2_favorites ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is admin-only)
CREATE POLICY "Allow all operations on b2_favorites" ON public.b2_favorites
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.b2_favorites TO authenticated;
GRANT ALL ON public.b2_favorites TO service_role;
