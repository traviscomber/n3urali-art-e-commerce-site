-- Create basic tables for the art gallery
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  license_id UUID REFERENCES public.licenses(id),
  price DECIMAL(10,2),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is an art gallery)
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to licenses" ON public.licenses FOR SELECT USING (true);
CREATE POLICY "Allow public read access to images" ON public.images FOR SELECT USING (true);

-- Insert sample data
INSERT INTO public.categories (name, description) VALUES 
  ('Fisheye', 'Fisheye lens photography with unique curved perspectives'),
  ('Portrait', 'Portrait photography capturing human subjects'),
  ('Landscape', 'Natural landscape and scenic photography')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.licenses (name, description) VALUES 
  ('Standard', 'Standard commercial license for general use'),
  ('Extended', 'Extended license for unlimited commercial use'),
  ('Editorial', 'Editorial use only, not for commercial purposes')
ON CONFLICT (name) DO NOTHING;

-- Insert sample images
INSERT INTO public.images (title, description, file_path, category_id, license_id, price, is_featured)
SELECT 
  'Sample Fisheye Art',
  'A stunning fisheye perspective artwork',
  '/placeholder.svg?height=400&width=600',
  c.id,
  l.id,
  29.99,
  true
FROM public.categories c, public.licenses l
WHERE c.name = 'Fisheye' AND l.name = 'Standard'
ON CONFLICT DO NOTHING;
