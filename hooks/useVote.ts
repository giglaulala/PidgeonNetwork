'use client'

import { useState } from 'react'
import { getHashedAnonId } from '@/lib/identity'

type VoteType = 'up' | 'down'

interface VoteState {
  upvotes: number
  downvotes: number
  userVote: VoteType | null
}

export function useVote(initial: { upvotes: number; downvotes: number }) {
  const [state, setState] = useState<VoteState>({
    upvotes: initial.upvotes,
    downvotes: initial.downvotes,
    userVote: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function vote(postId: string, type: VoteType) {
    if (loading) return

    const prevState = { ...state }
    const isToggle = state.userVote === type

    // Optimistic update
    setState((prev) => {
      if (isToggle) {
        return {
          ...prev,
          upvotes: type === 'up' ? prev.upvotes - 1 : prev.upvotes,
          downvotes: type === 'down' ? prev.downvotes - 1 : prev.downvotes,
          userVote: null,
        }
      }
      return {
        upvotes: type === 'up'
          ? prev.upvotes + 1
          : prev.userVote === 'up'
          ? prev.upvotes - 1
          : prev.upvotes,
        downvotes: type === 'down'
          ? prev.downvotes + 1
          : prev.userVote === 'down'
          ? prev.downvotes - 1
          : prev.downvotes,
        userVote: type,
      }
    })

    setLoading(true)
    setError(null)

    try {
      const hashedId = await getHashedAnonId()
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, voteType: type, hashedAnonId: hashedId }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Vote failed')
      }
    } catch (err) {
      // Rollback on failure
      setState(prevState)
      setError(err instanceof Error ? err.message : 'Vote failed')
    } finally {
      setLoading(false)
    }
  }

  return { ...state, loading, error, vote }
}
