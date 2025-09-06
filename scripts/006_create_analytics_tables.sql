-- Create analytics tables for tracking user behavior and performance

-- Page views tracking
CREATE TABLE IF NOT EXISTS public.analytics_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(500) NOT NULL,
  title VARCHAR(500),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(100),
  -- Fixed foreign key reference from public.users to user_profiles
  user_id INTEGER REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Events tracking (clicks, searches, purchases, etc.)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(100) NOT NULL,
  properties JSONB,
  page VARCHAR(500),
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(100),
  -- Fixed foreign key reference from public.users to user_profiles
  user_id INTEGER REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Performance metrics tracking
CREATE TABLE IF NOT EXISTS public.analytics_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  page VARCHAR(500),
  user_agent TEXT,
  connection_type VARCHAR(50),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Query performance logs (for database monitoring)
CREATE TABLE IF NOT EXISTS public.query_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash VARCHAR(64) NOT NULL,
  query_text TEXT,
  execution_time_ms DECIMAL(10,2) NOT NULL,
  rows_affected INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  endpoint VARCHAR(200),
  -- Fixed foreign key reference from public.users to user_profiles
  user_id INTEGER REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_timestamp ON public.analytics_page_views(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_page ON public.analytics_page_views(page);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_timestamp ON public.analytics_performance(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_metric ON public.analytics_performance(metric_name);
CREATE INDEX IF NOT EXISTS idx_query_performance_timestamp ON public.query_performance_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_query_performance_execution_time ON public.query_performance_logs(execution_time_ms DESC);

-- Enable RLS for analytics tables
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_performance_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics tables (admin access only)
CREATE POLICY "analytics_admin_access" ON public.analytics_page_views FOR ALL TO authenticated USING (true);
CREATE POLICY "analytics_events_admin_access" ON public.analytics_events FOR ALL TO authenticated USING (true);
CREATE POLICY "analytics_performance_admin_access" ON public.analytics_performance FOR ALL TO authenticated USING (true);
CREATE POLICY "query_logs_admin_access" ON public.query_performance_logs FOR ALL TO authenticated USING (true);

-- Allow anonymous users to insert tracking data
CREATE POLICY "analytics_page_views_insert" ON public.analytics_page_views FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "analytics_events_insert" ON public.analytics_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "analytics_performance_insert" ON public.analytics_performance FOR INSERT TO anon WITH CHECK (true);
