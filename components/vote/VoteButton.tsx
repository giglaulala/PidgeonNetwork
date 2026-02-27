'use client'

import { cn } from '@/lib/utils'

interface VoteButtonProps {
  type: 'up' | 'down'
  count: number
  active?: boolean
  onClick: () => void
  disabled?: boolean
}

export function VoteButton({ type, count, active, onClick, disabled }: VoteButtonProps) {
  const isUp = type === 'up'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isUp ? 'Upvote' : 'Downvote'}
      className={cn(
        'flex items-center gap-1.5 font-mono text-xs tracking-widest transition-colors duration-150',
        'disabled:cursor-not-allowed',
        active
          ? isUp
            ? 'text-white'
            : 'text-muted'
          : 'text-dim hover:text-white',
      )}
    >
      <span className="text-[13px] leading-none" aria-hidden>
        {isUp ? '+' : '-'}
      </span>
      <span>{count}</span>
    </button>
  )
}
