-- SIMPLE DATABASE FIX - Run this in Supabase SQL Editor
-- This uses simple SQL commands without complex syntax

-- 1. Create sample_descriptions table (safe to run multiple times)
CREATE TABLE IF NOT EXISTS sample_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  category TEXT,
  performance_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_sample_descriptions_category ON sample_descriptions(category);
CREATE INDEX IF NOT EXISTS idx_sample_descriptions_created_at ON sample_descriptions(created_at);

-- 3. Enable RLS (safe to run multiple times)
ALTER TABLE sample_descriptions ENABLE ROW LEVEL SECURITY;

-- 4. Drop and recreate policy (safe approach)
DROP POLICY IF EXISTS "Allow public access to sample_descriptions" ON sample_descriptions;
CREATE POLICY "Allow public access to sample_descriptions" ON sample_descriptions FOR ALL USING (true);

-- 5. Drop and recreate trigger (safe approach)
DROP TRIGGER IF EXISTS update_sample_descriptions_updated_at ON sample_descriptions;
CREATE TRIGGER update_sample_descriptions_updated_at 
    BEFORE UPDATE ON sample_descriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Add missing columns to generated_content (will fail silently if exists)
ALTER TABLE generated_content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE generated_content ADD COLUMN IF NOT EXISTS generated_description TEXT;
ALTER TABLE generated_content ADD COLUMN IF NOT EXISTS selected_title TEXT;

-- 7. Drop and recreate trigger for generated_content
DROP TRIGGER IF EXISTS update_generated_content_updated_at ON generated_content;
CREATE TRIGGER update_generated_content_updated_at 
    BEFORE UPDATE ON generated_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
