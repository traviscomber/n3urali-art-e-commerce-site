-- Create commissions table for institutional inquiries
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  brief_description TEXT NOT NULL,
  venue_type TEXT,
  target_audience TEXT,
  budget_range TEXT,
  timeline TEXT,
  status TEXT DEFAULT 'pending', -- pending, in-review, quoted, completed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_created_at ON commissions(created_at DESC);
CREATE INDEX idx_commissions_email ON commissions(contact_email);

-- Enable RLS
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can see all commissions
CREATE POLICY "Admins can read commissions"
  ON commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND u.email = 'travis@nuanu.com'
    )
  );

-- Allow anyone to insert (public submissions)
CREATE POLICY "Anyone can submit commissions"
  ON commissions FOR INSERT
  WITH CHECK (true);
