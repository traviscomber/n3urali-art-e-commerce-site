-- Phase 5: Screening Programs Table
CREATE TABLE IF NOT EXISTS screening_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  mood VARCHAR(100),
  target_audience VARCHAR(100),
  duration_minutes INT,
  work_ids TEXT[] NOT NULL, -- Array of work IDs in order
  collection_ids TEXT[] NOT NULL, -- Array of collection IDs
  featured_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE screening_programs ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can view active programs
CREATE POLICY screening_programs_view ON screening_programs
  FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- RLS: Only admins can manage programs
CREATE POLICY screening_programs_admin ON screening_programs
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'travis@nuanu.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'travis@nuanu.com');

-- Create indexes
CREATE INDEX idx_screening_programs_active ON screening_programs(is_active);
CREATE INDEX idx_screening_programs_created_at ON screening_programs(created_at DESC);
