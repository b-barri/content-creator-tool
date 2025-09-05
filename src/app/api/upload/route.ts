import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
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
    
    const { data, error } = await supabaseAdmin.storage
      .from('videos')
      .upload(fileName, file)
    
    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ 
        error: 'Upload failed', 
        details: error.message
      }, { status: 500 })
    }
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
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
