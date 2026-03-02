import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

type SetupStatus = {
  initialized: boolean
  checks: {
    supabaseEnv: boolean
    hasProfiles: boolean | null
  }
  error?: string
}

export async function GET() {
  const supabaseEnvOk = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  if (!supabaseEnvOk) {
    const payload: SetupStatus = {
      initialized: false,
      checks: {
        supabaseEnv: false,
        hasProfiles: null,
      },
      error:
        "Variables d'environnement Supabase manquantes. Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.",
    }

    return NextResponse.json(payload, { status: 200 })
  }

  try {
    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from("profils")
      .select("id", { count: "exact", head: true })

    const hasProfiles = error ? null : (count ?? 0) > 0

    const payload: SetupStatus = {
      initialized: Boolean(hasProfiles),
      checks: {
        supabaseEnv: true,
        hasProfiles,
      },
      error: error ? "Erreur lors de la vérification des profils Supabase." : undefined,
    }

    return NextResponse.json(payload, { status: error ? 500 : 200 })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur inconnue lors de la vérification du statut."

    const payload: SetupStatus = {
      initialized: false,
      checks: {
        supabaseEnv: true,
        hasProfiles: null,
      },
      error: message,
    }

    return NextResponse.json(payload, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Non implémenté" },
    { status: 501 }
  )
}

