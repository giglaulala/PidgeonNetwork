import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Feed } from '@/components/feed/Feed'
import { ComposeBox } from '@/components/feed/ComposeBox'
import { SearchByNumber } from '@/components/SearchByNumber'
import type { Post } from '@/types/supabase'

export const revalidate = 0

async function getPosts(): Promise<{ posts: Post[]; totalCount: number }> {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return { posts: data ?? [], totalCount: count ?? 0 }
  } catch {
    return { posts: [], totalCount: 0 }
  }
}

function getIssueDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function HomePage() {
  const { posts, totalCount } = await getPosts()
  const issueDate = getIssueDate()

  return (
    <main className="max-w-2xl mx-auto min-h-screen border-x border-border">
      {/* Masthead */}
      <header className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm border-b-2 border-white">
        {/* Top ticker bar */}
        <div className="border-b border-border px-4 py-1 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-dim">
            {issueDate}
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse" aria-hidden />
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-dim">live edition</span>
          </div>
        </div>

        {/* Main masthead */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white flex-shrink-0">
              <Image
                src="/logo.jpg"
                alt="PidgeonNetwork"
                width={52}
                height={52}
                className="object-cover scale-110"
                priority
              />
            </div>
            <div>
              <h1 className="font-display text-display-lg text-white leading-none tracking-tight">
                pidgeon
              </h1>
              <p className="font-mono text-dim text-[10px] tracking-[0.2em] uppercase mt-0.5">
                anonymous dispatches
              </p>
            </div>
          </div>

          {/* Right side: search + stats */}
          <div className="flex flex-col items-end gap-1.5">
            <SearchByNumber />
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-border">
              no names · no traces
            </p>
          </div>
        </div>
      </header>

      {/* Compose — newspaper "letters to editor" feel */}
      <div className="border-b border-border">
        <div className="px-4 pt-3 pb-0">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
            submit a dispatch
          </span>
        </div>
        <ComposeBox />
      </div>

      {/* Feed */}
      <section aria-label="Posts feed">
        <Feed initialPosts={posts} initialTotalCount={totalCount} />
      </section>
    </main>
  )
}
