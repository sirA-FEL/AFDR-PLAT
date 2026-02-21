"use client"

export const dynamic = "force-dynamic"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { scaleIn, transitionBounce } from "@/lib/utils/motion-variants"

const MIN_PASSWORD_LENGTH = 6

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState<boolean | null>(null)
  const router = useRouter()

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null as any
    return createClient()
  }, [])

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (session) {
        setSessionReady(true)
        return
      }
      const hashParams = typeof window !== "undefined" ? window.location.hash : ""
      const searchParams = typeof window !== "undefined" ? window.location.search : ""
      const hasToken = hashParams.includes("access_token") || hashParams.includes("type=recovery") || searchParams.includes("token_hash") || searchParams.includes("type=recovery")
      if (hasToken) {
        const retry = async (attempt: number) => {
          if (cancelled || attempt > 4) {
            if (!cancelled) setSessionReady(false)
            return
          }
          await new Promise((r) => setTimeout(r, 500))
          if (cancelled) return
          const { data: { session: s } } = await supabase.auth.getSession()
          if (cancelled) return
          if (s) {
            setSessionReady(true)
            return
          }
          retry(attempt + 1)
        }
        retry(0)
      } else {
        setSessionReady(false)
      }
    }
    checkSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled && session) setSessionReady(true)
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`)
      return
    }
    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)
    if (!supabase) {
      setError("Client Supabase non initialisé")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      await supabase.auth.signOut()
      router.replace("/login?reset=success")
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  if (sessionReady === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2D7A32]/10 via-white to-[#4CAF50]/5 p-4 animate-gradient">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-md text-center"
        >
          <Card className="shadow-xl border-[#2D7A32]/30">
            <CardContent className="pt-8 pb-8">
              <p className="text-[#757575]">Vérification du lien en cours...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (sessionReady === false) {
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
              <CardTitle className="text-2xl font-bold text-[#1B5E20]">
                Lien invalide ou expiré
              </CardTitle>
              <CardDescription className="text-[#757575]">
                Ce lien de réinitialisation n&apos;est plus valide. Demandez-en un nouveau.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link
                href="/forgot-password"
                className="text-[#2D7A32] hover:text-[#1B5E20] hover:underline font-medium"
              >
                Demander un nouveau lien
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
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
              <span className="text-2xl font-bold text-white">A</span>
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
              <h2 className="text-xl font-semibold text-[#212121]">
                Nouveau mot de passe
              </h2>
              <p className="text-sm text-[#757575] mt-1">
                Choisissez un nouveau mot de passe pour votre compte
              </p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
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
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#212121]"
                >
                  Nouveau mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#2D7A32]/20 focus:border-[#2D7A32] focus:ring-[#2D7A32]"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-2"
              >
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-[#212121]"
                >
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-[#2D7A32]/20 focus:border-[#2D7A32] focus:ring-[#2D7A32]"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  type="submit"
                  className="w-full text-base py-6"
                  disabled={loading}
                  loading={loading}
                >
                  {loading ? "Enregistrement..." : "Réinitialiser le mot de passe"}
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
                  Lien invalide ? Demander un nouveau lien
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
