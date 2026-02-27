import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPostNumber(n: number): string {
  if (n <= 100) return `#${n}`
  const idx = n - 101
  const letter = String.fromCharCode(65 + Math.floor(idx / 100))
  const num = (idx % 100) + 1
  return `#${letter}${num}`
}

export function parsePostNumber(input: string): number | null {
  const cleaned = input.replace(/^#/, '').trim().toUpperCase()
  if (!cleaned) return null

  // Pure number: 1–100
  if (/^\d+$/.test(cleaned)) {
    const n = parseInt(cleaned, 10)
    return n >= 1 ? n : null
  }

  // Letter-prefixed: A1, A2, B1, etc.
  const match = cleaned.match(/^([A-Z])(\d+)$/)
  if (match) {
    const letterIndex = match[1].charCodeAt(0) - 65 // A=0, B=1, …
    const num = parseInt(match[2], 10)
    if (num < 1 || num > 100) return null
    return 101 + letterIndex * 100 + (num - 1)
  }

  return null
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
