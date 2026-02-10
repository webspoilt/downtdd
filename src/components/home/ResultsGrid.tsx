
import { Archive, Loader2, Play, Download, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileItem } from '@/types'

interface ResultsGridProps {
    results: FileItem[]
    handleDownloadZip: () => void
    isDownloadingZip: boolean
    handlePlayVideo: (url: string) => void
    handleDownload: (file: FileItem) => void
    countdown: number
}

export function ResultsGrid({
    results,
    handleDownloadZip,
    isDownloadingZip,
    handlePlayVideo,
    handleDownload,
    countdown
}: ResultsGridProps) {
    if (results.length === 0) return null

    return (
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
    )
}
