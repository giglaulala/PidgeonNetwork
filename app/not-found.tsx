import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto min-h-screen border-x border-border flex items-center justify-center">
      <div className="text-center px-4">
        <p className="font-mono text-dim text-[11px] tracking-widest uppercase mb-4">404</p>
        <h1 className="font-display text-display-lg text-white mb-2">nothing here</h1>
        <p className="font-body text-muted text-[15px] mb-8">
          this post may have been deleted or never existed.
        </p>
        <Link
          href="/"
          className="font-mono text-dim text-xs tracking-widest hover:text-white transition-colors duration-150"
        >
          &larr; back to feed
        </Link>
      </div>
    </main>
  )
}
