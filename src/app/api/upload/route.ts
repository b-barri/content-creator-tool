import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD API CALLED ===')
    console.log('Environment check:')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('No file provided in form data')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 })
    }
    
    // Validate file size (25MB limit for OpenAI Whisper)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    
    // Upload to Supabase Storage
    console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type)
    console.log('Using Supabase admin client')
    
    let data, error
    try {
      console.log('Initializing Supabase admin client...')
      const client = supabaseAdmin()
      console.log('Supabase client initialized successfully')
      
      console.log('Attempting upload to "videos" bucket...')
      const result = await client.storage
        .from('videos')
        .upload(fileName, file)
        
      data = result.data
      error = result.error
      console.log('Upload result:', { data, error })
      
      if (error) {
        console.error('Supabase upload error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
        return NextResponse.json({ 
          error: 'Upload failed', 
          details: error.message
        }, { status: 500 })
      }
      
      console.log('Upload successful:', data)
      
    } catch (supabaseError) {
      console.error('Supabase client or upload error:', supabaseError)
      return NextResponse.json({ 
        error: 'Supabase upload failed', 
        details: supabaseError instanceof Error ? supabaseError.message : 'Unknown Supabase error'
      }, { status: 500 })
    }
    
    // Get public URL
    const { data: urlData } = supabaseAdmin().storage
      .from('videos')
      .getPublicUrl(fileName)
    
    return NextResponse.json({
      success: true,
      fileName: data.path,
      url: urlData.publicUrl,
      size: file.size,
      type: file.type
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
