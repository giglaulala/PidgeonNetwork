'use client'

import { useEffect, useState } from 'react'
import { getVoteFingerprint } from '@/lib/identity'
import { hasVotedPost, markVoted } from '@/lib/voted-posts'

interface UseVoteOptions {
  postId: string
  upvotes: number
  downvotes: number
}

export function useVote({ postId, upvotes: initialUp, downvotes: initialDown }: UseVoteOptions) {
  const [upvotes, setUpvotes] = useState(initialUp ?? 0)
  const [downvotes, setDownvotes] = useState(initialDown ?? 0)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Layer 1 — localStorage check on mount
  useEffect(() => {
    setHasVoted(hasVotedPost(postId))
  }, [postId])

  async function vote(type: 'up' | 'down') {
    if (loading || hasVoted) return

    // Optimistic update
    const prev = { upvotes, downvotes }
    if (type === 'up') setUpvotes((u) => u + 1)
    else setDownvotes((d) => d + 1)

    setLoading(true)
    setError(null)

    try {
      // Layer 2 — compute fingerprint client-side
      const fingerprint = await getVoteFingerprint(postId)

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, voteType: type, fingerprint }),
      })

      if (res.status === 409) {
        // Server says already voted — sync localStorage and rollback count
        markVoted(postId)
        setHasVoted(true)
        setUpvotes(prev.upvotes)
        setDownvotes(prev.downvotes)
        return
      }

      if (!res.ok) {
        throw new Error('Vote failed')
      }

      // Confirmed — persist to localStorage
      markVoted(postId)
      setHasVoted(true)
    } catch (err) {
      // Rollback optimistic update
      setUpvotes(prev.upvotes)
      setDownvotes(prev.downvotes)
      setError(err instanceof Error ? err.message : 'Vote failed')
    } finally {
      setLoading(false)
    }
  }

  return { upvotes, downvotes, hasVoted, loading, error, vote }
}
