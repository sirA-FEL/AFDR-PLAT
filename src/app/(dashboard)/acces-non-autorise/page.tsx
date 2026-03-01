"use client"

export const dynamic = "force-dynamic"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldX } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"

export default function AccesNonAutorisePage() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="flex min-h-[60vh] items-center justify-center p-4"
    >
      <Card className="w-full max-w-md shadow-xl border-[#C62828]/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#C62828]/10">
            <ShieldX className="h-8 w-8 text-[#C62828]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#212121]">
            Accès non autorisé
          </CardTitle>
          <CardDescription className="text-[#757575]">
            Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/">Retour au tableau de bord</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/profil">Mon profil</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
