import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD COMPLETE API CALLED ===')
    
    const { fileName, totalChunks } = await request.json()
    
    if (!fileName || !totalChunks) {
      return NextResponse.json({ error: 'Missing fileName or totalChunks' }, { status: 400 })
    }
    
    console.log(`Reassembling ${totalChunks} chunks for ${fileName}`)
    
    const client = supabaseAdmin()
    
    // Download all chunks
    const chunks: ArrayBuffer[] = []
    for (let i = 0; i < totalChunks; i++) {
      const chunkFileName = `${fileName}.chunk.${i}`
      const { data: chunkData, error: downloadError } = await client.storage
        .from('videos')
        .download(chunkFileName)
      
      if (downloadError) {
        console.error(`Failed to download chunk ${i}:`, downloadError)
        return NextResponse.json({ 
          error: 'Failed to download chunk', 
          details: downloadError.message
        }, { status: 500 })
      }
      
      const arrayBuffer = await chunkData.arrayBuffer()
      chunks.push(arrayBuffer)
    }
    
    // Combine chunks
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
    const combinedBuffer = new Uint8Array(totalSize)
    let offset = 0
    
    for (const chunk of chunks) {
      combinedBuffer.set(new Uint8Array(chunk), offset)
      offset += chunk.byteLength
    }
    
    // Upload combined file
    const blob = new Blob([combinedBuffer])
    const { data: uploadData, error: uploadError } = await client.storage
      .from('videos')
      .upload(fileName, blob)
    
    if (uploadError) {
      console.error('Combined file upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Combined file upload failed', 
        details: uploadError.message
      }, { status: 500 })
    }
    
    // Clean up chunks
    for (let i = 0; i < totalChunks; i++) {
      const chunkFileName = `${fileName}.chunk.${i}`
      await client.storage.from('videos').remove([chunkFileName])
    }
    
    // Get public URL
    const { data: urlData } = client.storage
      .from('videos')
      .getPublicUrl(fileName)
    
    return NextResponse.json({
      success: true,
      fileName: uploadData.path,
      url: urlData.publicUrl,
      size: totalSize
    })
    
  } catch (error) {
    console.error('Upload complete error:', error)
    return NextResponse.json({ 
      error: 'Upload complete failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
