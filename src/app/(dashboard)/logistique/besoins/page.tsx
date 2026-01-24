"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { Package, Plus, Search, Filter } from "lucide-react"

interface DemandeAchat {
  id: string
  objet: string
  montant_estime?: number
  urgence: "faible" | "normale" | "elevee" | "critique"
  statut: "brouillon" | "en_attente" | "en_cours" | "approuvee" | "rejetee" | "terminee"
  created_at: string
}

export default function BesoinsPage() {
  const [demandes, setDemandes] = useState<DemandeAchat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatut, setFilterStatut] = useState<string>("all")

  useEffect(() => {
    loadDemandes()
  }, [filterStatut])

  const loadDemandes = async () => {
    setLoading(true)
    try {
      const { demandesAchatService } = await import("@/lib/supabase/services")
      const data = await demandesAchatService.getAll({
        statut: filterStatut !== "all" ? filterStatut as any : undefined,
      })
      setDemandes(data)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDemandes = demandes.filter((demande) =>
    demande.objet.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatutBadge = (statut: DemandeAchat["statut"]) => {
    const styles = {
      brouillon: "bg-gray-100 text-gray-800 border-gray-300",
      en_attente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      en_cours: "bg-blue-100 text-blue-800 border-blue-300",
      approuvee: "bg-green-100 text-green-800 border-green-300",
      rejetee: "bg-red-100 text-red-800 border-red-300",
      terminee: "bg-purple-100 text-purple-800 border-purple-300",
    }
    const labels = {
      brouillon: "Brouillon",
      en_attente: "En attente",
      en_cours: "En cours",
      approuvee: "Approuvée",
      rejetee: "Rejetée",
      terminee: "Terminée",
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[statut]}`}>
        {labels[statut]}
      </span>
    )
  }

  const getUrgenceBadge = (urgence: DemandeAchat["urgence"]) => {
    const styles = {
      faible: "bg-gray-100 text-gray-800",
      normale: "bg-blue-100 text-blue-800",
      elevee: "bg-orange-100 text-orange-800",
      critique: "bg-red-100 text-red-800",
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[urgence]}`}>
        {urgence.toUpperCase()}
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
          <h1 className="text-3xl font-bold text-[#2D7A32]">Demandes d'achat</h1>
          <p className="text-gray-600 mt-1">Gérez vos besoins logistiques</p>
        </div>
        <Link href="/logistique/besoins/nouveau">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle demande
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
                placeholder="Rechercher par objet..."
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
              <option value="brouillon">Brouillon</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="approuvee">Approuvée</option>
              <option value="rejetee">Rejetée</option>
              <option value="terminee">Terminée</option>
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
      ) : filteredDemandes.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune demande trouvée</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDemandes.map((demande) => (
            <Card key={demande.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{demande.objet}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      {getStatutBadge(demande.statut)}
                      {getUrgenceBadge(demande.urgence)}
                    </div>
                    {demande.montant_estime && (
                      <p className="text-gray-600">
                        Montant estimé: {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(demande.montant_estime)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(demande.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
