-- Clear All Database Data Script
-- This script will delete all e-commerce related data in the correct order
-- to avoid foreign key constraint violations

-- Start transaction to ensure atomicity
BEGIN;

-- Delete child tables first (tables with foreign keys)
DELETE FROM download_logs;
DELETE FROM downloads;
DELETE FROM image_chunks;
DELETE FROM order_items;

-- Delete parent tables
DELETE FROM orders;
DELETE FROM images;
DELETE FROM categories;
DELETE FROM licenses;

-- Delete backup and migration tables
DELETE FROM image_url_backup;
DELETE FROM images_backup_url_migration;
DELETE FROM chunked_images;

-- Delete user-related data
DELETE FROM email_verification_tokens;
DELETE FROM password_reset_tokens;
DELETE FROM password_reset_attempts;
DELETE FROM user_profiles;

-- Delete auth sync data
DELETE FROM neon_auth.users_sync;

-- Reset any sequences if needed (optional)
-- This ensures IDs start from 1 again for tables with serial columns

-- Commit the transaction
COMMIT;

-- Verify deletion (optional check queries)
SELECT 'orders' as table_name, COUNT(*) as remaining_records FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'images', COUNT(*) FROM images
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'licenses', COUNT(*) FROM licenses
UNION ALL
SELECT 'downloads', COUNT(*) FROM downloads
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles;
