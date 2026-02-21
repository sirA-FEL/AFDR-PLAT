"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { FileText, Search, Filter, Download, Edit, Trash2, Eye, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ordresMissionService, type OrdreMission } from "@/lib/supabase/services"

interface OrdreMissionDisplay {
  id: string
  destination: string
  dateDebut: string
  dateFin: string
  motif: string
  statut: "brouillon" | "en_attente" | "approuve" | "rejete" | "en_cours" | "termine"
  dateCreation: string
  dateModification?: string
  pdfUrl?: string
}

export default function MesOrdresPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatut, setFilterStatut] = useState<string>("all")
  const [filterPeriode, setFilterPeriode] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [ordres, setOrdres] = useState<OrdreMissionDisplay[]>([])
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  useEffect(() => {
    loadOrdres()
  }, [filterPeriode])

  const loadOrdres = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const periode = filterPeriode !== "all" ? filterPeriode as "mois" | "trimestre" | "annee" : undefined
      const data = await ordresMissionService.getAll({
        id_demandeur: user.id,
        periode,
      })

      const transformedData = data.map((o) => ({
        id: o.id,
        destination: o.destination,
        dateDebut: o.date_debut,
        dateFin: o.date_fin,
        motif: o.motif,
        statut: o.statut,
        dateCreation: o.date_creation,
        dateModification: o.date_modification,
        pdfUrl: o.pdf_url,
      }))

      setOrdres(transformedData)
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string }
      console.error("Erreur lors du chargement:", err?.message ?? err?.code ?? String(error))
    } finally {
      setLoading(false)
    }
  }

  const filteredOrdres = ordres.filter((ordre) => {
    const matchesSearch =
      ordre.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordre.motif.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatut === "all" || ordre.statut === filterStatut
    const matchesPeriode =
      filterPeriode === "all" ||
      (filterPeriode === "mois" &&
        new Date(ordre.dateCreation) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (filterPeriode === "trimestre" &&
        new Date(ordre.dateCreation) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
      (filterPeriode === "annee" &&
        new Date(ordre.dateCreation) >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
    return matchesSearch && matchesFilter && matchesPeriode
  })

  const getStatutBadge = (statut: OrdreMission["statut"]) => {
    const styles = {
      brouillon: "bg-gray-100 text-gray-800 border-gray-300",
      en_attente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approuve: "bg-green-100 text-green-800 border-green-300",
      rejete: "bg-red-100 text-red-800 border-red-300",
      en_cours: "bg-blue-100 text-blue-800 border-blue-300",
      termine: "bg-purple-100 text-purple-800 border-purple-300",
    }
    const labels = {
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

  const handleSoumettre = async (ordre: OrdreMissionDisplay) => {
    if (ordre.statut !== "brouillon") return
    setSubmittingId(ordre.id)
    try {
      await ordresMissionService.submit(ordre.id)
      await loadOrdres()
      alert("Ordre de mission soumis. Il est en attente de validation.")
    } catch (err: unknown) {
      const e = err as { message?: string }
      alert(e?.message ?? "Erreur lors de la soumission.")
    } finally {
      setSubmittingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet ordre de mission ?")) {
      return
    }

    try {
      await ordresMissionService.delete(id)
      await loadOrdres()
      alert("Ordre de mission supprimé avec succès")
    } catch (error: any) {
      console.error("Erreur:", error)
      alert(error.message || "Erreur lors de la suppression")
    }
  }

  const handleDownloadPDF = async (ordre: OrdreMissionDisplay) => {
    setGeneratingPdfId(ordre.id)
    try {
      if (ordre.pdfUrl) {
        const signedUrl = await ordresMissionService.getSignedPdfUrl(ordre.id)
        window.open(signedUrl, "_blank")
        setGeneratingPdfId(null)
        return
      }
      const ordreFull = await ordresMissionService.getById(ordre.id)
      const { generateOrdreMissionPdf } = await import("@/lib/ordres-mission/generate-pdf")
      const blob = await generateOrdreMissionPdf(ordreFull)
      const pdfPath = await ordresMissionService.uploadPdf(ordre.id, blob)
      await ordresMissionService.setPdfUrl(ordre.id, pdfPath)
      const idx = ordres.findIndex((o) => o.id === ordre.id)
      if (idx >= 0) {
        const next = [...ordres]
        next[idx] = { ...next[idx], pdfUrl: pdfPath }
        setOrdres(next)
      }
      const signedUrl = await ordresMissionService.getSignedPdfUrl(ordre.id)
      window.open(signedUrl, "_blank")
    } catch (err) {
      console.error(err)
      alert("Impossible de générer le PDF.")
    } finally {
      setGeneratingPdfId(null)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D7A32]">Mes ordres de mission</h1>
          <p className="text-gray-600 mt-1">Suivez l'historique et le statut de vos demandes</p>
        </div>
        <Link href="/ordres-mission/nouveau">
          <Button size="lg">Nouvel ordre de mission</Button>
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
                placeholder="Rechercher par destination, motif..."
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
                <option value="brouillon">Brouillon</option>
                <option value="en_attente">En attente</option>
                <option value="approuve">Approuvé</option>
                <option value="rejete">Rejeté</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
            <select
              value={filterPeriode}
              onChange={(e) => setFilterPeriode(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent"
            >
              <option value="all">Toutes les périodes</option>
              <option value="mois">Dernier mois</option>
              <option value="trimestre">Dernier trimestre</option>
              <option value="annee">Dernière année</option>
            </select>
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
          <CardTitle>Historique de mes ordres de mission</CardTitle>
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date création</th>
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
                      <td className="py-4 px-4">{getStatutBadge(ordre.statut)}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(ordre.dateCreation).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title={ordre.pdfUrl ? "Télécharger le PDF" : "Générer le PDF"}
                            onClick={() => handleDownloadPDF(ordre)}
                            disabled={generatingPdfId === ordre.id}
                          >
                            {generatingPdfId === ordre.id ? (
                              <span className="text-xs">...</span>
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <Link href={`/ordres-mission/${ordre.id}`}>
                            <Button variant="ghost" size="sm" title="Voir les détails">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {ordre.statut === "brouillon" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                title="Soumettre pour validation"
                                onClick={() => handleSoumettre(ordre)}
                                disabled={submittingId === ordre.id}
                                className="flex items-center gap-1"
                              >
                                {submittingId === ordre.id ? (
                                  <span className="text-xs">...</span>
                                ) : (
                                  <>
                                    <Send className="h-3.5 w-3.5" />
                                    Soumettre
                                  </>
                                )}
                              </Button>
                              <Link href={`/ordres-mission/nouveau?edit=${ordre.id}`}>
                                <Button variant="ghost" size="sm" title="Modifier">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Supprimer"
                                onClick={() => handleDelete(ordre.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
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
