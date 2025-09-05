-- Create table for chunked uploads
CREATE TABLE IF NOT EXISTS image_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_data TEXT NOT NULL, -- base64 chunk data
  chunk_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(image_id, chunk_index)
);

-- Create table for chunked upload metadata
CREATE TABLE IF NOT EXISTS chunked_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_filename VARCHAR(255) NOT NULL,
  total_chunks INTEGER NOT NULL,
  total_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  upload_status VARCHAR(20) DEFAULT 'uploading', -- 'uploading', 'complete', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_image_chunks_image_id ON image_chunks(image_id);
CREATE INDEX IF NOT EXISTS idx_chunked_images_status ON chunked_images(upload_status);
