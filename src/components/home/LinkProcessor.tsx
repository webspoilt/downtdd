
import {
    Link2,
    Layers,
    Zap,
    Clock,
    Loader2,
    CloudDownload,
} from 'lucide-react'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { isSupportedPlatform, detectPlatform } from '@/lib/utils'

interface LinkProcessorProps {
    url: string
    setUrl: (url: string) => void
    handleProcessLink: () => void
    isProcessing: boolean
    progress: number
    countdown: number
    multiLinkText: string
    setMultiLinkText: (text: string) => void
    handleExtractLinks: () => void
    isProcessingMulti: boolean
    handleProcessMultipleLinks: () => void
    extractedLinks: string[]
    multiProgress: number
}

export function LinkProcessor({
    url,
    setUrl,
    handleProcessLink,
    isProcessing,
    progress,
    countdown,
    multiLinkText,
    setMultiLinkText,
    handleExtractLinks,
    isProcessingMulti,
    handleProcessMultipleLinks,
    extractedLinks,
    multiProgress,
}: LinkProcessorProps) {
    return (
        <>
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

            {/* Processing Area (for single link) */}
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
        </>
    )
}
