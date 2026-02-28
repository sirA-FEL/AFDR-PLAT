"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { Package, ShoppingCart, ArrowRight, Car } from "lucide-react"
import { hasRole } from "@/lib/auth/niveau-acces"

export default function LogistiquePage() {
  const [stats, setStats] = useState({
    demandesEnAttente: 0,
    demandesApprouvees: 0,
  })
  const [roles, setRoles] = useState<string[]>([])

  useEffect(() => {
    loadUser()
    loadStats()
  }, [])

  const loadUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: rolesData } = await supabase.from("roles_utilisateurs").select("role").eq("id_utilisateur", user.id)
      setRoles((rolesData ?? []).map((r) => r.role))
    } catch {
      // ignore
    }
  }

  const loadStats = async () => {
    try {
      const { demandesAchatService } = await import("@/lib/supabase/services")
      const enAttente = await demandesAchatService.getAll({ statut: "en_attente" })
      const approuvees = await demandesAchatService.getAll({ statut: "approuvee" })
      setStats({
        demandesEnAttente: enAttente.length,
        demandesApprouvees: approuvees.length,
      })
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 space-y-6"
    >
      <div className="bg-gradient-to-r from-[#2D7A32] to-[#4CAF50] rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Logistique</h1>
        <p className="text-white/90 text-lg">Gestion des besoins et achats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Demandes en attente</p>
                <p className="text-4xl font-bold text-[#2D7A32]">{stats.demandesEnAttente}</p>
              </div>
              <Package className="h-12 w-12 text-[#2D7A32]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Demandes approuvées</p>
                <p className="text-4xl font-bold text-green-600">{stats.demandesApprouvees}</p>
              </div>
              <ShoppingCart className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/logistique/besoins/nouveau">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Package className="h-6 w-6" />
                <span>Nouvelle demande</span>
              </Button>
            </Link>
            <Link href="/logistique/besoins">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <span>Voir toutes les demandes</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {hasRole(roles, ["LOG", "DIR"]) && (
              <Link href="/logistique/vehicules">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Car className="h-6 w-6" />
                  <span>Parc automobile</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
