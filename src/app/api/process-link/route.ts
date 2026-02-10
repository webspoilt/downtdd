import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface FileItem {
  name: string
  size: string
  url: string
  downloadUrl: string
  isVideo?: boolean
}

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Processing link request:', body) // Log incoming request
    const { url, userId } = body

    // Validate input
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Simulate file extraction from link
    // In a real implementation, you would fetch and parse the actual link content
    // This is a demonstrative implementation
    const files = await extractFilesFromUrl(url)

    // Create temporary download links
    const tempLinks: FileItem[] = files.map(file => ({
      ...file,
      downloadUrl: `/api/download?fileId=${Buffer.from(file.url).toString('base64')}&linkId=temp`,
    }))

    // Store link in database with 5-second expiration
    const link = await db.link.create({
      data: {
        originalUrl: url,
        files: tempLinks as any,
        expiresAt: new Date(Date.now() + 5000), // 5 seconds
        userId: userId || null,
      }
    })

    // Schedule deletion after 5 seconds
    setTimeout(async () => {
      try {
        await db.link.delete({
          where: { id: link.id }
        })
        console.log(`Link ${link.id} deleted after expiration`)
      } catch (error) {
        console.error('Error deleting expired link:', error)
      }
    }, 5000)

    return NextResponse.json({
      success: true,
      files: tempLinks,
      expiresIn: 5,
      linkId: link.id
    })
  } catch (error: any) {
    console.error('Process link detailed error:', error)
    // Log stack trace if available
    if (error.stack) console.error(error.stack)

    return NextResponse.json(
      {
        error: 'Failed to process link',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Helper function to extract files from URL
// This is a demonstrative implementation
async function extractFilesFromUrl(url: string): Promise<Omit<FileItem, 'downloadUrl'>[]> {
  // In a real implementation, you would:
  // 1. Fetch the URL content
  // 2. Parse the HTML or API response
  // 3. Extract file information

  // Detect the platform
  const isTerabox = url.includes('terabox.com')
  const isDiskwala = url.includes('diskwala.com')
  const isFolder = url.includes('folder') || url.includes('s/') || url.includes('/share/')

  if (isFolder) {
    // Return multiple files for folder links
    const platform = isTerabox ? 'Terabox' : isDiskwala ? 'Diskwala' : 'Cloud'

    return [
      {
        name: `[${platform}] Movie - Part 1.mp4`,
        size: '850.4 MB',
        url: url,
        isVideo: true,
      },
      {
        name: `[${platform}] Movie - Part 2.mp4`,
        size: '920.7 MB',
        url: url,
        isVideo: true,
      },
      {
        name: `[${platform}] Subtitles.srt`,
        size: '125 KB',
        url: url,
        isVideo: false,
      },
      {
        name: `[${platform}] Movie Info.txt`,
        size: '2.3 KB',
        url: url,
        isVideo: false,
      },
    ]
  } else {
    // Return single file for direct links
    const platform = isTerabox ? 'Terabox' : isDiskwala ? 'Diskwala' : 'Cloud'
    const isVideo = url.includes('video') || url.includes('movie') || url.includes('.mp4') || url.includes('.mkv')

    return [
      {
        name: isVideo
          ? `[${platform}] Video File.mp4`
          : `[${platform}] File.zip`,
        size: isVideo ? '1.2 GB' : '450.5 MB',
        url: url,
        isVideo: isVideo,
      },
    ]
  }
}
