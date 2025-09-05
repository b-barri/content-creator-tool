-- SAFE DATABASE FIX - Run this in Supabase SQL Editor
-- This handles existing policies and constraints safely

-- 1. Add missing updated_at column to generated_content table (if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='generated_content' AND column_name='updated_at'
    ) THEN
        ALTER TABLE generated_content 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Create sample_descriptions table (if not exists)
CREATE TABLE IF NOT EXISTS sample_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  category TEXT,
  performance_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_sample_descriptions_category ON sample_descriptions(category);
CREATE INDEX IF NOT EXISTS idx_sample_descriptions_created_at ON sample_descriptions(created_at);

-- 4. Enable RLS (safe to run multiple times)
ALTER TABLE sample_descriptions ENABLE ROW LEVEL SECURITY;

-- 5. Drop and recreate policy to avoid conflicts
DROP POLICY IF EXISTS "Allow public access to sample_descriptions" ON sample_descriptions;
CREATE POLICY "Allow public access to sample_descriptions" ON sample_descriptions FOR ALL USING (true);

-- 6. Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS update_sample_descriptions_updated_at ON sample_descriptions;
CREATE TRIGGER update_sample_descriptions_updated_at 
    BEFORE UPDATE ON sample_descriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Create trigger for generated_content updated_at (if not exists)
DROP TRIGGER IF EXISTS update_generated_content_updated_at ON generated_content;
CREATE TRIGGER update_generated_content_updated_at 
    BEFORE UPDATE ON generated_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Ensure generated_content has proper structure without dropping data
-- Add missing columns if they don't exist
DO $$ 
BEGIN 
    -- Check and add generated_description column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='generated_content' AND column_name='generated_description'
    ) THEN
        ALTER TABLE generated_content ADD COLUMN generated_description TEXT;
    END IF;
    
    -- Check and add selected_title column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='generated_content' AND column_name='selected_title'
    ) THEN
        ALTER TABLE generated_content ADD COLUMN selected_title TEXT;
    END IF;
END $$;
