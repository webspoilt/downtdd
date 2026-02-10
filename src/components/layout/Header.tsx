import { CloudDownload, User, Lock, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { useState } from 'react'

interface User {
    name: string
    email: string
    isPremium: boolean
}

interface HeaderProps {
    isAuthenticated: boolean
    setIsAuthenticated: (value: boolean) => void
    user: User | null
    setUser: (user: User | null) => void
    setIsPremium: (value: boolean) => void
    setShowAds: (value: boolean) => void
}

export function Header({
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    setIsPremium,
    setShowAds,
}: HeaderProps) {
    const [showLoginDialog, setShowLoginDialog] = useState(false)
    const [showPremiumDialog, setShowPremiumDialog] = useState(false)

    const premiumFeatures = [
        { icon: Crown, text: 'No advertisements' },
        { icon: Crown, text: 'No waiting time' },
        { icon: Crown, text: 'Faster download speeds' },
        { icon: Crown, text: 'Multiple simultaneous downloads' },
        { icon: Crown, text: 'Priority support' },
        { icon: Crown, text: 'Extended link expiration' },
    ]

    return (
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
    )
}
