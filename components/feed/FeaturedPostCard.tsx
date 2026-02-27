'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { VoteButton } from '@/components/vote/VoteButton'
import { useVote } from '@/hooks/useVote'
import { deriveHandle } from '@/lib/identity'
import { timeAgo, formatPostNumber } from '@/lib/utils'
import type { Post } from '@/types/supabase'

interface FeaturedPostCardProps {
  post: Post
  postNumber: number
  replyCount?: number
  animate?: boolean
}

export function FeaturedPostCard({ post, postNumber, replyCount = 0, animate = false }: FeaturedPostCardProps) {
  const handle = deriveHandle(post.anon_id.slice(0, 8))
  const { upvotes, downvotes, userVote, loading, vote } = useVote({
    upvotes: post.upvotes,
    downvotes: post.downvotes,
  })

  const inner = (
    <article className="border-b-2 border-white px-4 py-6 hover:bg-surface-2 transition-colors duration-150 group">
      {/* Eyebrow label */}
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim border border-border px-1.5 py-0.5">
          top story
        </span>
        <span className="font-mono text-white text-sm font-medium">
          {formatPostNumber(postNumber)}
        </span>
      </div>

      {/* Content — large headline style */}
      <p className="font-display text-white text-[1.6rem] leading-snug tracking-tight mb-4 max-w-prose">
        {post.content}
      </p>

      {/* Byline */}
      <div className="flex items-center gap-3 border-t border-border pt-4">
        <span className="font-mono text-muted text-xs tracking-widest uppercase">
          {handle}
        </span>
        <span className="text-border" aria-hidden>·</span>
        <time
          dateTime={post.created_at}
          className="font-mono text-dim text-[11px]"
          suppressHydrationWarning
        >
          {timeAgo(post.created_at)}
        </time>
        <span className="text-border ml-auto" aria-hidden>·</span>
        {replyCount > 0 && (
          <span className="font-mono text-dim text-[11px] tracking-widest">
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </span>
        )}
        <div className="flex items-center gap-5">
          <VoteButton
            type="up"
            count={upvotes}
            active={userVote === 'up'}
            disabled={loading}
            onClick={() => vote(post.id, 'up')}
          />
          <VoteButton
            type="down"
            count={downvotes}
            active={userVote === 'down'}
            disabled={loading}
            onClick={() => vote(post.id, 'down')}
          />
        </div>
      </div>
    </article>
  )

  const linked = (
    <Link href={`/post/${post.id}`} className="block focus:outline-none focus-visible:ring-1 focus-visible:ring-white">
      {inner}
    </Link>
  )

  if (!animate) return linked

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {linked}
    </motion.div>
  )
}
