"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { FolderOpen, Calendar, MapPin, ChevronRight } from "lucide-react"

export default function PartenairePage() {
  const [loading, setLoading] = useState(true)
  const [projets, setProjets] = useState<any[]>([])

  useEffect(() => {
    loadProjets()
  }, [])

  const loadProjets = async () => {
    setLoading(true)
    try {
      const { partenairesProjetService } = await import("@/lib/supabase/services")
      const data = await partenairesProjetService.getProjetsPartagesPourUtilisateur()
      setProjets(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
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
      <div>
        <h1 className="text-3xl font-bold text-[#2D7A32]">Espace partenaire</h1>
        <p className="text-gray-600 mt-1">
          Projets qui vous sont partagés par AFDR (lecture seule)
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : projets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun projet partagé avec vous pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projets.map((p) => (
            <Link key={p.id} href={`/partenaire/projets/${p.id}`}>
              <Card className="hover:border-[#2D7A32]/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{p.nom}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  {p.zones_intervention && (Array.isArray(p.zones_intervention) ? p.zones_intervention.length > 0 : true) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>
                        {Array.isArray(p.zones_intervention)
                          ? p.zones_intervention.join(", ")
                          : p.zones_intervention}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      {p.date_debut && new Date(p.date_debut).toLocaleDateString("fr-FR")} –{" "}
                      {p.date_fin && new Date(p.date_fin).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}
