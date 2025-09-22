-- Add missing columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'demo',
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Add missing columns to downloads table  
ALTER TABLE downloads
ADD COLUMN IF NOT EXISTS download_token TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_downloads_expires ON downloads(expires_at);
