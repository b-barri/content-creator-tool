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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create thumbnails table
CREATE TABLE IF NOT EXISTS thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transcriptions_video_url ON transcriptions(video_url);
CREATE INDEX IF NOT EXISTS idx_transcriptions_status ON transcriptions(status);
CREATE INDEX IF NOT EXISTS idx_transcriptions_created_at ON transcriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_content_transcript_id ON generated_content(transcript_id);
CREATE INDEX IF NOT EXISTS idx_thumbnails_transcript_id ON thumbnails(transcript_id);

-- Enable Row Level Security (RLS)
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE thumbnails ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public access to transcriptions" ON transcriptions FOR ALL USING (true);
CREATE POLICY "Allow public access to generated_content" ON generated_content FOR ALL USING (true);
CREATE POLICY "Allow public access to thumbnails" ON thumbnails FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transcriptions_updated_at 
    BEFORE UPDATE ON transcriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
