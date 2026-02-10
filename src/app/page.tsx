'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { extractLinks, isSupportedPlatform, detectPlatform } from '@/lib/utils'
import { FileItem, LinkResult, ProcessResult } from '@/types'

// Components
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/home/Hero'
import { LinkProcessor } from '@/components/home/LinkProcessor'
import { ResultsGrid } from '@/components/home/ResultsGrid'
import { MultiLinkResults } from '@/components/home/MultiLinkResults'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { AdBanner } from '@/components/common/AdBanner'
import { VideoPlayerDialog } from '@/components/common/VideoPlayerDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield } from 'lucide-react'

export default function Home() {
  const { toast } = useToast()

  // State
  const [url, setUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [countdown, setCountdown] = useState(5)
  const [results, setResults] = useState<FileItem[]>([])

  // Auth & User State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(false)

  // UI State
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState('')
  const [showAds, setShowAds] = useState(true)
  const [currentLinkId, setCurrentLinkId] = useState('')
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)

  // Multiple links state
  const [multiLinkText, setMultiLinkText] = useState('')
  const [extractedLinks, setExtractedLinks] = useState<string[]>([])
  const [isProcessingMulti, setIsProcessingMulti] = useState(false)
  const [multiLinkResults, setMultiLinkResults] = useState<LinkResult[]>([])
  const [multiProgress, setMultiProgress] = useState(0)

  // Handlers
  const handleProcessLink = async () => {
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid link',
        variant: 'destructive',
      })
      return
    }

    try {
      new URL(url)
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setResults([])
    setCountdown(5)

    try {
      const response = await fetch('/api/process-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, userId: user?.id }),
      })

      const data: ProcessResult = await response.json()

      if (data.success) {
        setResults(data.files)
        setCurrentLinkId(data.linkId || '')

        // Animate progress
        let currentProgress = 0
        const interval = setInterval(() => {
          currentProgress += 20
          setProgress(currentProgress)
          if (currentProgress >= 100) {
            clearInterval(interval)
            setIsProcessing(false)

            // Start countdown
            const countdownInterval = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(countdownInterval)
                  setResults([])
                  toast({
                    title: 'Link Expired',
                    description: 'The download link has expired. Please process again.',
                    variant: 'destructive',
                  })
                  return 0
                }
                return prev - 1
              })
            }, 1000)
          }
        }, 1000)

        toast({
          title: 'Success',
          description: 'Link processed successfully!',
        })
      } else {
        throw new Error('Failed to process link')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process link. Please try again.',
        variant: 'destructive',
      })
      setIsProcessing(false)
    }
  }

  const handlePlayVideo = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl)
    setShowVideoPlayer(true)
  }

  const handleDownload = (file: FileItem) => {
    window.open(file.downloadUrl, '_blank')
  }

  const handleDownloadZip = async () => {
    if (results.length === 0) return

    setIsDownloadingZip(true)

    try {
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: results,
          linkId: currentLinkId
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `download-${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: 'ZIP Downloaded!',
          description: `Downloaded ${results.length} file(s) as ZIP.`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download ZIP')
      }
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to create ZIP file.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloadingZip(false)
    }
  }

  const handleExtractLinks = () => {
    if (!multiLinkText.trim()) {
      toast({
        title: 'No Content',
        description: 'Please paste some text containing links',
        variant: 'destructive',
      })
      return
    }

    const links = extractLinks(multiLinkText)
    const supportedLinks = links.filter(isSupportedPlatform)

    if (links.length === 0) {
      toast({
        title: 'No Links Found',
        description: 'No valid URLs found in the pasted text',
        variant: 'destructive',
      })
      return
    }

    setExtractedLinks(links)

    if (supportedLinks.length === 0) {
      toast({
        title: 'Unsupported Links',
        description: `Found ${links.length} link(s), but none are from Terabox or Diskwala`,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Links Extracted',
        description: `Found ${links.length} link(s) (${supportedLinks.length} supported)`,
      })
    }
  }

  const handleProcessMultipleLinks = async () => {
    if (extractedLinks.length === 0) {
      toast({
        title: 'No Links',
        description: 'Please extract links first',
        variant: 'destructive',
      })
      return
    }

    const supportedLinks = extractedLinks.filter(isSupportedPlatform)

    if (supportedLinks.length === 0) {
      toast({
        title: 'No Supported Links',
        description: 'No Terabox or Diskwala links found',
        variant: 'destructive',
      })
      return
    }

    setIsProcessingMulti(true)
    setMultiLinkResults([])
    setMultiProgress(0)

    try {
      const results: LinkResult[] = []

      for (let i = 0; i < supportedLinks.length; i++) {
        const link = supportedLinks[i]
        const platform = detectPlatform(link)

        try {
          const response = await fetch('/api/process-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: link, userId: user?.id }),
          })

          const data: ProcessResult = await response.json()

          if (data.success) {
            results.push({
              url: link,
              platform,
              files: data.files,
              linkId: data.linkId || '',
              success: true,
            })
          } else {
            results.push({
              url: link,
              platform,
              files: [],
              linkId: '',
              success: false,
              error: 'Failed to process link',
            })
          }
        } catch (error) {
          results.push({
            url: link,
            platform,
            files: [],
            linkId: '',
            success: false,
            error: 'Network error',
          })
        }

        setMultiProgress(Math.round(((i + 1) / supportedLinks.length) * 100))
      }

      setMultiLinkResults(results)

      const successCount = results.filter(r => r.success).length
      const totalFiles = results.reduce((sum, r) => sum + r.files.length, 0)

      toast({
        title: 'Processing Complete',
        description: `Processed ${results.length} link(s): ${successCount} successful, ${totalFiles} files found`,
      })

      setTimeout(() => {
        setMultiLinkResults([])
        setExtractedLinks([])
        setMultiLinkText('')
      }, 5000)

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process links',
        variant: 'destructive',
      })
    } finally {
      setIsProcessingMulti(false)
    }
  }

  const handleDownloadAllAsZip = async () => {
    const allFiles = multiLinkResults.flatMap(result => result.files)

    if (allFiles.length === 0) {
      toast({
        title: 'No Files',
        description: 'No files to download',
        variant: 'destructive',
      })
      return
    }

    setIsDownloadingZip(true)

    try {
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: allFiles,
          linkId: 'multi'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `multiple-links-${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: 'ZIP Downloaded!',
          description: `Downloaded ${allFiles.length} file(s) from ${multiLinkResults.length} link(s) as ZIP.`,
        })
      } else {
        throw new Error('Failed to download ZIP')
      }
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to create ZIP file',
        variant: 'destructive',
      })
    } finally {
      setIsDownloadingZip(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        user={user}
        setUser={setUser}
        setIsPremium={setIsPremium}
        setShowAds={setShowAds}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        {showAds && !isPremium && <AdBanner size="large" />}

        <Hero />

        <LinkProcessor
          url={url}
          setUrl={setUrl}
          handleProcessLink={handleProcessLink}
          isProcessing={isProcessing}
          progress={progress}
          countdown={countdown}
          multiLinkText={multiLinkText}
          setMultiLinkText={setMultiLinkText}
          handleExtractLinks={handleExtractLinks}
          isProcessingMulti={isProcessingMulti}
          handleProcessMultipleLinks={handleProcessMultipleLinks}
          extractedLinks={extractedLinks}
          multiProgress={multiProgress}
        />

        <ResultsGrid
          results={results}
          handleDownloadZip={handleDownloadZip}
          isDownloadingZip={isDownloadingZip}
          handlePlayVideo={handlePlayVideo}
          handleDownload={handleDownload}
          countdown={countdown}
        />

        <MultiLinkResults
          multiLinkResults={multiLinkResults}
          handleDownloadAllAsZip={handleDownloadAllAsZip}
          isDownloadingZip={isDownloadingZip}
          handlePlayVideo={handlePlayVideo}
          handleDownload={handleDownload}
        />

        {showAds && !isPremium && results.length > 0 && <AdBanner size="medium" />}

        <FeaturesSection />

        <Alert className="max-w-3xl mx-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This is a demonstrative file processor. We do not store any files on our servers.
            All processing is done in real-time with automatic link expiration. Please ensure you have the right to access and download the content.
          </AlertDescription>
        </Alert>

        {showAds && !isPremium && <AdBanner size="large" />}
      </main>

      <VideoPlayerDialog
        open={showVideoPlayer}
        onOpenChange={setShowVideoPlayer}
        videoUrl={currentVideoUrl}
      />

      <Footer />
    </div>
  )
}
