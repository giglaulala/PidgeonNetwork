'use client'

import { cn } from '@/lib/utils'

interface VoteButtonProps {
  type: 'up' | 'down'
  count: number
  active?: boolean
  hasVoted?: boolean
  onClick: () => void
  disabled?: boolean
}

export function VoteButton({ type, count, active, hasVoted, onClick, disabled }: VoteButtonProps) {
  const isUp = type === 'up'
  const locked = hasVoted || disabled

  return (
    <button
      onClick={onClick}
      disabled={locked}
      aria-label={isUp ? 'Upvote' : 'Downvote'}
      title={hasVoted ? 'already voted' : undefined}
      className={cn(
        'flex items-center gap-1.5 font-mono text-xs tracking-widest transition-opacity duration-150',
        locked
          ? 'opacity-30 cursor-not-allowed'
          : active
          ? 'text-white'
          : 'text-dim hover:text-white cursor-pointer',
        disabled && !hasVoted && 'opacity-50',
      )}
    >
      <span className="text-[13px] leading-none" aria-hidden>
        {isUp ? '+' : '-'}
      </span>
      <span>{count}</span>
    </button>
  )
}
