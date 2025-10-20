-- Create payments system for USDT manual approval
-- This script creates the necessary tables and functions for handling crypto payments

-- Add payment_status column to orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'transaction_hash'
    ) THEN
        ALTER TABLE orders ADD COLUMN transaction_hash TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'approved_by'
    ) THEN
        ALTER TABLE orders ADD COLUMN approved_by UUID REFERENCES profiles(id);
    END IF;
END $$;

-- Create index for faster payment status queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON orders(created_at DESC);

-- Update existing orders to have proper payment status
UPDATE orders 
SET payment_status = CASE 
    WHEN status = 'completed' THEN 'approved'
    WHEN status = 'pending' THEN 'pending'
    ELSE 'pending'
END
WHERE payment_status IS NULL;

COMMENT ON COLUMN orders.payment_status IS 'Payment approval status: pending, approved, rejected';
COMMENT ON COLUMN orders.transaction_hash IS 'USDT transaction hash for verification';
COMMENT ON COLUMN orders.approved_at IS 'Timestamp when payment was approved';
COMMENT ON COLUMN orders.approved_by IS 'Admin user who approved the payment';
