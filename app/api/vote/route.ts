import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      postId?: unknown
      voteType?: unknown
      hashedAnonId?: unknown
    }

    const { postId, voteType, hashedAnonId } = body

    if (typeof postId !== 'string' || !postId) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    if (voteType !== 'up' && voteType !== 'down') {
      return NextResponse.json({ error: 'Vote type must be up or down' }, { status: 400 })
    }

    if (typeof hashedAnonId !== 'string' || hashedAnonId.length !== 64) {
      return NextResponse.json({ error: 'Invalid identity' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient()

    // Check if vote already exists
    const { data: existing } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('post_id', postId)
      .eq('anon_id', hashedAnonId)
      .maybeSingle()

    if (existing) {
      if (existing.vote_type === voteType) {
        // Toggle off — delete vote and decrement count
        await supabase.from('votes').delete().eq('id', existing.id)
        await supabase.rpc('decrement_vote', {
          p_post_id: postId,
          p_vote_type: voteType,
        })
        return NextResponse.json({ action: 'removed' })
      } else {
        // Switch vote
        await supabase.from('votes').update({ vote_type: voteType }).eq('id', existing.id)
        await supabase.rpc('switch_vote', {
          p_post_id: postId,
          p_old_type: existing.vote_type,
          p_new_type: voteType,
        })
        return NextResponse.json({ action: 'switched' })
      }
    }

    // New vote
    const { error: insertError } = await supabase.from('votes').insert({
      post_id: postId,
      anon_id: hashedAnonId,
      vote_type: voteType,
    })

    if (insertError) {
      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
    }

    await supabase.rpc('increment_vote', {
      p_post_id: postId,
      p_vote_type: voteType,
    })

    return NextResponse.json({ action: 'added' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
