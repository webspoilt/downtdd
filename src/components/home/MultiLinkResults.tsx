
import { Layers, Loader2, Archive, Play, Download, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LinkResult, FileItem } from '@/types'

interface MultiLinkResultsProps {
    multiLinkResults: LinkResult[]
    handleDownloadAllAsZip: () => void
    isDownloadingZip: boolean
    handlePlayVideo: (url: string) => void
    handleDownload: (file: FileItem) => void
}

export function MultiLinkResults({
    multiLinkResults,
    handleDownloadAllAsZip,
    isDownloadingZip,
    handlePlayVideo,
    handleDownload
}: MultiLinkResultsProps) {
    if (multiLinkResults.length === 0) return null

    return (
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
    )
}
