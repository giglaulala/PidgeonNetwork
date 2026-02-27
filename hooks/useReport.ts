'use client'

import { useEffect, useState } from 'react'
import { getReportFingerprint } from '@/lib/identity'
import { hasReportedPost, markReported } from '@/lib/reported-posts'

interface UseReportOptions {
  postId: string
  reports: number
}

export function useReport({ postId, reports: initialReports }: UseReportOptions) {
  const [reports, setReports] = useState(initialReports ?? 0)
  const [hasReported, setHasReported] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Layer 1 — localStorage check on mount
  useEffect(() => {
    setHasReported(hasReportedPost(postId))
  }, [postId])

  async function report() {
    if (loading || hasReported) return

    // Optimistic update
    const prev = reports
    setReports((r) => r + 1)

    setLoading(true)
    setError(null)

    try {
      // Layer 2 — compute fingerprint client-side
      const fingerprint = await getReportFingerprint(postId)

      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, fingerprint }),
      })

      if (res.status === 409) {
        // Server says already reported — sync localStorage and rollback count
        markReported(postId)
        setHasReported(true)
        setReports(prev)
        return
      }

      if (!res.ok) {
        throw new Error('Report failed')
      }

      // Confirmed — persist to localStorage
      markReported(postId)
      setHasReported(true)
    } catch (err) {
      // Rollback optimistic update
      setReports(prev)
      setError(err instanceof Error ? err.message : 'Report failed')
    } finally {
      setLoading(false)
    }
  }

  return { reports, hasReported, loading, error, report }
}
