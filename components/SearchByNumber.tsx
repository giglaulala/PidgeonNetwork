'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { parsePostNumber, formatPostNumber } from '@/lib/utils'

type Status = 'idle' | 'loading' | 'error'

export function SearchByNumber() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleClose() {
    setOpen(false)
    setValue('')
    setStatus('idle')
    setErrorMsg('')
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim() || status === 'loading') return

    const n = parsePostNumber(value.trim())
    if (n === null) {
      setStatus('error')
      setErrorMsg('invalid format — try #1 or #A1')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch(`/api/posts/by-number?n=${n}`)
      const data = await res.json() as { id?: string; error?: string }

      if (!res.ok || !data.id) {
        setStatus('error')
        setErrorMsg(data.error ?? `${formatPostNumber(n)} not found`)
        return
      }

      handleClose()
      router.push(`/post/${data.id}`)
    } catch {
      setStatus('error')
      setErrorMsg('something went wrong')
    } finally {
      if (status !== 'error') setStatus('idle')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') handleClose()
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        aria-label="Search by post number"
        className="font-mono text-[10px] tracking-[0.15em] uppercase text-dim hover:text-white
                   transition-colors duration-150 border border-border px-2 py-1 hover:border-white"
      >
        jump to #
      </button>

      {/* Overlay modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" aria-hidden />

          {/* Dialog */}
          <div className="relative w-full max-w-sm border border-white bg-surface">
            {/* Dialog header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
                jump to dispatch
              </span>
              <button
                onClick={handleClose}
                aria-label="Close search"
                className="font-mono text-dim text-xs hover:text-white transition-colors duration-150"
              >
                esc
              </button>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className="p-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value)
                    setStatus('idle')
                    setErrorMsg('')
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="#42 or #A1"
                  className="flex-1 bg-transparent border border-border focus:border-white
                             outline-none font-mono text-white text-sm px-3 py-2
                             placeholder:text-dim transition-colors duration-150"
                  aria-label="Post number"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={!value.trim() || status === 'loading'}
                  className="px-4 py-2 bg-white text-ink font-mono text-xs tracking-widest uppercase
                             hover:bg-fog transition-colors duration-150
                             disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? '...' : 'go'}
                </button>
              </div>

              {/* Error / hint */}
              <div className="mt-2 min-h-[1.2rem]">
                {status === 'error' ? (
                  <p className="font-mono text-[11px] text-dim">{errorMsg}</p>
                ) : (
                  <p className="font-mono text-[11px] text-border">
                    #1 – #100, then #A1 – #A100, #B1…
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
