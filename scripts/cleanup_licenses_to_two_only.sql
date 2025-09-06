-- Remove all licenses except EXCLUSIVE and NON_EXCLUSIVE
-- First, update any existing images to use one of the two remaining licenses
UPDATE images 
SET license_id = (SELECT id FROM licenses WHERE name = 'NON_EXCLUSIVE' LIMIT 1)
WHERE license_id NOT IN (
    SELECT id FROM licenses WHERE name IN ('EXCLUSIVE', 'NON_EXCLUSIVE')
);

-- Delete all licenses except EXCLUSIVE and NON_EXCLUSIVE
DELETE FROM licenses 
WHERE name NOT IN ('EXCLUSIVE', 'NON_EXCLUSIVE');

-- Verify the remaining licenses
SELECT id, name, description, price, active FROM licenses ORDER BY name;
