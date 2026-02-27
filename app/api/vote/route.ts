import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { createServiceClient } from '@/lib/supabase/service'

const FINGERPRINT_LENGTH = 64

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      postId?: unknown
      voteType?: unknown
      fingerprint?: unknown
    }

    const { postId, voteType, fingerprint } = body

    if (typeof postId !== 'string' || !postId) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }
    if (voteType !== 'up' && voteType !== 'down') {
      return NextResponse.json({ error: 'Vote type must be up or down' }, { status: 400 })
    }
    if (typeof fingerprint !== 'string' || fingerprint.length !== FINGERPRINT_LENGTH) {
      return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 })
    }

    // Anon client — insert vote (RLS allows insert when fingerprint is valid)
    const anonClient = createRouteHandlerClient()
    const { error: insertError } = await anonClient.from('votes').insert({
      post_id: postId,
      fingerprint,
      vote_type: voteType,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Already voted' }, { status: 409 })
      }
      console.error('Vote insert error:', insertError)
      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
    }

    // Service client — increment post count (bypasses RLS, server-only)
    const serviceClient = createServiceClient()
    const col = voteType === 'up' ? 'upvotes' : 'downvotes'

    const { data: post } = await serviceClient
      .from('posts')
      .select(col)
      .eq('id', postId)
      .single()

    if (post) {
      const current = (post as Record<string, number>)[col] ?? 0
      await serviceClient
        .from('posts')
        .update({ [col]: current + 1 })
        .eq('id', postId)
    }

    return NextResponse.json({ action: 'added' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
