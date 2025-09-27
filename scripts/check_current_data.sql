-- Check current data in all tables
SELECT 'categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 'licenses' as table_name, COUNT(*) as record_count FROM licenses  
UNION ALL
SELECT 'images' as table_name, COUNT(*) as record_count FROM images
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as record_count FROM orders
UNION ALL
SELECT 'order_items' as table_name, COUNT(*) as record_count FROM order_items
UNION ALL
SELECT 'downloads' as table_name, COUNT(*) as record_count FROM downloads
ORDER BY table_name;

-- Show sample data from key tables
SELECT 'CATEGORIES:' as info;
SELECT id, name, description FROM categories LIMIT 5;

SELECT 'LICENSES:' as info;  
SELECT id, name, description FROM licenses LIMIT 5;

SELECT 'IMAGES:' as info;
SELECT id, title, price, active FROM images LIMIT 5;
