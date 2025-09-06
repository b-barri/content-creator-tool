import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CHUNKED UPLOAD API CALLED ===')
    
    const formData = await request.formData()
    const chunk = formData.get('chunk') as File
    const fileName = formData.get('fileName') as string
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const totalChunks = parseInt(formData.get('totalChunks') as string)
    
    if (!chunk || !fileName || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Upload chunk to Supabase with a unique name
    const chunkFileName = `${fileName}.chunk.${chunkIndex}`
    
    console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} for ${fileName}`)
    
    const client = supabaseAdmin()
    const { data, error } = await client.storage
      .from('videos')
      .upload(chunkFileName, chunk)
    
    if (error) {
      console.error('Chunk upload error:', error)
      return NextResponse.json({ 
        error: 'Chunk upload failed', 
        details: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      chunkFileName: data.path
    })
    
  } catch (error) {
    console.error('Chunked upload error:', error)
    return NextResponse.json({ 
      error: 'Chunked upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
