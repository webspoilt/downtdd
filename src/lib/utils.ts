import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract all valid URLs from a text string
 * Automatically detects links starting with http:// or https://
 * @param text - The text to extract links from
 * @returns Array of unique, valid URLs
 */
export function extractLinks(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return []
  }

  // Regex to match URLs starting with http:// or https://
  // This pattern captures the full URL including path and query parameters
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi
  
  const matches = text.match(urlRegex)
  
  if (!matches) {
    return []
  }

  // Clean up URLs (remove trailing punctuation if any)
  const cleanedLinks = matches.map(link => {
    // Remove trailing characters that aren't part of URL
    return link.replace(/[.,;:!?)\]\}"']+$/, '')
  })

  // Remove duplicates and return
  return Array.from(new Set(cleanedLinks)).filter(link => {
    // Basic URL validation
    try {
      new URL(link)
      return true
    } catch {
      return false
    }
  })
}

/**
 * Check if a URL is from a supported platform
 * @param url - The URL to check
 * @returns true if URL is from Terabox or Diskwala
 */
export function isSupportedPlatform(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  return lowerUrl.includes('terabox.com') || lowerUrl.includes('diskwala.com')
}

/**
 * Detect the platform from a URL
 * @param url - The URL to check
 * @returns The platform name ('Terabox', 'Diskwala', or 'Unknown')
 */
export function detectPlatform(url: string): string {
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('terabox.com')) {
    return 'Terabox'
  } else if (lowerUrl.includes('diskwala.com')) {
    return 'Diskwala'
  }
  return 'Unknown'
}
