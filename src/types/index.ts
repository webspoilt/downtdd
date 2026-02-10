export interface FileItem {
    name: string
    size: string
    url: string
    downloadUrl: string
    isVideo?: boolean
}

export interface LinkResult {
    url: string
    platform: string
    files: FileItem[]
    linkId: string
    success: boolean
    error?: string
}

export interface ProcessResult {
    success: boolean
    files: FileItem[]
    expiresIn: number
    linkId?: string
}
