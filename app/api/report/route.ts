import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { createServiceClient } from '@/lib/supabase/service'

const FINGERPRINT_LENGTH = 64

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      postId?: unknown
      fingerprint?: unknown
    }

    const { postId, fingerprint } = body

    if (typeof postId !== 'string' || !postId) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }
    if (typeof fingerprint !== 'string' || fingerprint.length !== FINGERPRINT_LENGTH) {
      return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 })
    }

    // Anon client — insert report (RLS allows insert when fingerprint is valid)
    const anonClient = createRouteHandlerClient()
    const { error: insertError } = await anonClient.from('reports').insert({
      post_id: postId,
      fingerprint,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Already reported' }, { status: 409 })
      }
      console.error('Report insert error:', insertError)
      return NextResponse.json({ error: 'Failed to record report' }, { status: 500 })
    }

    // Service client — increment post report count (bypasses RLS, server-only)
    const serviceClient = createServiceClient()

    const { data: post } = await serviceClient
      .from('posts')
      .select('reports')
      .eq('id', postId)
      .single()

    if (post) {
      const current = (post as Record<string, number>)['reports'] ?? 0
      await serviceClient
        .from('posts')
        .update({ reports: current + 1 })
        .eq('id', postId)
    }

    return NextResponse.json({ action: 'reported' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
