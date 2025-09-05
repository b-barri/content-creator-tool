-- URGENT DATABASE FIX - Run this in Supabase SQL Editor immediately
-- This will fix both the "No transcript available" and description issues

-- 1. Add missing updated_at column to generated_content table
ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create sample_descriptions table
CREATE TABLE IF NOT EXISTS sample_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  category TEXT,
  performance_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_sample_descriptions_category ON sample_descriptions(category);
CREATE INDEX IF NOT EXISTS idx_sample_descriptions_created_at ON sample_descriptions(created_at);

-- 4. Enable RLS
ALTER TABLE sample_descriptions ENABLE ROW LEVEL SECURITY;

-- 5. Create policy
CREATE POLICY "Allow public access to sample_descriptions" ON sample_descriptions FOR ALL USING (true);

-- 6. Create trigger
CREATE TRIGGER update_sample_descriptions_updated_at 
    BEFORE UPDATE ON sample_descriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Fix the generated_content table constraint issue
-- Drop and recreate the table with proper constraints
DROP TABLE IF EXISTS generated_content CASCADE;

CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  generated_titles JSONB,
  generated_description TEXT,
  selected_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_transcript_id ON generated_content(transcript_id);

-- Re-enable RLS
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- Recreate policy
CREATE POLICY "Allow public access to generated_content" ON generated_content FOR ALL USING (true);

-- Recreate trigger
CREATE TRIGGER update_generated_content_updated_at 
    BEFORE UPDATE ON generated_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
