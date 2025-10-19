-- Create order_items table for individual items in orders
-- Changed license_type to license_id to match actual schema
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE RESTRICT,
  license_id UUID REFERENCES public.licenses(id),
  price NUMERIC NOT NULL,
  download_count INTEGER DEFAULT 0,
  download_limit INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for order_items (users can only see items from their own orders)
CREATE POLICY "order_items_select_own" ON public.order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_email = auth.jwt() ->> 'email'
    )
  );

-- Allow authenticated users (admins) to see all order items
CREATE POLICY "order_items_admin_access" ON public.order_items 
  FOR ALL TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_image_id ON public.order_items(image_id);
CREATE INDEX IF NOT EXISTS idx_order_items_license_id ON public.order_items(license_id);
