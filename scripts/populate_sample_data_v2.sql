-- Clear existing data to avoid duplicates
DELETE FROM images;
DELETE FROM categories;
DELETE FROM licenses;

-- Insert categories (only columns that exist: id, name, description, created_at)
INSERT INTO categories (id, name, description, created_at) VALUES
(1, 'Equirectangular', '360-degree panoramic images in equirectangular projection', NOW()),
(2, 'Fisheye', '180-degree fisheye lens photography', NOW());

-- Insert licenses (only columns that exist: id, name, description, price, created_at)
INSERT INTO licenses (id, name, description, price, created_at) VALUES
(1, 'Standard', 'Standard commercial license for web and print use', 29.99, NOW()),
(2, 'Extended', 'Extended license for unlimited commercial use', 79.99, NOW()),
(3, 'Exclusive', 'Exclusive rights with image removal from store', 299.99, NOW());

-- Insert sample images with working Unsplash URLs (using correct column names)
INSERT INTO images (
  id, title, description, price, category_id, 
  original_url, thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url,
  file_path, file_size, dimensions, created_at
) VALUES
(1, 'Ocean Waves 360°', 'Stunning 360-degree view of ocean waves crashing on a pristine beach', 49.99, 1,
 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=4096&h=2048&fit=crop',
 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=200&fit=crop',
 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=400&fit=crop',
 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=600&fit=crop',
 'ocean-waves-360.jpg', 25000000, '4096x2048', NOW()),

(2, 'Mountain Peak Summit 360°', 'Breathtaking panoramic view from a mountain summit', 59.99, 1,
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=4096&h=2048&fit=crop',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
 'mountain-peak-360.jpg', 28000000, '4096x2048', NOW()),

(3, 'Forest Path Fisheye', 'Immersive fisheye view of a forest trail', 39.99, 2,
 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2048&h=2048&fit=crop',
 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop',
 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=1200&fit=crop',
 'forest-path-fisheye.jpg', 18000000, '2048x2048', NOW()),

(4, 'Desert Landscape 360°', 'Expansive 360-degree desert vista with dramatic rock formations', 54.99, 1,
 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=4096&h=2048&fit=crop',
 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=200&fit=crop',
 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop',
 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=600&fit=crop',
 'desert-landscape-360.jpg', 26000000, '4096x2048', NOW()),

(5, 'Urban Skyline Fisheye', 'Dynamic fisheye perspective of city skyline', 44.99, 2,
 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2048&h=2048&fit=crop',
 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop',
 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=800&fit=crop',
 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=1200&fit=crop',
 'urban-skyline-fisheye.jpg', 22000000, '2048x2048', NOW());
