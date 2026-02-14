-- Fix Function Search Path Mutable warnings in Supabase
-- This migration adds explicit search_path to all functions to improve security and performance

-- Fix: public.update_tag_usage_counts
ALTER FUNCTION public.update_tag_usage_counts() SET search_path = public;

-- Fix: public.update_tag_usage_on_image_tag
ALTER FUNCTION public.update_tag_usage_on_image_tag() SET search_path = public;

-- Fix: public.handle_updated_at
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- Fix: public.update_collections_updated_at
ALTER FUNCTION public.update_collections_updated_at() SET search_path = public;

-- Fix: public.generate_download_token
ALTER FUNCTION public.generate_download_token() SET search_path = public;

-- Fix: public.verify_and_download
ALTER FUNCTION public.verify_and_download(text, uuid) SET search_path = public;

-- Fix: public.get_user_downloads
ALTER FUNCTION public.get_user_downloads(uuid) SET search_path = public;

-- Fix: public.check_download_limit
ALTER FUNCTION public.check_download_limit(uuid) SET search_path = public;

-- Fix: public.increment_download_count
ALTER FUNCTION public.increment_download_count(uuid) SET search_path = public;

-- Fix: public.cleanup_expired_downloads
ALTER FUNCTION public.cleanup_expired_downloads() SET search_path = public;

-- Fix: public.handle_travis_admin_signup
ALTER FUNCTION public.handle_travis_admin_signup(uuid, text) SET search_path = public;

-- Fix: public.get_database_stats
ALTER FUNCTION public.get_database_stats() SET search_path = public;

-- Fix: public.update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
