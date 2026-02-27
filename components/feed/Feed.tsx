'use client'

import { useFeed } from '@/hooks/useFeed'
import { FeaturedPostCard } from './FeaturedPostCard'
import { CompactPostCard } from './CompactPostCard'
import type { Post } from '@/types/supabase'

interface FeedProps {
  initialPosts: Post[]
  initialTotalCount: number
}

const SkeletonFeatured = () => (
  <div className="border-b-2 border-white px-4 py-6 animate-pulse">
    <div className="h-3 w-20 bg-surface-3 mb-4" />
    <div className="space-y-3 mb-4">
      <div className="h-7 w-full bg-surface-3" />
      <div className="h-7 w-5/6 bg-surface-3" />
      <div className="h-7 w-3/4 bg-surface-3" />
    </div>
    <div className="border-t border-border pt-4 flex gap-4">
      <div className="h-3 w-24 bg-surface-3" />
      <div className="h-3 w-16 bg-surface-3" />
    </div>
  </div>
)

const SkeletonCompact = () => (
  <div className="border border-border p-3 animate-pulse">
    <div className="flex justify-between mb-2">
      <div className="h-2.5 w-16 bg-surface-3" />
      <div className="h-2.5 w-10 bg-surface-3" />
    </div>
    <div className="space-y-1.5 mb-3">
      <div className="h-3 w-full bg-surface-3" />
      <div className="h-3 w-5/6 bg-surface-3" />
      <div className="h-3 w-2/3 bg-surface-3" />
    </div>
    <div className="border-t border-border pt-2 flex gap-3">
      <div className="h-2.5 w-8 bg-surface-3" />
      <div className="h-2.5 w-8 bg-surface-3" />
    </div>
  </div>
)

export function Feed({ initialPosts, initialTotalCount }: FeedProps) {
  const { posts, totalCount } = useFeed(initialPosts, initialTotalCount)

  if (posts.length === 0) {
    return (
      <div className="px-4 py-16 text-center border-t border-border">
        <p className="font-mono text-dim text-[10px] tracking-[0.2em] uppercase mb-2">
          no dispatches
        </p>
        <p className="font-body text-muted text-[15px]">
          be the first to say something.
        </p>
      </div>
    )
  }

  const [featured, ...rest] = posts

  // Posts are DESC (newest first). Post number = totalCount - index
  // newest post = totalCount, second newest = totalCount - 1, etc.
  const featuredNumber = totalCount
  const restNumbers = rest.map((_, i) => totalCount - 1 - i)

  return (
    <div>
      {/* Top story */}
      <FeaturedPostCard
        key={featured.id}
        post={featured}
        postNumber={featuredNumber}
        animate={false}
      />

      {/* Classifieds grid */}
      {rest.length > 0 && (
        <div>
          <div className="flex items-center gap-0 border-b border-border">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim px-4 py-2 border-r border-border">
              all dispatches
            </span>
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-dim px-4 py-2">
              {totalCount} posts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-y divide-border">
            {rest.map((post, i) => (
              <div key={post.id} className="min-h-[9rem]">
                <CompactPostCard
                  post={post}
                  postNumber={restNumbers[i]}
                  index={i}
                  animate={i === 0}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { SkeletonFeatured, SkeletonCompact }
