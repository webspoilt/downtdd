'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { extractLinks, isSupportedPlatform, detectPlatform } from '@/lib/utils'
import { 
  CloudDownload, 
  Play, 
  Download, 
  Crown, 
  User, 
  Lock, 
  Check, 
  Zap,
  Video,
  FolderOpen,
  Shield,
  Clock,
  X,
  Archive,
  Loader2,
  Link2,
  Layers
} from 'lucide-react'

interface FileItem {
  name: string
  size: string
  url: string
  downloadUrl: string
  isVideo?: boolean
}

interface LinkResult {
  url: string
  platform: string
  files: FileItem[]
  linkId: string
  success: boolean
  error?: string
}

interface ProcessResult {
  success: boolean
  files: FileItem[]
  expiresIn: number
  linkId?: string
}

export default function Home() {
  const { toast } = useToast()
  const [url, setUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [countdown, setCountdown] = useState(5)
  const [results, setResults] = useState<FileItem[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showPremiumDialog, setShowPremiumDialog] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [showAds, setShowAds] = useState(true)
  const [currentLinkId, setCurrentLinkId] = useState('')
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)
  
  // Multiple links state
  const [multiLinkText, setMultiLinkText] = useState('')
  const [extractedLinks, setExtractedLinks] = useState<string[]>([])
  const [isProcessingMulti, setIsProcessingMulti] = useState(false)
  const [multiLinkResults, setMultiLinkResults] = useState<LinkResult[]>([])
  const [multiProgress, setMultiProgress] = useState(0)

  const handleProcessLink = async () => {
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid link',
        variant: 'destructive',
      })
      return
    }

    // Basic URL validation
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
        // Get the blob from the response
        const blob = await response.blob()
        
        // Create a download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `download-${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        
        // Clean up
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

  // Extract links from pasted text
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

  // Process multiple links
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

        // Update progress
        setMultiProgress(Math.round(((i + 1) / supportedLinks.length) * 100))
      }

      setMultiLinkResults(results)
      
      const successCount = results.filter(r => r.success).length
      const totalFiles = results.reduce((sum, r) => sum + r.files.length, 0)

      toast({
        title: 'Processing Complete',
        description: `Processed ${results.length} link(s): ${successCount} successful, ${totalFiles} files found`,
      })

      // Clear results after 5 seconds
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

  // Download all files from all links as ZIP
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

  const features = [
    {
      icon: FolderOpen,
      title: 'Folder Support',
      description: 'Process Terabox & Diskwala folder links',
      color: 'text-primary',
    },
    {
      icon: Video,
      title: 'Stream Videos',
      description: 'Play videos directly without downloading',
      color: 'text-green-600',
    },
    {
      icon: Shield,
      title: 'No Storage',
      description: 'Files are not stored on our servers',
      color: 'text-orange-600',
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Quick link processing with instant access',
      color: 'text-yellow-600',
    },
  ]

  const premiumFeatures = [
    { icon: Check, text: 'No advertisements' },
    { icon: Check, text: 'No waiting time' },
    { icon: Check, text: 'Faster download speeds' },
    { icon: Check, text: 'Multiple simultaneous downloads' },
    { icon: Check, text: 'Priority support' },
    { icon: Check, text: 'Extended link expiration' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudDownload className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">LinkDownloader</h1>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isAuthenticated ? (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        {user?.name || 'Account'}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Login
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Login / Register</DialogTitle>
                    <DialogDescription>
                      Sign in to access premium features
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input type="email" placeholder="your@email.com" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Password</label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                        <Button className="w-full" onClick={() => {
                          setIsAuthenticated(true)
                          setUser({ name: 'Demo User', email: 'demo@example.com', isPremium: false })
                          setShowLoginDialog(false)
                          toast({ title: 'Welcome back!' })
                        }}>
                          Login
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="register">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input type="text" placeholder="Your name" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input type="email" placeholder="your@email.com" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Password</label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                        <Button className="w-full" onClick={() => {
                          setIsAuthenticated(true)
                          setUser({ name: 'New User', email: 'new@example.com', isPremium: false })
                          setShowLoginDialog(false)
                          toast({ title: 'Account created!' })
                        }}>
                          Register
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    Premium
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      Go Premium
                    </DialogTitle>
                    <DialogDescription>
                      Unlock all features and enhance your experience
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">$4.99</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                    <div className="space-y-3">
                      {premiumFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <feature.icon className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" size="lg" onClick={() => {
                      setIsPremium(true)
                      setShowPremiumDialog(false)
                      setShowAds(false)
                      toast({ title: 'Premium activated!', description: 'Enjoy all premium features' })
                    }}>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {isAuthenticated && user?.isPremium && (
                <Badge variant="secondary" className="gap-1">
                  <Crown className="h-3 w-3 text-yellow-600" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Ad Banner - Top */}
        {showAds && !isPremium && (
          <Card className="mb-8 bg-muted/50 border-dashed">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-xs">Advertisement</Badge>
                <div className="h-24 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Ad Space - 728x90</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Download Files from Terabox & Diskwala
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Paste your Terabox or Diskwala link below to process and download files. Watch videos online or download all as ZIP!
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="gap-1">
              <CloudDownload className="h-3 w-3" />
              Terabox
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CloudDownload className="h-3 w-3" />
              Diskwala
            </Badge>
          </div>
        </div>

        {/* Link Input Card with Tabs */}
        <Card className="max-w-3xl mx-auto mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudDownload className="h-5 w-5" />
              Process Your Links
            </CardTitle>
            <CardDescription>
              Supports Terabox and Diskwala public links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="single" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Single Link
                </TabsTrigger>
                <TabsTrigger value="multiple" className="gap-2">
                  <Layers className="h-4 w-4" />
                  Multiple Links
                </TabsTrigger>
              </TabsList>

              {/* Single Link Tab */}
              <TabsContent value="single">
                <div className="flex gap-3">
                  <Input
                    type="url"
                    placeholder="https://terabox.com/s/... or https://diskwala.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleProcessLink()}
                    className="flex-1"
                  />
                  <Button onClick={handleProcessLink} disabled={isProcessing} size="lg">
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Process
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Links expire in 5 seconds. Files are not stored on our servers.</span>
                </div>
              </TabsContent>

              {/* Multiple Links Tab */}
              <TabsContent value="multiple" className="space-y-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Paste text containing multiple links here... 

Example:
Check out these links:
https://terabox.com/s/abc123
https://diskwala.com/share/xyz456
Another link: https://terabox.com/s/def789

The system will automatically extract all links!"
                    value={multiLinkText}
                    onChange={(e) => setMultiLinkText(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleExtractLinks} 
                      variant="outline" 
                      className="flex-1"
                      disabled={isProcessingMulti}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Extract Links
                    </Button>
                    <Button 
                      onClick={handleProcessMultipleLinks} 
                      disabled={extractedLinks.length === 0 || isProcessingMulti}
                      className="flex-1"
                    >
                      {isProcessingMulti ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Layers className="h-4 w-4 mr-2" />
                          Process All ({extractedLinks.filter(isSupportedPlatform).length})
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Extracted Links Info */}
                  {extractedLinks.length > 0 && (
                    <div className="p-3 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Extracted Links:</span>
                        <Badge variant="secondary">
                          {extractedLinks.filter(isSupportedPlatform).length} / {extractedLinks.length} supported
                        </Badge>
                      </div>
                      {extractedLinks.length > 0 && (
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {extractedLinks.map((link, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <Badge 
                                variant={isSupportedPlatform(link) ? "default" : "outline"}
                                className="text-[10px]"
                              >
                                {detectPlatform(link)}
                              </Badge>
                              <span className="truncate flex-1 text-muted-foreground">
                                {link}
                              </span>
                              {!isSupportedPlatform(link) && (
                                <span className="text-xs text-muted-foreground">✗</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Processing Progress */}
                  {isProcessingMulti && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Processing links...</span>
                        <span>{multiProgress}%</span>
                      </div>
                      <Progress value={multiProgress} className="h-2" />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Processing Area */}
        {isProcessing && (
          <Card className="max-w-3xl mx-auto mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing your link...</span>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {countdown}s
                  </Badge>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card className="max-w-3xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available Files</span>
                <div className="flex items-center gap-2">
                  {results.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadZip}
                      disabled={isDownloadingZip}
                      className="gap-2"
                    >
                      {isDownloadingZip ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating ZIP...
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4" />
                          Download All as ZIP
                        </>
                      )}
                    </Button>
                  )}
                  <Badge variant="outline">
                    {results.length} file{results.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {results.map((file, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{file.name}</div>
                          <div className="text-sm text-muted-foreground">{file.size || 'Size unknown'}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {file.isVideo && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePlayVideo(file.downloadUrl)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Play
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Link expires in: {countdown} seconds</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Multiple Links Results */}
        {multiLinkResults.length > 0 && (
          <Card className="max-w-4xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Multiple Links Results
                </div>
                <div className="flex items-center gap-2">
                  {multiLinkResults.filter(r => r.files.length > 0).length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadAllAsZip}
                      disabled={isDownloadingZip}
                      className="gap-2"
                    >
                      {isDownloadingZip ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating ZIP...
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4" />
                          Download All ({multiLinkResults.reduce((sum, r) => sum + r.files.length, 0)} files)
                        </>
                      )}
                    </Button>
                  )}
                  <Badge variant="outline">
                    {multiLinkResults.length} link(s)
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Results for {multiLinkResults.length} processed link(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {multiLinkResults.map((result, linkIndex) => (
                  <div key={linkIndex} className="space-y-3">
                    {/* Link Header */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge variant={result.success ? "default" : "destructive"} className="text-xs">
                          {result.success ? '✓' : '✗'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.platform}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          {result.url}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {result.files.length} file(s)
                      </Badge>
                    </div>

                    {/* Files List */}
                    {result.success && result.files.length > 0 && (
                      <div className="space-y-2 pl-2">
                        {result.files.map((file, fileIndex) => (
                          <Card key={fileIndex} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{file.name}</div>
                                  <div className="text-xs text-muted-foreground">{file.size || 'Size unknown'}</div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {file.isVideo && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handlePlayVideo(file.downloadUrl)}
                                    >
                                      <Play className="h-3 w-3 mr-1" />
                                      Play
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    onClick={() => handleDownload(file)}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Error Message */}
                    {!result.success && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">
                          {result.error || 'Failed to process this link'}
                        </p>
                      </div>
                    )}

                    {/* No Files Message */}
                    {result.success && result.files.length === 0 && (
                      <div className="p-3 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                        No files found in this link
                      </div>
                    )}

                    {linkIndex < multiLinkResults.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Results expire in 5 seconds</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ad Banner - Middle */}
        {showAds && !isPremium && results.length > 0 && (
          <Card className="max-w-3xl mx-auto mb-8 bg-muted/50 border-dashed">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-xs">Advertisement</Badge>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Ad Space - 300x250</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className={`h-10 w-10 mx-auto mb-2 ${feature.color}`} />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Info Alert */}
        <Alert className="max-w-3xl mx-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This is a demonstrative file processor. We do not store any files on our servers. 
            All processing is done in real-time with automatic link expiration. Please ensure you have the right to access and download the content.
          </AlertDescription>
        </Alert>

        {/* Ad Banner - Bottom */}
        {showAds && !isPremium && (
          <Card className="max-w-3xl mx-auto mt-8 bg-muted/50 border-dashed">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-xs">Advertisement</Badge>
                <div className="h-24 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Ad Space - 728x90</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Video Player Dialog */}
      <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Player</DialogTitle>
            <DialogDescription>Streaming video content</DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video controls autoPlay className="w-full h-full" src={currentVideoUrl}>
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t mt-auto bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 LinkDownloader. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">DMCA</a>
              <a href="#" className="hover:text-foreground">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
