// Quick local test for Supabase connection using our SSL bypass
require('dotenv').config({ path: '.env.local' });

async function testSupabase() {
  console.log('=== TESTING SUPABASE CONNECTION WITH SSL BYPASS ===');
  console.log('Environment variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...');
  }
  
  try {
    // Set SSL bypass globally
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const { createClient } = require('@supabase/supabase-js');
    const https = require('https');
    
    // Create custom fetch with SSL bypass
    const customFetch = async (url, options) => {
      const originalAgent = https.globalAgent;
      https.globalAgent = new https.Agent({
        rejectUnauthorized: false
      });
      
      try {
        const response = await fetch(url, options);
        return response;
      } finally {
        https.globalAgent = originalAgent;
      }
    };
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        global: {
          fetch: customFetch
        }
      }
    );
    
    console.log('Supabase client created successfully with SSL bypass');
    
    // Test storage access
    console.log('Testing storage access...');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Storage error:', error);
      return;
    }
    
    console.log('Available buckets:', buckets.map(b => ({ name: b.name, public: b.public })));
    
    const videosBucket = buckets.find(b => b.name === 'videos');
    console.log('Videos bucket exists:', !!videosBucket);
    
    if (!videosBucket) {
      console.log('\n❌ ISSUE FOUND: "videos" bucket does not exist!');
      console.log('Go to your Supabase dashboard → Storage → Create bucket named "videos"');
      console.log('Or run this SQL in Supabase SQL Editor:');
      console.log("INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);");
    } else {
      console.log('\n✅ Videos bucket exists!');
      console.log('Upload should work now!');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSupabase();
