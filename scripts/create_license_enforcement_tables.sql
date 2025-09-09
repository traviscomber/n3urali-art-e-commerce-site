-- Create tables for license enforcement and analytics
CREATE TABLE IF NOT EXISTS license_usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    usage_type TEXT NOT NULL CHECK (usage_type IN ('download', 'view', 'share', 'commercial_use')),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing tables for better enforcement
ALTER TABLE download_logs ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true;
ALTER TABLE download_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS download_expires_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_license_usage_analytics_license_id ON license_usage_analytics(license_id);
CREATE INDEX IF NOT EXISTS idx_license_usage_analytics_user_email ON license_usage_analytics(user_email);
CREATE INDEX IF NOT EXISTS idx_license_usage_analytics_created_at ON license_usage_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_download_logs_ip_address ON download_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_download_logs_downloaded_at ON download_logs(downloaded_at);

-- Create function to automatically set download expiration based on license
CREATE OR REPLACE FUNCTION set_download_expiration()
RETURNS TRIGGER AS $$
DECLARE
    license_name TEXT;
    expiration_days INTEGER;
BEGIN
    -- Get license name
    SELECT l.name INTO license_name
    FROM licenses l
    WHERE l.id = NEW.license_id;
    
    -- Set expiration based on license type
    CASE license_name
        WHEN 'PRO' THEN expiration_days := 365;
        WHEN 'PRO+' THEN expiration_days := 730;
        WHEN 'PRO+ Premium' THEN expiration_days := 1095;
        -- EXCLUSIVE licenses don't expire
        ELSE expiration_days := NULL;
    END CASE;
    
    IF expiration_days IS NOT NULL THEN
        NEW.download_expires_at := NOW() + (expiration_days || ' days')::INTERVAL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic expiration setting
DROP TRIGGER IF EXISTS set_download_expiration_trigger ON order_items;
CREATE TRIGGER set_download_expiration_trigger
    BEFORE INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION set_download_expiration();

-- Enable RLS on new table
ALTER TABLE license_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for license usage analytics
CREATE POLICY "Users can view their own license usage" ON license_usage_analytics 
FOR SELECT USING (
    user_email = (SELECT email FROM user_profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can view all license usage" ON license_usage_analytics 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "System can insert license usage" ON license_usage_analytics 
FOR INSERT WITH CHECK (true);

-- Create view for license compliance reporting
CREATE OR REPLACE VIEW license_compliance_report AS
SELECT 
    l.name as license_name,
    COUNT(DISTINCT oi.id) as total_purchases,
    COUNT(DISTINCT lua.id) as total_usage_events,
    COUNT(DISTINCT CASE WHEN lua.usage_type = 'download' THEN lua.id END) as downloads,
    COUNT(DISTINCT CASE WHEN lua.usage_type = 'commercial_use' THEN lua.id END) as commercial_uses,
    AVG(CASE WHEN lua.success THEN 1.0 ELSE 0.0 END) as success_rate,
    COUNT(DISTINCT lua.user_email) as unique_users
FROM licenses l
LEFT JOIN order_items oi ON l.id = oi.license_id
LEFT JOIN license_usage_analytics lua ON l.id = lua.license_id
WHERE l.active = true
GROUP BY l.id, l.name
ORDER BY total_purchases DESC;

-- Grant permissions
GRANT SELECT ON license_compliance_report TO PUBLIC;
GRANT SELECT ON license_usage_analytics TO PUBLIC;
