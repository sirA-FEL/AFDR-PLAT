"use client"

// Empêche la pré-génération statique de la page /login lors du build Vercel.
// La page sera rendue dynamiquement à l'exécution, avec les variables d'environnement Supabase disponibles.
export const dynamic = "force-dynamic"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { scaleIn, slideUp, transitionNormal, transitionBounce } from "@/lib/utils/motion-variants"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get("reset") === "success"
  
  // Créer le client Supabase uniquement côté client (après le montage)
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      // Retourner null pendant le SSR/build - ne sera pas utilisé
      return null as any
    }
    return createClient()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!supabase) {
      setError("Client Supabase non initialisé")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Récupérer le rôle de l'utilisateur
        const { data: profile } = await supabase
          .from("profils")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (profile) {
          const { data: roles } = await supabase
            .from("roles_utilisateurs")
            .select("role")
            .eq("id_utilisateur", profile.id)
            .limit(1)
            .single()

          // Rediriger vers le tableau de bord principal
          router.replace("/ordres-mission")
        } else {
          router.replace("/ordres-mission")
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2D7A32]/10 via-white to-[#4CAF50]/5 p-4 animate-gradient">
      <motion.div
        initial="initial"
        animate="animate"
        variants={scaleIn}
        transition={transitionBounce}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-[#2D7A32]/30">
          <CardHeader className="text-center space-y-4 pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={transitionBounce}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2D7A32] to-[#1B5E20] shadow-lg"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-2xl font-bold text-white"
              >
                A
              </motion.span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold text-[#1B5E20]">
                Plateforme AFDR
              </CardTitle>
              <CardDescription className="text-base mt-2 text-[#757575]">
                Association Formation Développement Ruralité
              </CardDescription>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-4"
            >
              <h2 className="text-xl font-semibold text-[#212121]">Connexion</h2>
              <p className="text-sm text-[#757575] mt-1">
                Tous les utilisateurs (niveau 1, 2 et 3) : connectez-vous avec votre email et mot de passe
              </p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              {resetSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-md bg-[#2D7A32]/10 border border-[#2D7A32]/20 p-3 text-sm text-[#1B5E20]"
                >
                  Votre mot de passe a été réinitialisé. Vous pouvez vous connecter.
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-md bg-[#C62828]/10 border border-[#C62828]/20 p-3 text-sm text-[#C62828]"
                >
                  {error}
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <label htmlFor="email" className="text-sm font-medium text-[#212121]">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-[#2D7A32]/20 focus:border-[#2D7A32] focus:ring-[#2D7A32]"
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-2"
              >
                <label htmlFor="password" className="text-sm font-medium text-[#212121]">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#2D7A32]/20 focus:border-[#2D7A32] focus:ring-[#2D7A32]"
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button type="submit" className="w-full text-base py-6" disabled={loading} loading={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center text-sm"
              >
                <Link
                  href="/forgot-password"
                  className="text-[#2D7A32] hover:text-[#1B5E20] hover:underline font-medium"
                >
                  Mot de passe oublié ?
                </Link>
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-xs text-[#757575]"
        >
          <p>© 2024 AFDR - Tous droits réservés</p>
        </motion.div>
      </motion.div>
    </div>
  )
}


