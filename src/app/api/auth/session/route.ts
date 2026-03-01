import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return NextResponse.json({ user: user ?? null })
  } catch {
    return NextResponse.json({ user: null })
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Non implémenté" },
    { status: 501 }
  )
}
