"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LogIn, FileText, Users, Shield } from "lucide-react"
import { LogoAfdr } from "@/components/ui/logo-afdr"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#2D7A32]/10 via-white to-[#4CAF50]/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-lg text-center"
      >
        <div className="mb-8 flex justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex h-24 w-24 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-xl ring-2 ring-[#2D7A32]/20"
          >
            <LogoAfdr variant="card" className="h-full w-full object-contain p-2" />
          </motion.div>
        </div>
        <h1 className="text-3xl font-bold text-[#1B5E20] sm:text-4xl">
          Plateforme AFDR
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Association Formation Développement Ruralité
        </p>
        <p className="mt-6 text-sm text-gray-500">
          Utilisateurs (niveau 1), responsables et direction : connectez-vous pour accéder à vos ordres de mission et à la plateforme.
        </p>

        <div className="mt-10 space-y-4">
          <Link href="/login">
            <Button
              size="lg"
              className="w-full max-w-xs gap-2 bg-[#2D7A32] hover:bg-[#1B5E20]"
            >
              <LogIn className="h-5 w-5" />
              Se connecter
            </Button>
          </Link>
          <p className="text-xs text-gray-400">
            <Link href="/forgot-password" className="text-[#2D7A32] hover:underline">
              Mot de passe oublié ?
            </Link>
          </p>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
          <div className="flex flex-col items-center gap-1">
            <FileText className="h-8 w-8 text-[#2D7A32]/60" />
            <span>Ordres de mission</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="h-8 w-8 text-[#2D7A32]/60" />
            <span>Équipes</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Shield className="h-8 w-8 text-[#2D7A32]/60" />
            <span>Validation</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
