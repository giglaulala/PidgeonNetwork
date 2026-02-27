'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export type FeedTab = 'stroll' | 'leaderboard'

const TABS: { id: FeedTab; label: string; sub: string }[] = [
  { id: 'stroll',      label: 'stroll',      sub: 'fresh' },
  { id: 'leaderboard', label: 'leaderboard', sub: 'top'   },
]

export function FeedTabs({ active }: { active: FeedTab }) {
  const router = useRouter()

  return (
    <div className="flex border-b border-border">
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() =>
              router.push(tab.id === 'stroll' ? '/' : `/?tab=${tab.id}`)
            }
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4',
              'font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-150',
              'border-b-2 -mb-px',
              isActive
                ? 'text-white border-white'
                : 'text-dim hover:text-muted border-transparent',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'font-mono text-[9px] tracking-[0.1em] uppercase px-1 py-px border',
                isActive ? 'text-dim border-border' : 'text-border border-border/50',
              )}
            >
              {tab.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}
