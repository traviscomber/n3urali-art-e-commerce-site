-- Create get_database_stats function for admin dashboard
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_images', (SELECT COUNT(*) FROM images),
        'total_categories', (SELECT COUNT(*) FROM categories),
        'total_licenses', (SELECT COUNT(*) FROM licenses WHERE active = true),
        'total_orders', (SELECT COUNT(*) FROM orders),
        'total_downloads', (SELECT COUNT(*) FROM downloads),
        'featured_images', (SELECT COUNT(*) FROM images WHERE is_featured = true),
        'recent_orders', (SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '30 days'),
        'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_database_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_stats() TO service_role;
