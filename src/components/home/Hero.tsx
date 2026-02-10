
import { CloudDownload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function Hero() {
    return (
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
    )
}
