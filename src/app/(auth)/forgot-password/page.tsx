"use client"

export const dynamic = "force-dynamic"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { scaleIn, transitionBounce } from "@/lib/utils/motion-variants"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null as any
    return createClient()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!supabase) {
      setError("Client Supabase non initialisé")
      setLoading(false)
      return
    }

    try {
      const redirectTo = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      if (error) throw error
      setSent(true)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.")
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
                Mot de passe oublié
              </h2>
              <p className="text-sm text-[#757575] mt-1">
                Saisissez votre adresse email pour recevoir un lien de réinitialisation
              </p>
            </motion.div>
          </CardHeader>
          <CardContent>
            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="rounded-md bg-[#2D7A32]/10 border border-[#2D7A32]/20 p-3 text-sm text-[#1B5E20]">
                  Si un compte existe pour cet email, vous recevrez un lien pour
                  réinitialiser votre mot de passe. Vérifiez votre boîte de réception
                  et vos spams.
                </div>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-[#2D7A32] hover:text-[#1B5E20] hover:underline font-medium text-sm"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              </motion.div>
            ) : (
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
                    htmlFor="email"
                    className="text-sm font-medium text-[#212121]"
                  >
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    type="submit"
                    className="w-full text-base py-6"
                    disabled={loading}
                    loading={loading}
                  >
                    {loading ? "Envoi en cours..." : "Envoyer le lien"}
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center text-sm"
                >
                  <Link
                    href="/login"
                    className="text-[#2D7A32] hover:text-[#1B5E20] hover:underline font-medium"
                  >
                    Retour à la connexion
                  </Link>
                </motion.div>
              </motion.form>
            )}
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
