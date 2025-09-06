import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST UPLOAD API CALLED ===')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      fileName: file.name,
      size: file.size,
      type: file.type,
      message: 'File received successfully'
    })
    
  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json({ 
      error: 'Test upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
