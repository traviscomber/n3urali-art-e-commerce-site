-- Create download_logs table for tracking downloads
CREATE TABLE IF NOT EXISTS public.download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  download_token VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for download_logs table
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for download_logs (users can only see their own download logs)
CREATE POLICY "download_logs_select_own" ON public.download_logs 
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');
CREATE POLICY "download_logs_insert_own" ON public.download_logs 
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Allow authenticated users (admins) to see all download logs
CREATE POLICY "download_logs_admin_access" ON public.download_logs 
  FOR ALL TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_download_logs_order_item_id ON public.download_logs(order_item_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_user_email ON public.download_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_download_logs_downloaded_at ON public.download_logs(downloaded_at DESC);

-- Execute download logs table creation script
