
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'

interface VideoPlayerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    videoUrl: string
}

export function VideoPlayerDialog({ open, onOpenChange, videoUrl }: VideoPlayerDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Video Player</DialogTitle>
                    <DialogDescription>Streaming video content</DialogDescription>
                </DialogHeader>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video controls autoPlay className="w-full h-full" src={videoUrl}>
                        Your browser does not support the video tag.
                    </video>
                </div>
            </DialogContent>
        </Dialog>
    )
}
