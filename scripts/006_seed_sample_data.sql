-- Seed sample data for n3urali.art e-commerce site

-- Insert sample equirectangular and fisheye images
INSERT INTO public.images (title, description, category, price, file_url, preview_url, watermarked_preview_url, metadata, dimensions, file_size, tags, is_featured) VALUES
('Urban Skyline 360°', 'Stunning 360-degree view of a modern city skyline at golden hour, perfect for VR environments and architectural visualization.', 'equirectangular', 49.99, '/urban-skyline-360-degree-view.png', '/urban-skyline-preview.png', '/urban-skyline-thumbnail.png', '{"camera": "Canon EOS R5", "lens": "8-15mm fisheye", "settings": "f/8, 1/125s, ISO 100"}', '8192x4096', 25600000, ARRAY['urban', 'skyline', 'city', 'architecture', 'golden hour'], true),

('Forest Canopy Fisheye', 'Immersive fisheye view looking up through a dense forest canopy, ideal for nature documentaries and environmental projects.', 'fisheye', 39.99, '/forest-canopy-fisheye-view.png', '/forest-canopy-preview.png', '/forest-canopy-thumbnail.png', '{"camera": "Nikon D850", "lens": "8mm fisheye", "settings": "f/11, 1/60s, ISO 200"}', '4096x4096', 18400000, ARRAY['forest', 'nature', 'canopy', 'trees', 'environment'], true),

('Ocean Horizon 360°', 'Breathtaking 360-degree ocean view with dramatic clouds and endless horizon, perfect for meditation apps and virtual travel.', 'equirectangular', 54.99, '/placeholder.svg?height=400&width=800', '/placeholder.svg?height=300&width=600', '/placeholder.svg?height=150&width=300', '{"camera": "Sony A7R IV", "lens": "8-15mm fisheye", "settings": "f/16, 1/250s, ISO 100"}', '8192x4096', 28800000, ARRAY['ocean', 'horizon', 'clouds', 'seascape', 'meditation'], false),

('Industrial Interior Fisheye', 'Wide-angle fisheye perspective of a modern industrial space with dramatic lighting and architectural details.', 'fisheye', 44.99, '/placeholder.svg?height=400&width=400', '/placeholder.svg?height=300&width=300', '/placeholder.svg?height=150&width=150', '{"camera": "Canon EOS 5D Mark IV", "lens": "15mm fisheye", "settings": "f/8, 1/30s, ISO 400"}', '4096x4096', 20200000, ARRAY['industrial', 'interior', 'architecture', 'lighting', 'modern'], false),

('Mountain Peak 360°', 'Spectacular 360-degree view from a mountain summit with panoramic alpine scenery and dramatic sky.', 'equirectangular', 59.99, '/placeholder.svg?height=400&width=800', '/placeholder.svg?height=300&width=600', '/placeholder.svg?height=150&width=300', '{"camera": "Fujifilm X-T4", "lens": "8-16mm", "settings": "f/11, 1/125s, ISO 200"}', '8192x4096', 31200000, ARRAY['mountain', 'alpine', 'summit', 'landscape', 'adventure'], true)

ON CONFLICT DO NOTHING;
