-- Remove Stripe-specific columns from orders table
ALTER TABLE public.orders 
DROP COLUMN IF EXISTS stripe_session_id,
DROP COLUMN IF EXISTS stripe_payment_intent_id;

-- Add crypto payment fields if they don't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'demo',
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);

-- Update existing orders to have proper payment method
UPDATE public.orders 
SET payment_method = 'demo' 
WHERE payment_method IS NULL;

-- Drop old indexes
DROP INDEX IF EXISTS idx_orders_stripe_session;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON public.orders(payment_intent_id);
