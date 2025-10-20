-- Create helper functions for sales analytics

-- Function to get image sales analytics
CREATE OR REPLACE FUNCTION get_image_sales_analytics()
RETURNS TABLE (
  image_id UUID,
  image_title TEXT,
  image_thumbnail TEXT,
  total_sales BIGINT,
  total_revenue NUMERIC,
  pending_orders BIGINT,
  rejected_orders BIGINT,
  completed_orders BIGINT,
  last_sale_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id AS image_id,
    i.title AS image_title,
    i.thumbnail_small_url AS image_thumbnail,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END) AS total_sales,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN oi.price ELSE 0 END), 0) AS total_revenue,
    COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_orders,
    COUNT(CASE WHEN o.status = 'rejected' THEN 1 END) AS rejected_orders,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END) AS completed_orders,
    MAX(CASE WHEN o.status = 'completed' THEN o.created_at END) AS last_sale_date
  FROM images i
  LEFT JOIN order_items oi ON oi.image_id = i.id
  LEFT JOIN orders o ON o.id = oi.order_id
  GROUP BY i.id, i.title, i.thumbnail_small_url
  HAVING COUNT(oi.id) > 0
  ORDER BY total_revenue DESC, total_sales DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get sales overview
CREATE OR REPLACE FUNCTION get_sales_overview()
RETURNS TABLE (
  total_revenue NUMERIC,
  total_sales BIGINT,
  pending_orders BIGINT,
  rejected_orders BIGINT,
  total_images_sold BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) AS total_revenue,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END) AS total_sales,
    COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_orders,
    COUNT(CASE WHEN o.status = 'rejected' THEN 1 END) AS rejected_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN oi.image_id END) AS total_images_sold
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_image_sales_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_sales_overview() TO authenticated;
