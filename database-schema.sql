-- Content Creator Tool Database Schema
-- Run this in your Supabase SQL editor

-- Create transcriptions table
CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT NOT NULL,
  transcript TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_content table
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  generated_titles JSONB,
  generated_description TEXT,
  selected_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create thumbnails table
CREATE TABLE IF NOT EXISTS thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sample_titles table for user-provided successful titles
CREATE TABLE IF NOT EXISTS sample_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  performance_metrics JSONB, -- views, engagement, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sample_descriptions table for user-provided successful descriptions
CREATE TABLE IF NOT EXISTS sample_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  category TEXT,
  performance_metrics JSONB, -- views, engagement, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transcriptions_video_url ON transcriptions(video_url);
CREATE INDEX IF NOT EXISTS idx_transcriptions_status ON transcriptions(status);
CREATE INDEX IF NOT EXISTS idx_transcriptions_created_at ON transcriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_content_transcript_id ON generated_content(transcript_id);
CREATE INDEX IF NOT EXISTS idx_thumbnails_transcript_id ON thumbnails(transcript_id);
CREATE INDEX IF NOT EXISTS idx_sample_titles_category ON sample_titles(category);
CREATE INDEX IF NOT EXISTS idx_sample_titles_created_at ON sample_titles(created_at);
CREATE INDEX IF NOT EXISTS idx_sample_descriptions_category ON sample_descriptions(category);
CREATE INDEX IF NOT EXISTS idx_sample_descriptions_created_at ON sample_descriptions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE thumbnails ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_descriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public access to transcriptions" ON transcriptions FOR ALL USING (true);
CREATE POLICY "Allow public access to generated_content" ON generated_content FOR ALL USING (true);
CREATE POLICY "Allow public access to thumbnails" ON thumbnails FOR ALL USING (true);
CREATE POLICY "Allow public access to sample_titles" ON sample_titles FOR ALL USING (true);
CREATE POLICY "Allow public access to sample_descriptions" ON sample_descriptions FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_transcriptions_updated_at 
    BEFORE UPDATE ON transcriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at 
    BEFORE UPDATE ON generated_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sample_titles_updated_at 
    BEFORE UPDATE ON sample_titles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sample_descriptions_updated_at 
    BEFORE UPDATE ON sample_descriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
