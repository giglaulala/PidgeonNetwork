const KEY = 'reported_posts'

function read(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function write(set: Set<string>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(Array.from(set)))
}

export function hasReportedPost(postId: string): boolean {
  return read().has(postId)
}

export function markReported(postId: string): void {
  const set = read()
  set.add(postId)
  write(set)
}
