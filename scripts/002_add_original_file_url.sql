-- Migration: Add original_file_url column to images table
-- Purpose: Store direct Backblaze URLs for high-resolution files that customers can download after purchase

ALTER TABLE images 
ADD COLUMN IF NOT EXISTS original_file_url TEXT;

COMMENT ON COLUMN images.original_file_url IS 'Direct URL to the original high-resolution file (e.g., Backblaze link) for download after purchase';
