'use client'

import Link from 'next/link'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useVote } from '@/hooks/useVote'
import { useReport } from '@/hooks/useReport'
import { VoteButton } from '@/components/vote/VoteButton'
import { ReportButton } from '@/components/vote/ReportButton'
import { deriveHandle } from '@/lib/identity'
import { timeAgo } from '@/lib/utils'
import type { Post } from '@/types/supabase'

interface LeaderboardFeedProps {
  initialPosts: Post[]
}

function RankBadge({ rank }: { rank: number }) {
  const isTop3 = rank <= 3
  return (
    <span
      className={`font-mono text-[11px] leading-none tabular-nums w-6 shrink-0 pt-0.5 ${
        isTop3 ? 'text-white' : 'text-border'
      }`}
    >
      {String(rank).padStart(2, '0')}
    </span>
  )
}

function LeaderboardCard({ post, rank }: { post: Post; rank: number }) {
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

  return (
    <article className="border-b border-border hover:bg-surface-2 transition-colors duration-150 group">
      <Link
        href={`/post/${post.id}`}
        className="block px-4 py-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
      >
        {/* Rank row */}
        <div className="flex items-start gap-3">
          <RankBadge rank={rank} />

          <div className="flex-1 min-w-0">
            {/* Content */}
            <p className="text-white text-[14px] leading-relaxed line-clamp-3 mb-3">
              {post.content}
            </p>

            {/* Footer */}
            <div
              className="flex items-center gap-4 flex-wrap"
              onClick={(e) => e.preventDefault()}
            >
              <VoteButton
                type="up"
                count={upvotes}
                hasVoted={hasVoted}
                disabled={loading}
                onClick={() => vote('up')}
              />
              <VoteButton
                type="down"
                count={downvotes}
                hasVoted={hasVoted}
                disabled={loading}
                onClick={() => vote('down')}
              />
              <ReportButton
                hasReported={hasReported}
                disabled={reportLoading}
                onClick={() => report()}
              />

              <div className="flex items-center gap-2 ml-auto">
                <span className="font-mono text-[10px] text-muted tracking-widest uppercase">
                  {handle}
                </span>
                <span className="text-border text-[10px]" aria-hidden>·</span>
                <time
                  dateTime={post.created_at}
                  className="font-mono text-[10px] text-dim"
                  suppressHydrationWarning
                >
                  {timeAgo(post.created_at)}
                </time>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

const SkeletonLeaderboard = () => (
  <div className="border-b border-border px-4 py-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-6 h-3 bg-surface-3 mt-0.5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-full bg-surface-3" />
        <div className="h-3.5 w-4/5 bg-surface-3" />
        <div className="h-3.5 w-2/3 bg-surface-3" />
        <div className="flex gap-4 pt-1">
          <div className="h-3 w-8 bg-surface-3" />
          <div className="h-3 w-8 bg-surface-3" />
          <div className="ml-auto h-3 w-24 bg-surface-3" />
        </div>
      </div>
    </div>
  </div>
)

export function LeaderboardFeed({ initialPosts }: LeaderboardFeedProps) {
  const { posts } = useLeaderboard(initialPosts)

  if (posts.length === 0) {
    return (
      <div className="px-4 py-16 text-center border-t border-border">
        <p className="font-mono text-dim text-[10px] tracking-[0.2em] uppercase mb-2">
          no dispatches yet
        </p>
        <p className="font-body text-muted text-[15px]">
          be the first to say something.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center gap-0 border-b border-border">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim px-4 py-2 border-r border-border">
          ranked by upvotes
        </span>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-dim px-4 py-2">
          {posts.length} dispatches
        </span>
      </div>

      {/* Ranked list */}
      <div>
        {posts.map((post, i) => (
          <LeaderboardCard key={post.id} post={post} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}

export { SkeletonLeaderboard }
