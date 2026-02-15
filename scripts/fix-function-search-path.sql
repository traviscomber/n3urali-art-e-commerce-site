-- Fix Function Search Path Mutable warnings in Supabase
-- Only updating functions that exist in the current schema

-- Fix: public.handle_updated_at (used by tags table trigger)
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- Fix: public.update_collections_updated_at (used by collections trigger)
ALTER FUNCTION public.update_collections_updated_at() SET search_path = public;

-- Fix: public.update_updated_at_column (general purpose updated_at trigger)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
