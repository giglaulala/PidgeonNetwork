import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'

function sanitize(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim()
    .slice(0, 500)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      content?: unknown
      parentId?: unknown
      hashedAnonId?: unknown
    }

    const { content, parentId, hashedAnonId } = body

    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (typeof hashedAnonId !== 'string' || hashedAnonId.length !== 64) {
      return NextResponse.json({ error: 'Invalid identity' }, { status: 400 })
    }

    const sanitized = sanitize(content)
    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'Content is empty after sanitization' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient()

    const { data, error } = await supabase
      .from('posts')
      .insert({
        content: sanitized,
        anon_id: hashedAnonId,
        parent_id: typeof parentId === 'string' ? parentId : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({ post: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
