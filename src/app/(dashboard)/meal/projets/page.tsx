"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { TrendingUp, Plus, Search, Filter, Calendar, DollarSign, User } from "lucide-react"

interface Projet {
  id: string
  nom: string
  code_projet: string
  date_debut: string
  date_fin: string
  budget_total: number
  id_responsable: string
  responsable?: string
  date_creation: string
}

export default function ProjetsMEALPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterResponsable, setFilterResponsable] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [projets, setProjets] = useState<Projet[]>([])
  const [responsables, setResponsables] = useState<Array<{ id: string; nom: string }>>([])

  useEffect(() => {
    loadProjets()
  }, [filterResponsable])

  const loadProjets = async () => {
    setLoading(true)
    try {
      const { projetsService } = await import("@/lib/supabase/services")
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const data = await projetsService.getAll({
        id_responsable: filterResponsable !== "all" ? filterResponsable : undefined,
      })

      // Charger les profils des responsables
      const responsablesIds = [...new Set(data.map((p) => p.id_responsable))]
      const responsablesData = await Promise.all(
        responsablesIds.map(async (id) => {
          const { data: profil } = await supabase
            .from("profils")
            .select("nom, prenom")
            .eq("id", id)
            .single()
          return { id, nom: profil ? `${profil.prenom} ${profil.nom}` : "Inconnu" }
        })
      )
      setResponsables(responsablesData)

      // Charger les profils pour chaque projet
      const projetsAvecProfils = await Promise.all(
        data.map(async (p) => {
          const { data: profil } = await supabase
            .from("profils")
            .select("nom, prenom")
            .eq("id", p.id_responsable)
            .single()

          return {
            ...p,
            responsable: profil ? `${profil.prenom} ${profil.nom}` : "Inconnu",
          }
        })
      )

      setProjets(projetsAvecProfils)
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjets = projets.filter((projet) => {
    const matchesSearch =
      projet.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.code_projet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.responsable?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterResponsable === "all" || projet.id_responsable === filterResponsable
    return matchesSearch && matchesFilter
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const getProgressPercentage = (projet: Projet) => {
    const today = new Date()
    const debut = new Date(projet.date_debut)
    const fin = new Date(projet.date_fin)
    const total = fin.getTime() - debut.getTime()
    const elapsed = today.getTime() - debut.getTime()
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
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
          <h1 className="text-3xl font-bold text-[#2D7A32]">Projets MEAL</h1>
          <p className="text-gray-600 mt-1">Gérez vos projets de suivi et évaluation</p>
        </div>
        <Link href="/meal/projets/nouveau">
          <Button size="lg" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouveau projet
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
                placeholder="Rechercher par nom, code projet, responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterResponsable}
                onChange={(e) => setFilterResponsable(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent"
              >
                <option value="all">Tous les responsables</option>
                {responsables.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des projets */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-gray-500">Chargement...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredProjets.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun projet trouvé</p>
              <p className="text-gray-400 text-sm mt-2">
                {projets.length === 0
                  ? "Créez votre premier projet MEAL pour commencer"
                  : "Aucun résultat ne correspond à vos critères de recherche"}
              </p>
              {projets.length === 0 && (
                <Link href="/meal/projets/nouveau" className="inline-block mt-4">
                  <Button>Créer un projet</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjets.map((projet) => {
            const progress = getProgressPercentage(projet)
            return (
              <Link key={projet.id} href={`/meal/projets/${projet.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{projet.nom}</CardTitle>
                        <p className="text-sm text-gray-500 font-mono">{projet.code_projet}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-[#2D7A32]" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Budget */}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{formatCurrency(projet.budget_total)}</span>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(projet.date_debut).toLocaleDateString("fr-FR")} -{" "}
                        {new Date(projet.date_fin).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    {/* Responsable */}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{projet.responsable}</span>
                    </div>

                    {/* Barre de progression */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Avancement temporel</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#2D7A32] h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
