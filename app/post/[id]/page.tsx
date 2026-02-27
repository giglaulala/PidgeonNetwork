import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/feed/PostCard'
import { ComposeBox } from '@/components/feed/ComposeBox'
import type { Post } from '@/types/supabase'

export const revalidate = 0

interface ThreadPageProps {
  params: { id: string }
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

async function getReplies(parentId: string): Promise<Post[]> {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true })
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const [post, replies] = await Promise.all([
    getPost(params.id),
    getReplies(params.id),
  ])

  if (!post) notFound()

  return (
    <main className="max-w-2xl mx-auto min-h-screen border-x border-border">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-dim text-xs tracking-widest hover:text-white transition-colors duration-150"
              aria-label="Back to feed"
            >
              &larr; feed
            </Link>
            <span className="text-border" aria-hidden>·</span>
            <span className="font-mono text-dim text-xs tracking-widest">
              thread
            </span>
          </div>
          <Image
            src="/logo.jpg"
            alt="PidgeonNetwork"
            width={28}
            height={28}
            className="invert opacity-40"
          />
        </div>
      </header>

      {/* Original post */}
      <section aria-label="Original post">
        <PostCard post={post} replyCount={replies.length} showReplies={false} />
      </section>

      {/* Reply compose */}
      <ComposeBox
        parentId={post.id}
        placeholder="add a reply. still anonymous."
      />

      {/* Replies */}
      {replies.length > 0 && (
        <section aria-label="Replies">
          <div className="px-4 py-3 border-b border-border">
            <span className="font-mono text-dim text-[11px] tracking-widest uppercase">
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </span>
          </div>
          {replies.map((reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              showReplies={false}
            />
          ))}
        </section>
      )}

      {replies.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="font-mono text-dim text-[11px] tracking-widest uppercase">
            no replies yet
          </p>
        </div>
      )}
    </main>
  )
}
