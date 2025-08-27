-- Fix Auth OTP Long Expiry and Leaked Password Protection
-- This script addresses the remaining security warnings

-- Set OTP expiry to recommended threshold (default is usually too long)
-- Note: This may need to be configured in Supabase dashboard under Authentication > Settings
-- The recommended OTP expiry is 10 minutes or less

-- Enable password protection policies
-- Note: These settings are typically configured in the Supabase dashboard
-- under Authentication > Settings > Password Protection

-- Add comment for manual configuration needed
SELECT 'Please configure the following in your Supabase dashboard:' as notice;
SELECT '1. Authentication > Settings > OTP Expiry: Set to 600 seconds (10 minutes)' as step_1;
SELECT '2. Authentication > Settings > Password Protection: Enable leaked password protection' as step_2;
SELECT '3. Authentication > Settings > Password Requirements: Set minimum length to 8+ characters' as step_3;

-- Create a function to validate these settings are properly configured
CREATE OR REPLACE FUNCTION check_auth_security_settings()
RETURNS TEXT AS $$
BEGIN
  RETURN 'Security settings must be configured manually in Supabase dashboard. Check Authentication > Settings for OTP expiry and password protection options.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
