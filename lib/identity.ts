'use client'

import { v4 as uuidv4 } from 'uuid'

const KEY = 'anon_id'

export function getAnonId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = uuidv4()
    localStorage.setItem(KEY, id)
  }
  return id
}

export async function getHashedAnonId(): Promise<string> {
  const id = getAnonId()
  if (!id) return ''
  const encoder = new TextEncoder()
  const data = encoder.encode(id)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function deriveHandle(hash: string): string {
  const adjectives = ['ghost', 'void', 'null', 'anon', 'shade', 'echo', 'veil', 'haze']
  const adj = adjectives[parseInt(hash.slice(0, 2), 16) % adjectives.length]
  const suffix = hash.slice(2, 6)
  return `${adj}_${suffix}`
}
