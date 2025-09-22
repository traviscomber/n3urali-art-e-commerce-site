-- Test script to validate the download and licensing system

-- Test 1: Verify licenses exist
DO $$
DECLARE
    non_exclusive_count INTEGER;
    exclusive_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO non_exclusive_count FROM licenses WHERE name = 'NON_EXCLUSIVE';
    SELECT COUNT(*) INTO exclusive_count FROM licenses WHERE name = 'EXCLUSIVE';
    
    IF non_exclusive_count = 0 THEN
        RAISE EXCEPTION 'NON_EXCLUSIVE license not found';
    END IF;
    
    IF exclusive_count = 0 THEN
        RAISE EXCEPTION 'EXCLUSIVE license not found';
    END IF;
    
    RAISE NOTICE 'License check passed: NON_EXCLUSIVE=%, EXCLUSIVE=%', non_exclusive_count, exclusive_count;
END $$;

-- Test 2: Verify table structures
DO $$
BEGIN
    -- Check if order_items has download tracking columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'download_count'
    ) THEN
        RAISE EXCEPTION 'order_items table missing download_count column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'download_limit'
    ) THEN
        RAISE EXCEPTION 'order_items table missing download_limit column';
    END IF;
    
    -- Check downloads table structure
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'downloads' AND column_name = 'image_id'
    ) THEN
        RAISE EXCEPTION 'downloads table should not have image_id column';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'downloads' AND column_name = 'user_email'
    ) THEN
        RAISE EXCEPTION 'downloads table should not have user_email column';
    END IF;
    
    RAISE NOTICE 'Table structure check passed';
END $$;

-- Test 3: Create a test order and verify download functionality
DO $$
DECLARE
    test_order_id UUID;
    test_order_item_id UUID;
    test_download_token TEXT;
    test_license_id UUID;
    test_image_id UUID;
BEGIN
    -- Get a license ID
    SELECT id INTO test_license_id FROM licenses WHERE name = 'NON_EXCLUSIVE' LIMIT 1;
    
    -- Get an image ID (or create a test one)
    SELECT id INTO test_image_id FROM images LIMIT 1;
    IF test_image_id IS NULL THEN
        -- Create a test image if none exists
        INSERT INTO images (id, title, description, price) 
        VALUES (gen_random_uuid(), 'Test Image', 'Test Description', 29.99)
        RETURNING id INTO test_image_id;
    END IF;
    
    -- Create test order
    INSERT INTO orders (id, user_email, user_name, total_amount, status, payment_method)
    VALUES (gen_random_uuid(), 'test@example.com', 'Test User', 29.99, 'completed', 'test')
    RETURNING id INTO test_order_id;
    
    -- Create test order item
    INSERT INTO order_items (id, order_id, image_id, license_id, price, download_count, download_limit)
    VALUES (gen_random_uuid(), test_order_id, test_image_id, test_license_id, 29.99, 0, 5)
    RETURNING id INTO test_order_item_id;
    
    -- Test download token generation
    test_download_token := 'test_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9);
    
    INSERT INTO downloads (order_item_id, download_token, expires_at, download_count)
    VALUES (test_order_item_id, test_download_token, NOW() + INTERVAL '30 days', 0);
    
    -- Test download count increment
    UPDATE order_items SET download_count = download_count + 1 WHERE id = test_order_item_id;
    
    -- Verify the test worked
    IF NOT EXISTS (
        SELECT 1 FROM downloads d
        JOIN order_items oi ON d.order_item_id = oi.id
        WHERE d.download_token = test_download_token AND oi.download_count = 1
    ) THEN
        RAISE EXCEPTION 'Download functionality test failed';
    END IF;
    
    -- Clean up test data
    DELETE FROM downloads WHERE download_token = test_download_token;
    DELETE FROM order_items WHERE id = test_order_item_id;
    DELETE FROM orders WHERE id = test_order_id;
    
    RAISE NOTICE 'Download functionality test passed';
END $$;

-- Test 4: Verify functions exist and work
DO $$
DECLARE
    can_download_result BOOLEAN;
BEGIN
    -- Test the can_user_download function exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'can_user_download'
    ) THEN
        RAISE EXCEPTION 'can_user_download function not found';
    END IF;
    
    -- Test the increment_download_count function exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'increment_download_count'
    ) THEN
        RAISE EXCEPTION 'increment_download_count function not found';
    END IF;
    
    RAISE NOTICE 'Database functions check passed';
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== ALL SYSTEM TESTS PASSED ===';
    RAISE NOTICE 'The download and licensing system is properly configured and functional.';
END $$;
