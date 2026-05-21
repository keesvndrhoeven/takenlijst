import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { action, email, password } = await req.json()
  const supabase = await createClient()

  if (action === 'logout') {
    await supabase.auth.signOut()
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
