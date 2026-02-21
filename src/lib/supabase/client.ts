import { createBrowserClient } from "@supabase/ssr"

const getConfig = () => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
})

/**
 * Client Supabase pour le navigateur.
 * Si accessToken est fourni, l'utilise pour chaque requête (évite les soucis RLS avec auth.uid()).
 */
export function createClient(accessToken?: string | null) {
  if (typeof window === "undefined") {
    return null as any
  }

  const { url, key } = getConfig()
  const options =
    accessToken ?
      {
        isSingleton: false,
        global: {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      }
    : undefined

  return createBrowserClient(url, key, options)
}

