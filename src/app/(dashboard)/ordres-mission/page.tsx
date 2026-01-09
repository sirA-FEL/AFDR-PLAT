"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { FileText, Plus, Search, Filter, Download } from "lucide-react"

interface OrdreMission {
  id: string
  destination: string
  dateDebut: string
  dateFin: string
  motif: string
  statut: "brouillon" | "en_attente" | "approuve" | "rejete" | "en_cours" | "termine"
  demandeur: string
  dateCreation: string
}

export default function OrdresMissionPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatut, setFilterStatut] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [ordres, setOrdres] = useState<OrdreMission[]>([])

  useEffect(() => {
    loadOrdres()
  }, [filterStatut])

  const loadOrdres = async () => {
    setLoading(true)
    try {
      const { ordresMissionService } = await import("@/lib/supabase/services")
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const data = await ordresMissionService.getAll({
        statut: filterStatut !== "all" ? filterStatut as any : undefined,
      })

      // Charger les profils des demandeurs
      const ordresAvecProfils = await Promise.all(
        data.map(async (o) => {
          const { data: profil } = await supabase
            .from("profils")
            .select("nom, prenom")
            .eq("id", o.id_demandeur)
            .single()

          return {
            id: o.id,
            destination: o.destination,
            dateDebut: o.date_debut,
            dateFin: o.date_fin,
            motif: o.motif,
            statut: o.statut,
            demandeur: profil ? `${profil.prenom} ${profil.nom}` : "Inconnu",
            dateCreation: o.date_creation,
          }
        })
      )

      setOrdres(ordresAvecProfils)
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrdres = ordres.filter((ordre) => {
    const matchesSearch =
      ordre.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordre.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordre.demandeur.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatut === "all" || ordre.statut === filterStatut
    return matchesSearch && matchesFilter
  })

  const getStatutBadge = (statut: OrdreMission["statut"]) => {
    const styles: Record<OrdreMission["statut"], string> = {
      brouillon: "bg-gray-100 text-gray-800 border-gray-300",
      en_attente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approuve: "bg-green-100 text-green-800 border-green-300",
      rejete: "bg-red-100 text-red-800 border-red-300",
      en_cours: "bg-blue-100 text-blue-800 border-blue-300",
      termine: "bg-purple-100 text-purple-800 border-purple-300",
    }
    const labels: Record<OrdreMission["statut"], string> = {
      brouillon: "Brouillon",
      en_attente: "En attente",
      approuve: "Approuvé",
      rejete: "Rejeté",
      en_cours: "En cours",
      termine: "Terminé",
    }
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[statut]}`}
      >
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D7A32]">Ordres de Mission</h1>
          <p className="text-gray-600 mt-1">Gérez les demandes d'ordres de mission</p>
        </div>
        <Link href="/ordres-mission/nouveau">
          <Button size="lg" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouvel ordre de mission
          </Button>
        </Link>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par destination, motif, demandeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="approuve">Approuvé</option>
                <option value="rejete">Rejeté</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des ordres de mission</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : filteredOrdres.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun ordre de mission trouvé</p>
              <p className="text-gray-400 text-sm mt-2">
                {ordres.length === 0
                  ? "Créez votre premier ordre de mission pour commencer"
                  : "Aucun résultat ne correspond à vos critères de recherche"}
              </p>
              {ordres.length === 0 && (
                <Link href="/ordres-mission/nouveau" className="inline-block mt-4">
                  <Button>Créer un ordre de mission</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Destination</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Dates</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Motif</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Demandeur</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrdres.map((ordre) => (
                    <tr
                      key={ordre.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{ordre.destination}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div>{new Date(ordre.dateDebut).toLocaleDateString("fr-FR")}</div>
                        <div className="text-gray-400">
                          au {new Date(ordre.dateFin).toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                          {ordre.motif}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{ordre.demandeur}</td>
                      <td className="py-4 px-4">{getStatutBadge(ordre.statut)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                          {ordre.statut === "en_attente" && (
                            <Button variant="outline" size="sm">
                              Modifier
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
