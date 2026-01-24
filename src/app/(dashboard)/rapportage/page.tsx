"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { FileCheck, Plus, Search, Filter, AlertCircle, Calendar } from "lucide-react"

interface Rapport {
  id: string
  type_rapport: "mensuel" | "trimestriel" | "annuel" | "final"
  periode: string
  date_limite: string
  statut: "en_attente" | "soumis" | "en_retard"
}

export default function RapportagePage() {
  const [rapports, setRapports] = useState<Rapport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatut, setFilterStatut] = useState<string>("all")

  useEffect(() => {
    loadRapports()
  }, [filterStatut])

  const loadRapports = async () => {
    setLoading(true)
    try {
      const { rapportsService } = await import("@/lib/supabase/services")
      const data = await rapportsService.getAll({
        statut: filterStatut !== "all" ? filterStatut as any : undefined,
      })
      setRapports(data)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const isOverdue = (dateLimite: string) => {
    return new Date(dateLimite) < new Date() && filterStatut !== "soumis"
  }

  const filteredRapports = rapports.filter((rapport) =>
    rapport.periode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatutBadge = (rapport: Rapport) => {
    if (isOverdue(rapport.date_limite)) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-300">
          En retard
        </span>
      )
    }
    const styles = {
      en_attente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      soumis: "bg-green-100 text-green-800 border-green-300",
      en_retard: "bg-red-100 text-red-800 border-red-300",
    }
    const labels = {
      en_attente: "En attente",
      soumis: "Soumis",
      en_retard: "En retard",
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[rapport.statut]}`}>
        {labels[rapport.statut]}
      </span>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D7A32]">Rapportage</h1>
          <p className="text-gray-600 mt-1">Gérez vos rapports</p>
        </div>
        <Link href="/rapportage/nouveau">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nouveau rapport
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par période..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
              />
            </div>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="soumis">Soumis</option>
              <option value="en_retard">En retard</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-gray-500">Chargement...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredRapports.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FileCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun rapport trouvé</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRapports.map((rapport) => (
            <Card key={rapport.id} className={isOverdue(rapport.date_limite) ? "border-l-4 border-l-red-500" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg capitalize">{rapport.type_rapport}</h3>
                      {isOverdue(rapport.date_limite) && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">Période: {rapport.periode}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Date limite: {new Date(rapport.date_limite).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatutBadge(rapport)}
                    <Button variant="outline" size="sm">
                      Voir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
