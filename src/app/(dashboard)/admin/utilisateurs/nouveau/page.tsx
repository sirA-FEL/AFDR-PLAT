"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { ArrowLeft } from "lucide-react"

export default function NouveauUtilisateurPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/admin/utilisateurs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#2D7A32]">Nouvel utilisateur</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Création d&apos;utilisateur</CardTitle>
          <p className="text-sm text-[#757575]">
            Cette page est en cours de configuration.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => router.push("/admin/utilisateurs")}
          >
            Retour à la liste des utilisateurs
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
