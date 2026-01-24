"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { ClipboardList, Plus, Search, Filter, Star, StarOff } from "lucide-react"

interface TDR {
  id: string
  titre: string
  type_tdr: "consultant" | "prestation"
  budget?: number
  statut: "en_attente" | "en_revision" | "approuve" | "rejete"
  favori: boolean
  created_at: string
}

export default function TDRPage() {
  const [tdrs, setTdrs] = useState<TDR[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatut, setFilterStatut] = useState<string>("all")

  useEffect(() => {
    loadTDRs()
  }, [filterStatut])

  const loadTDRs = async () => {
    setLoading(true)
    try {
      const { tdrService } = await import("@/lib/supabase/services")
      const data = await tdrService.getAll({
        statut: filterStatut !== "all" ? filterStatut as any : undefined,
      })
      setTdrs(data)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavori = async (id: string) => {
    try {
      const { tdrService } = await import("@/lib/supabase/services")
      await tdrService.toggleFavori(id)
      loadTDRs()
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const filteredTDRs = tdrs.filter((tdr) =>
    tdr.titre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatutBadge = (statut: TDR["statut"]) => {
    const styles = {
      en_attente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      en_revision: "bg-blue-100 text-blue-800 border-blue-300",
      approuve: "bg-green-100 text-green-800 border-green-300",
      rejete: "bg-red-100 text-red-800 border-red-300",
    }
    const labels = {
      en_attente: "En attente",
      en_revision: "En révision",
      approuve: "Approuvé",
      rejete: "Rejeté",
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[statut]}`}>
        {labels[statut]}
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
          <h1 className="text-3xl font-bold text-[#2D7A32]">Termes de Référence</h1>
          <p className="text-gray-600 mt-1">Gérez vos TdRs</p>
        </div>
        <Link href="/tdr/nouveau">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nouveau TdR
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
                placeholder="Rechercher par titre..."
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
              <option value="en_revision">En révision</option>
              <option value="approuve">Approuvé</option>
              <option value="rejete">Rejeté</option>
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
      ) : filteredTDRs.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun TdR trouvé</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTDRs.map((tdr) => (
            <Card key={tdr.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex-1">{tdr.titre}</CardTitle>
                  <button
                    onClick={() => toggleFavori(tdr.id)}
                    className="ml-2"
                  >
                    {tdr.favori ? (
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-medium capitalize">{tdr.type_tdr}</span>
                </div>
                {tdr.budget && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Budget</span>
                    <span className="text-sm font-medium">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(tdr.budget)}
                    </span>
                  </div>
                )}
                <div>{getStatutBadge(tdr.statut)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
