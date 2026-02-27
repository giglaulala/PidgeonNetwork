'use client'

import { cn } from '@/lib/utils'

interface ReportButtonProps {
  hasReported?: boolean
  onClick: () => void
  disabled?: boolean
}

export function ReportButton({ hasReported, onClick, disabled }: ReportButtonProps) {
  const locked = hasReported || disabled

  return (
    <button
      onClick={onClick}
      disabled={locked}
      aria-label="Report"
      title={hasReported ? 'already reported' : 'report'}
      className={cn(
        'flex items-center gap-1.5 font-mono text-xs tracking-widest transition-opacity duration-150',
        locked
          ? 'opacity-30 cursor-not-allowed'
          : 'text-dim hover:text-red-400 cursor-pointer',
      )}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="currentColor"
        aria-hidden
        className="shrink-0"
      >
        <path d="M1 1h7l-1.5 3L8 7H1V1z" />
        <rect x="1" y="9" width="1" height="2" />
      </svg>
    </button>
  )
}
