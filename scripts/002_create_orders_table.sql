-- Create orders table for purchase tracking
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  customer_name VARCHAR(255),
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders (users can only see their own orders)
CREATE POLICY "orders_select_own" ON public.orders 
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');
CREATE POLICY "orders_insert_own" ON public.orders 
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');
CREATE POLICY "orders_update_own" ON public.orders 
  FOR UPDATE USING (user_email = auth.jwt() ->> 'email');

-- Allow authenticated users (admins) to see all orders
CREATE POLICY "orders_admin_access" ON public.orders 
  FOR ALL TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON public.orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
