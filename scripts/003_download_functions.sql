-- Database functions for download management

-- Function to generate secure download token
CREATE OR REPLACE FUNCTION generate_download_token(order_item_id_param INTEGER)
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  expiry_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate a secure random token
  token := encode(gen_random_bytes(32), 'base64');
  
  -- Set expiry time to 24 hours from now
  expiry_time := NOW() + INTERVAL '24 hours';
  
  -- Insert download record
  INSERT INTO downloads (order_item_id, download_token, expires_at)
  VALUES (order_item_id_param, token, expiry_time);
  
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify download token and increment count
CREATE OR REPLACE FUNCTION verify_and_download(token_param TEXT)
RETURNS TABLE(
  valid BOOLEAN,
  order_item_id INTEGER,
  image_id INTEGER,
  file_url TEXT,
  remaining_downloads INTEGER
) AS $$
DECLARE
  download_record RECORD;
  order_item_record RECORD;
  image_record RECORD;
BEGIN
  -- Check if token exists and is not expired
  SELECT * INTO download_record
  FROM downloads 
  WHERE download_token = token_param 
  AND expires_at > NOW()
  AND downloaded_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::INTEGER, NULL::INTEGER, NULL::TEXT, NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Get order item details
  SELECT * INTO order_item_record
  FROM order_items 
  WHERE id = download_record.order_item_id
  AND download_count < download_limit;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::INTEGER, NULL::INTEGER, NULL::TEXT, NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Get image details
  SELECT * INTO image_record
  FROM images 
  WHERE id = order_item_record.image_id;
  
  -- Mark download as used and increment count
  UPDATE downloads 
  SET downloaded_at = NOW()
  WHERE download_token = token_param;
  
  UPDATE order_items 
  SET download_count = download_count + 1
  WHERE id = download_record.order_item_id;
  
  -- Return success with details
  RETURN QUERY SELECT 
    TRUE,
    order_item_record.id,
    image_record.id,
    image_record.file_url,
    (order_item_record.download_limit - order_item_record.download_count - 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's download history
CREATE OR REPLACE FUNCTION get_user_downloads(user_email_param TEXT)
RETURNS TABLE(
  order_id INTEGER,
  image_title TEXT,
  license_type TEXT,
  download_count INTEGER,
  download_limit INTEGER,
  order_date TIMESTAMP WITH TIME ZONE,
  can_download BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    i.title,
    oi.license_type,
    oi.download_count,
    oi.download_limit,
    o.created_at,
    (oi.download_count < oi.download_limit AND o.status = 'completed') as can_download
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  JOIN images i ON oi.image_id = i.id
  WHERE o.user_email = user_email_param
  AND o.status = 'completed'
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
