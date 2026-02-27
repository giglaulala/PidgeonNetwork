'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Post } from '@/types/supabase'

export function useFeed(initialPosts: Post[], initialTotalCount: number) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const prevFirstId = useRef(initialPosts[0]?.id)

  // Re-sync when server data refreshes (router.refresh())
  useEffect(() => {
    const incomingFirstId = initialPosts[0]?.id
    if (incomingFirstId !== prevFirstId.current) {
      prevFirstId.current = incomingFirstId
      setPosts(initialPosts)
      setTotalCount(initialTotalCount)
    }
  }, [initialPosts, initialTotalCount])

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:posts:feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'parent_id=is.null',
        },
        (payload) => {
          setPosts((prev) => {
            const exists = prev.some((p) => p.id === (payload.new as Post).id)
            if (exists) return prev
            return [payload.new as Post, ...prev]
          })
          setTotalCount((c) => c + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          setPosts((prev) =>
            prev.map((p) => (p.id === (payload.new as Post).id ? (payload.new as Post) : p))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { posts, setPosts, totalCount }
}
