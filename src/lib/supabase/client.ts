import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Récupérer les variables d'environnement
  // Pendant le build sur Vercel, elles peuvent ne pas être disponibles immédiatement
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || (typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_URL : undefined)
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined)
  
  // Si les variables ne sont pas disponibles (pendant le build), utiliser des valeurs placeholder
  // qui permettront au build de passer, mais le client ne fonctionnera pas (ce qui est OK car la page est dynamique)
  const finalUrl = url || 'https://placeholder.supabase.co'
  const finalKey = key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

  // Côté client, créer le client une seule fois (singleton)
  if (typeof window !== 'undefined') {
    if (!supabaseClient) {
      supabaseClient = createBrowserClient(finalUrl, finalKey)
    }
    return supabaseClient
  }
  
  // Côté serveur (pendant le build), créer un nouveau client à chaque fois
  // Ce client ne sera pas utilisé car la page est dynamique
  return createBrowserClient(finalUrl, finalKey)
}

