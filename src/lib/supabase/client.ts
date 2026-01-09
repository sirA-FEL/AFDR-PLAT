import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

// Client Supabase simple : utilise directement les variables d'environnement
// NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.
// La page /login est dynamique, donc ce code ne s'exécute qu'au runtime,
// avec les vraies valeurs injectées par Vercel.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      "Variables d'environnement Supabase manquantes. " +
        "Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sur Vercel."
    )
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(url, key)
  }

  return supabaseClient
}

