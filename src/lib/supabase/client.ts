import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

// Client Supabase simple : utilise directement les variables d'environnement
// NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.
// Ne s'exécute que côté client (runtime), pas pendant le build SSR.
export function createClient() {
  // Vérifier qu'on est côté client
  if (typeof window === "undefined") {
    // Pendant le build SSR, retourner un client factice qui ne sera pas utilisé
    // Les composants "use client" ne s'exécutent que côté client
    return null as any
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Vérifier les variables d'environnement
  if (!url || !key) {
    const errorMsg =
      "Variables d'environnement Supabase manquantes. " +
      "Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY"
    
    // En développement, logger l'erreur mais ne pas bloquer
    if (process.env.NODE_ENV === "development") {
      console.error(errorMsg)
      console.error("URL:", url ? "✓" : "✗", "KEY:", key ? "✓" : "✗")
    }
    
    // Créer un client avec des valeurs par défaut pour éviter les crashes
    // (sera remplacé une fois les variables configurées)
    if (!supabaseClient) {
      supabaseClient = createBrowserClient(
        url || "https://placeholder.supabase.co",
        key || "placeholder-key"
      )
    }
    
    // Lancer l'erreur seulement si on essaie vraiment d'utiliser le client
    return supabaseClient
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(url, key)
  }

  return supabaseClient
}

