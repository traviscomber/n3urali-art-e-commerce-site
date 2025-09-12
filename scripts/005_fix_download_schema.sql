-- Fix database schema for download and licensing system

-- Add missing columns to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS download_limit INTEGER DEFAULT 5;

-- Update existing order_items to have proper download limits
UPDATE order_items SET download_limit = 5 WHERE download_limit IS NULL;

-- Drop and recreate downloads table with correct structure
DROP TABLE IF EXISTS downloads CASCADE;

CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  download_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_downloads_order_item ON downloads(order_item_id);

-- Drop and recreate download_logs table with correct structure
DROP TABLE IF EXISTS download_logs CASCADE;

CREATE TABLE download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  download_id UUID NOT NULL REFERENCES downloads(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for download logs
CREATE INDEX IF NOT EXISTS idx_download_logs_download ON download_logs(download_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_user ON download_logs(user_email);
