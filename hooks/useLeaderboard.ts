'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Post } from '@/types/supabase'

// Leaderboard variant of useFeed:
// - Re-syncs when server refreshes (router.refresh)
// - Subscribes to UPDATE events only (vote count live refresh)
// - Does NOT prepend new posts — rank order is a snapshot from page load
export function useLeaderboard(initialPosts: Post[]) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const prevFirstId = useRef(initialPosts[0]?.id)

  useEffect(() => {
    const incomingFirstId = initialPosts[0]?.id
    if (incomingFirstId !== prevFirstId.current) {
      prevFirstId.current = incomingFirstId
      setPosts(initialPosts)
    }
  }, [initialPosts])

  useEffect(() => {
    const channel = supabase
      .channel('public:posts:leaderboard')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === (payload.new as Post).id ? (payload.new as Post) : p,
            ),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { posts }
}
