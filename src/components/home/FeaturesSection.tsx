
import { FolderOpen, Video, Shield, Zap } from 'lucide-react'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'

export function FeaturesSection() {
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

    return (
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
    )
}
