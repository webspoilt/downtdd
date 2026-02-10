
export function Footer() {
    return (
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
    )
}
