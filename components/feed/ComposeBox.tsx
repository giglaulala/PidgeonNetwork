'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getHashedAnonId } from '@/lib/identity'

const MAX_CHARS = 500

interface ComposeBoxProps {
  parentId?: string
  placeholder?: string
  onSuccess?: () => void
}

export function ComposeBox({
  parentId,
  placeholder = "say something. no one knows it's you.",
  onSuccess,
}: ComposeBoxProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const remaining = MAX_CHARS - content.length
  const canPost = content.trim().length > 0 && content.length <= MAX_CHARS

  async function handlePost() {
    if (!canPost || status === 'sending') return

    setStatus('sending')
    setErrorMsg('')

    try {
      const hashedAnonId = await getHashedAnonId()
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          parentId: parentId ?? null,
          hashedAnonId,
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to post')
      }

      setContent('')
      setStatus('idle')
      router.refresh()
      onSuccess?.()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handlePost()
    }
  }

  return (
    <div className="border-b border-border px-4 py-5">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={MAX_CHARS + 10}
        rows={3}
        className="w-full bg-transparent text-white text-[15px] leading-relaxed
                   border border-border focus:border-white outline-none resize-none
                   p-4 placeholder:text-dim transition-colors duration-200
                   font-body"
        aria-label="Compose anonymous post"
      />

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {status === 'error' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-dim text-xs font-mono"
              >
                {errorMsg}
              </motion.span>
            )}
          </AnimatePresence>
          <span
            className={`font-mono text-[11px] tabular-nums ${
              remaining < 50 ? 'text-muted' : 'text-dim'
            } ${remaining < 0 ? 'text-white' : ''}`}
          >
            {remaining}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-dim text-[11px] hidden sm:block">
            {navigator?.platform?.includes('Mac') ? '⌘' : 'ctrl'}+enter
          </span>
          <button
            onClick={handlePost}
            disabled={!canPost || status === 'sending'}
            className="px-5 py-2 bg-white text-ink text-sm font-medium
                       hover:bg-fog transition-colors duration-150
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? '...' : 'post'}
          </button>
        </div>
      </div>
    </div>
  )
}
