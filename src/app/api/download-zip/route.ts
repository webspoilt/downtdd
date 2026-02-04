import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'

interface FileRequest {
  name: string
  size: string
  url: string
  isVideo?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { files, linkId } = body

    // Validate input
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Check link expiration if linkId is provided
    if (linkId && linkId !== 'temp') {
      const { db } = await import('@/lib/db')
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

    // Create a new ZIP file
    const zip = new JSZip()

    // Add each file to the ZIP
    for (const file of files) {
      try {
        // In a real implementation, you would fetch the actual file content
        // For demonstration, we'll create a placeholder file with metadata
        const fileContent = createPlaceholderContent(file)
        zip.file(file.name, fileContent)
      } catch (error) {
        console.error(`Error adding file ${file.name} to ZIP:`, error)
        // Continue with other files even if one fails
      }
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })

    // Create a response with the ZIP file
    const zipName = `download-${Date.now()}.zip`

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('ZIP download error:', error)
    return NextResponse.json(
      { error: 'Failed to create ZIP file' },
      { status: 500 }
    )
  }
}

// Helper function to create placeholder file content
// In a real implementation, you would fetch the actual file from the URL
function createPlaceholderContent(file: FileRequest): Buffer {
  const metadata = {
    filename: file.name,
    size: file.size,
    sourceUrl: file.url,
    type: file.isVideo ? 'video' : 'file',
    description: 'This is a placeholder file. In a production environment, this would contain the actual file content.',
    downloadedAt: new Date().toISOString(),
  }

  // Create a text file with metadata
  const content = JSON.stringify(metadata, null, 2)
  return Buffer.from(content, 'utf-8')
}
