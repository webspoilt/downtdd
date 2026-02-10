
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AdBannerProps {
    size?: 'large' | 'medium'
}

export function AdBanner({ size = 'large' }: AdBannerProps) {
    const heightClass = size === 'large' ? 'h-24' : 'h-64'
    const textCheck = size === 'large' ? '728x90' : '300x250'

    return (
        <Card className={`mx-auto mb-8 bg-muted/50 border-dashed ${size === 'large' ? 'max-w-3xl' : 'max-w-3xl'}`}>
            <CardContent className="p-6">
                <div className="text-center space-y-2">
                    <Badge variant="outline" className="text-xs">Advertisement</Badge>
                    <div className={`${heightClass} bg-muted rounded-lg flex items-center justify-center`}>
                        <span className="text-muted-foreground text-sm">Ad Space - {textCheck}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
