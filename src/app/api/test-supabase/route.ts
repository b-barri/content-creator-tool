import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('=== TESTING SUPABASE CONNECTION ===')
    console.log('Environment variables check:')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    // Test Supabase client initialization
    console.log('Initializing Supabase admin client...')
    const client = supabaseAdmin()
    console.log('Supabase client initialized successfully')
    
    // Test storage access
    console.log('Testing storage access...')
    const { data: buckets, error: bucketsError } = await client.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Storage list error:', bucketsError)
      return NextResponse.json({
        success: false,
        error: 'Storage access failed',
        details: bucketsError.message,
        buckets: null
      })
    }
    
    console.log('Available buckets:', buckets)
    
    // Check if videos bucket exists
    const videosBucket = buckets?.find((bucket: any) => bucket.name === 'videos')
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      buckets: buckets?.map((b: any) => ({ name: b.name, public: b.public })),
      videosBucketExists: !!videosBucket,
      envVarsSet: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    })
    
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Supabase test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
