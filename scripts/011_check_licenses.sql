-- Check current licenses in the database
SELECT 'Current licenses:' as info;
SELECT id, name, description, price, active FROM licenses ORDER BY name;

-- Check if there's a default license
SELECT 'Default license check:' as info;
SELECT id, name FROM licenses WHERE name = 'PRO' LIMIT 1;

-- If no PRO license exists, let's see what we have
SELECT 'All active licenses:' as info;
SELECT id, name, description, price FROM licenses WHERE active = true ORDER BY price ASC;
