-- SQL script to document the folder structure for high-quality uploads
-- This is for documentation purposes - the actual folders are created by the Node.js code

-- Folder structure created:
-- /public/uploads/
-- ├── high-quality/
-- │   ├── equirectangular/
-- │   ├── fisheye/
-- │   └── [other-categories]/
-- └── thumbnails/

-- High-quality images are stored as files with paths in the database
-- instead of base64 strings to preserve quality and reduce database size

SELECT 'High-quality upload system initialized' as status;
