import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileId = searchParams.get('fileId')
    const linkId = searchParams.get('linkId')

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Decode the file URL
    let originalUrl: string
    try {
      originalUrl = Buffer.from(fileId, 'base64').toString('utf8')
    } catch {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      )
    }

    // If linkId is provided, check if link is still valid
    if (linkId && linkId !== 'temp') {
      const link = await db.link.findUnique({
        where: { id: linkId }
      })

      if (!link) {
        return NextResponse.json(
          { error: 'Link not found' },
          { status: 404 }
        )
      }

      // Check if link has expired
      if (new Date() > link.expiresAt) {
        return NextResponse.json(
          { error: 'Link has expired' },
          { status: 410 }
        )
      }
    }

    // In a real implementation, you would:
    // 1. Fetch the file from the original source
    // 2. Stream it to the client
    // 3. Handle large files with proper streaming
    
    // For demonstration, we'll redirect to the original URL
    // This allows the browser to download the file directly from the source
    return NextResponse.redirect(originalUrl, 307)
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    )
  }
}
