-- Populate categories table with essential data for n3urali.art
-- This script ensures the categories table has the basic categories needed for the platform

-- Insert basic categories if they don't exist
INSERT INTO categories (id, name, slug, description, image_url, active, created_at, updated_at)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '360° Images',
    '360-images',
    'Full 360-degree panoramic images for immersive viewing experiences',
    '/placeholder.svg?height=200&width=300',
    true,
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Fisheye',
    'fisheye',
    'Ultra-wide fisheye lens photographs with unique perspective distortion',
    '/placeholder.svg?height=200&width=300',
    true,
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'VR Ready',
    'vr-ready',
    'Virtual reality optimized images for VR headsets and applications',
    '/placeholder.svg?height=200&width=300',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Verify categories were created
SELECT 'Categories created successfully:' as status;
SELECT id, name, slug, active FROM categories ORDER BY name;
