-- Fix Database Schema Issues
-- Run this in your Supabase SQL Editor

-- 1. Add missing updated_at column to generated_content table
ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create sample_descriptions table
CREATE TABLE IF NOT EXISTS sample_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  category TEXT,
  performance_metrics JSONB, -- views, engagement, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for sample_descriptions
CREATE INDEX IF NOT EXISTS idx_sample_descriptions_category ON sample_descriptions(category);
CREATE INDEX IF NOT EXISTS idx_sample_descriptions_created_at ON sample_descriptions(created_at);

-- 4. Enable RLS for sample_descriptions
ALTER TABLE sample_descriptions ENABLE ROW LEVEL SECURITY;

-- 5. Create policy for sample_descriptions
CREATE POLICY "Allow public access to sample_descriptions" ON sample_descriptions FOR ALL USING (true);

-- 6. Create trigger for sample_descriptions updated_at
CREATE TRIGGER update_sample_descriptions_updated_at 
    BEFORE UPDATE ON sample_descriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
