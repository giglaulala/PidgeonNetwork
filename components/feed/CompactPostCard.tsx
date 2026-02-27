'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useVote } from '@/hooks/useVote'
import { useReport } from '@/hooks/useReport'
import { deriveHandle } from '@/lib/identity'
import { timeAgo, formatPostNumber } from '@/lib/utils'
import type { Post } from '@/types/supabase'

interface CompactPostCardProps {
  post: Post
  postNumber: number
  index?: number
  animate?: boolean
}

export function CompactPostCard({ post, postNumber, index = 0, animate = false }: CompactPostCardProps) {
  const handle = deriveHandle(post.anon_id.slice(0, 8))
  const { upvotes, downvotes, hasVoted, loading, vote } = useVote({
    postId: post.id,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
  })
  const { hasReported, loading: reportLoading, report } = useReport({
    postId: post.id,
    reports: post.reports ?? 0,
  })

  const inner = (
    <article className="border border-border p-3 hover:bg-surface-2 hover:border-border-soft transition-colors duration-150 h-full flex flex-col group">
      {/* Handle + number + time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-white font-medium">
            {formatPostNumber(postNumber)}
          </span>
          <span className="text-border text-[10px]" aria-hidden>·</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-dim">
            {handle}
          </span>
        </div>
        <time
          dateTime={post.created_at}
          className="font-mono text-[10px] text-dim"
          suppressHydrationWarning
        >
          {timeAgo(post.created_at)}
        </time>
      </div>

      {/* Content — truncated, classifieds style */}
      <p className="font-body text-white text-[13px] leading-snug line-clamp-3 flex-1 mb-3">
        {post.content}
      </p>

      {/* Footer: votes inline */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          onClick={(e) => { e.preventDefault(); vote('up') }}
          disabled={loading || hasVoted}
          aria-label="Upvote"
          title={hasVoted ? 'already voted' : undefined}
          className={`font-mono text-[10px] tracking-widest transition-opacity duration-150 ${
            hasVoted || loading
              ? 'opacity-30 cursor-not-allowed'
              : 'text-dim hover:text-white cursor-pointer'
          }`}
        >
          + {upvotes}
        </button>
        <button
          onClick={(e) => { e.preventDefault(); vote('down') }}
          disabled={loading || hasVoted}
          aria-label="Downvote"
          title={hasVoted ? 'already voted' : undefined}
          className={`font-mono text-[10px] tracking-widest transition-opacity duration-150 ${
            hasVoted || loading
              ? 'opacity-30 cursor-not-allowed'
              : 'text-dim hover:text-white cursor-pointer'
          }`}
        >
          - {downvotes}
        </button>
        <button
          onClick={(e) => { e.preventDefault(); report() }}
          disabled={reportLoading || hasReported}
          aria-label="Report"
          title={hasReported ? 'already reported' : 'report'}
          className={`transition-opacity duration-150 ${
            hasReported || reportLoading
              ? 'opacity-30 cursor-not-allowed'
              : 'text-dim hover:text-red-400 cursor-pointer'
          }`}
        >
          <svg width="10" height="10" viewBox="0 0 11 11" fill="currentColor" aria-hidden>
            <path d="M1 1h7l-1.5 3L8 7H1V1z" />
            <rect x="1" y="9" width="1" height="2" />
          </svg>
        </button>
        <span className="ml-auto font-mono text-[10px] text-border group-hover:text-dim transition-colors duration-150">
          read &rarr;
        </span>
      </div>
    </article>
  )

  const linked = (
    <Link href={`/post/${post.id}`} className="block h-full focus:outline-none focus-visible:ring-1 focus-visible:ring-white">
      {inner}
    </Link>
  )

  if (!animate) return linked

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.03 }}
      className="h-full"
    >
      {linked}
    </motion.div>
  )
}
