-- Ensure categories exist for the upload form
-- This script creates essential categories if they don't exist

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert essential categories
INSERT INTO categories (id, name, description, created_at, updated_at) 
VALUES 
  (gen_random_uuid(), 'equirectangular', 'Full spherical 360° panoramic images perfect for VR and immersive experiences', NOW(), NOW()),
  (gen_random_uuid(), 'fisheye', 'Ultra-wide angle fisheye lens captures for unique perspectives', NOW(), NOW()),
  (gen_random_uuid(), 'nature', 'Stunning natural environments, landscapes, and outdoor photography', NOW(), NOW()),
  (gen_random_uuid(), 'architecture', 'Architectural photography including buildings, structures, and interior spaces', NOW(), NOW()),
  (gen_random_uuid(), 'urban', 'City life, streets, urban environments, and metropolitan scenes', NOW(), NOW()),
  (gen_random_uuid(), 'abstract', 'Abstract and artistic compositions with unique visual elements', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

-- Verify categories were created
SELECT 'Categories populated successfully!' as status;
SELECT id, name, description FROM categories ORDER BY name;

-- Show count
SELECT COUNT(*) as total_categories FROM categories;
