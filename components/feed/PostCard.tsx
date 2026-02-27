'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { VoteButton } from '@/components/vote/VoteButton'
import { useVote } from '@/hooks/useVote'
import { deriveHandle } from '@/lib/identity'
import { timeAgo } from '@/lib/utils'
import type { Post } from '@/types/supabase'

interface PostCardProps {
  post: Post
  replyCount?: number
  showReplies?: boolean
  animate?: boolean
}

export function PostCard({ post, replyCount = 0, showReplies = true, animate = false }: PostCardProps) {
  const handle = deriveHandle(post.anon_id.slice(0, 8))
  const { upvotes, downvotes, userVote, loading, vote } = useVote({
    upvotes: post.upvotes,
    downvotes: post.downvotes,
  })

  const inner = (
    <article className="border-b border-border px-4 py-5 hover:bg-surface-2 transition-colors duration-150 group">
      <div className="flex items-center gap-3 mb-3">
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
      </div>

      <p className="text-white text-[15px] leading-relaxed max-w-prose">
        {post.content}
      </p>

      <div className="flex items-center gap-6 mt-4">
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
        {showReplies && (
          <span className="font-mono text-xs text-dim tracking-widest">
            {replyCount > 0 ? `${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}` : 'reply'}
          </span>
        )}
      </div>
    </article>
  )

  const wrapped = showReplies ? (
    <Link href={`/post/${post.id}`} className="block focus:outline-none focus-visible:ring-1 focus-visible:ring-white">
      {inner}
    </Link>
  ) : (
    inner
  )

  if (!animate) return wrapped

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {wrapped}
    </motion.div>
  )
}
