import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl) {
      console.error('Missing image URL parameter')
      return new NextResponse('Missing image URL', { status: 400 })
    }
    
    console.log('=== PROXY IMAGE REQUEST ===')
    console.log('Proxying image:', imageUrl)
    
    // Fetch the image from the external URL
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText)
      return new NextResponse('Failed to fetch image', { status: response.status })
    }
    
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    
    console.log('✅ Image fetched successfully')
    console.log('Content-Type:', contentType)
    console.log('Image size:', imageBuffer.byteLength, 'bytes')
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
