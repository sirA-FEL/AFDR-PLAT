"use client"

export const dynamic = "force-dynamic"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { scaleIn, transitionBounce } from "@/lib/utils/motion-variants"
import { LogoAfdr } from "@/components/ui/logo-afdr"

export default function SetupPage() {
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
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={transitionBounce}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-lg ring-2 ring-[#2D7A32]/20"
            >
              <LogoAfdr variant="card" className="h-full w-full object-contain p-1" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold text-[#1B5E20]">
                Configuration
              </CardTitle>
              <CardDescription className="text-base mt-2 text-[#757575]">
                Page de configuration – Plateforme AFDR
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[#757575] text-center">
              Cette page est en cours de configuration.
            </p>
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href="/login">Retour à la connexion</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
