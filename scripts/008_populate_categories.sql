-- Populate Categories for N3urali.art E-commerce Platform
-- This script adds the essential categories needed for the image gallery

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert categories with proper data
INSERT INTO categories (id, name, description, active, created_at, updated_at) 
VALUES 
  (uuid_generate_v4(), 'equirectangular', 'Full spherical 360° panoramic images perfect for VR and immersive experiences', true, NOW(), NOW()),
  (uuid_generate_v4(), 'fisheye', 'Ultra-wide angle fisheye lens captures for unique perspectives and creative compositions', true, NOW(), NOW()),
  (uuid_generate_v4(), 'nature', 'Stunning natural environments, landscapes, and outdoor photography', true, NOW(), NOW()),
  (uuid_generate_v4(), 'architecture', 'Architectural photography including buildings, structures, and interior spaces', true, NOW(), NOW()),
  (uuid_generate_v4(), 'urban', 'City life, streets, urban environments, and metropolitan scenes', true, NOW(), NOW()),
  (uuid_generate_v4(), 'abstract', 'Abstract and artistic compositions with unique visual elements', true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Verify categories were created
SELECT 'Categories populated successfully!' as status;
SELECT id, name, description, active FROM categories ORDER BY name;

-- Show count
SELECT COUNT(*) as total_categories FROM categories WHERE active = true;
