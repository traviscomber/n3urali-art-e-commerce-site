-- Comprehensive Database Fix Script for Downloads System
-- Fixes missing tables, columns, and relationships for admin downloads functionality

-- 1. Add missing columns to downloads table
ALTER TABLE public.downloads 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 2. Create download_logs table (or rename downloads to download_logs if needed)
-- Since the admin page expects 'download_logs', we'll create it as a view or table
DROP TABLE IF EXISTS public.download_logs;

CREATE TABLE public.download_logs (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL,
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  download_token VARCHAR(255),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Foreign key constraint
  CONSTRAINT fk_download_logs_order_item 
    FOREIGN KEY (order_item_id) 
    REFERENCES public.order_items(id) 
    ON DELETE CASCADE
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_download_logs_user_email ON public.download_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_download_logs_downloaded_at ON public.download_logs(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_download_logs_order_item_id ON public.download_logs(order_item_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_token ON public.download_logs(download_token);

-- 4. Migrate existing data from downloads to download_logs
INSERT INTO public.download_logs (
  order_item_id,
  ip_address,
  user_agent,
  download_token,
  downloaded_at,
  created_at,
  expires_at
)
SELECT 
  order_item_id,
  ip_address,
  user_agent,
  download_token,
  downloaded_at,
  created_at,
  expires_at
FROM public.downloads
ON CONFLICT DO NOTHING;

-- 5. Update download_logs with user_email from orders
UPDATE public.download_logs dl
SET user_email = o.user_email
FROM public.order_items oi
JOIN public.orders o ON oi.order_id = o.id
WHERE dl.order_item_id = oi.id
AND dl.user_email IS NULL;

-- 6. Enable RLS on download_logs
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for download_logs
DROP POLICY IF EXISTS "Users can view own download logs" ON public.download_logs;
DROP POLICY IF EXISTS "Admins can view all download logs" ON public.download_logs;

CREATE POLICY "Users can view own download logs" ON public.download_logs
  FOR SELECT USING (user_email = auth.email());

CREATE POLICY "Admins can view all download logs" ON public.download_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 8. Create a function to log downloads
CREATE OR REPLACE FUNCTION public.log_download(
  p_order_item_id INTEGER,
  p_download_token TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_email TEXT;
  v_download_id INTEGER;
BEGIN
  -- Get user email from order
  SELECT o.user_email INTO v_user_email
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  WHERE oi.id = p_order_item_id;
  
  -- Insert download log
  INSERT INTO public.download_logs (
    order_item_id,
    user_email,
    download_token,
    ip_address,
    user_agent,
    downloaded_at
  ) VALUES (
    p_order_item_id,
    v_user_email,
    p_download_token,
    p_ip_address,
    p_user_agent,
    NOW()
  ) RETURNING id INTO v_download_id;
  
  -- Update download count in order_items
  UPDATE public.order_items 
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = p_order_item_id;
  
  RETURN v_download_id;
END;
$$;

-- 9. Create a function to get download stats
CREATE OR REPLACE FUNCTION public.get_download_stats()
RETURNS TABLE(
  total_downloads BIGINT,
  today_downloads BIGINT,
  unique_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.download_logs WHERE downloaded_at IS NOT NULL) as total_downloads,
    (SELECT COUNT(*) FROM public.download_logs 
     WHERE downloaded_at::date = CURRENT_DATE) as today_downloads,
    (SELECT COUNT(DISTINCT user_email) FROM public.download_logs 
     WHERE user_email IS NOT NULL) as unique_users;
END;
$$;

-- 10. Grant necessary permissions
GRANT SELECT, INSERT ON public.download_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.download_logs_id_seq TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_download TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_download_stats TO authenticated;

-- 11. Create a view for easier admin queries (optional)
CREATE OR REPLACE VIEW public.admin_download_view AS
SELECT 
  dl.id,
  dl.order_item_id,
  dl.user_email,
  dl.ip_address,
  dl.user_agent,
  dl.downloaded_at,
  dl.created_at,
  oi.license_type,
  oi.price,
  i.title as image_title,
  i.category as image_category,
  o.total_amount as order_total
FROM public.download_logs dl
JOIN public.order_items oi ON dl.order_item_id = oi.id
JOIN public.images i ON oi.image_id = i.id
JOIN public.orders o ON oi.order_id = o.id
ORDER BY dl.downloaded_at DESC;

-- Grant access to the view
GRANT SELECT ON public.admin_download_view TO authenticated;

-- 12. Add missing columns to existing tables if needed
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- 13. Update existing order_items download counts
UPDATE public.order_items oi
SET download_count = (
  SELECT COUNT(*) 
  FROM public.download_logs dl 
  WHERE dl.order_item_id = oi.id 
  AND dl.downloaded_at IS NOT NULL
)
WHERE download_count IS NULL OR download_count = 0;

-- 14. Create trigger to automatically log downloads when downloads table is updated
CREATE OR REPLACE FUNCTION public.sync_download_logs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- When a download is marked as downloaded, log it
  IF NEW.downloaded_at IS NOT NULL AND OLD.downloaded_at IS NULL THEN
    PERFORM public.log_download(
      NEW.order_item_id,
      NEW.download_token,
      NEW.ip_address,
      NEW.user_agent
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_download_logs_trigger ON public.downloads;
CREATE TRIGGER sync_download_logs_trigger
  AFTER UPDATE ON public.downloads
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_download_logs();

-- 15. Final verification and cleanup
-- Ensure all foreign key relationships are properly set
ALTER TABLE public.download_logs 
DROP CONSTRAINT IF EXISTS fk_download_logs_order_item;

ALTER TABLE public.download_logs 
ADD CONSTRAINT fk_download_logs_order_item 
FOREIGN KEY (order_item_id) 
REFERENCES public.order_items(id) 
ON DELETE CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Downloads database fix completed successfully!';
  RAISE NOTICE 'Created download_logs table with proper relationships';
  RAISE NOTICE 'Added missing columns and indexes';
  RAISE NOTICE 'Set up RLS policies and functions';
  RAISE NOTICE 'Admin downloads page should now work correctly';
END $$;
