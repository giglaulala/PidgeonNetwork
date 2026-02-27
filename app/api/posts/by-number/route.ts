import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const raw = searchParams.get('n')

  if (!raw) {
    return NextResponse.json({ error: 'Missing post number' }, { status: 400 })
  }

  const n = parseInt(raw, 10)
  if (isNaN(n) || n < 1) {
    return NextResponse.json({ error: 'Invalid post number' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient()

  // Get total count of top-level posts
  const { count, error: countError } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .is('parent_id', null)

  if (countError || count === null) {
    return NextResponse.json({ error: 'Failed to count posts' }, { status: 500 })
  }

  if (n > count) {
    return NextResponse.json({ error: `Post ${n} does not exist yet` }, { status: 404 })
  }

  // Post #n is at offset (n-1) in ASC order
  const offset = n - 1
  const { data, error } = await supabase
    .from('posts')
    .select('id')
    .is('parent_id', null)
    .order('created_at', { ascending: true })
    .range(offset, offset)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({ id: data.id, number: n })
}
