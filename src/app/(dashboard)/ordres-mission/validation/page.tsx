"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { CheckCircle, XCircle, Eye, FileText, User, Calendar, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ordresMissionService, type OrdreMission } from "@/lib/supabase/services"

interface OrdreMissionDisplay {
  id: string
  destination: string
  dateDebut: string
  dateFin: string
  motif: string
  activitesPrevues?: string
  budgetEstime?: number
  demandeur: {
    nom: string
    email: string
    departement?: string
  }
  dateCreation: string
  documents?: Array<{ nom: string; url: string }>
}

export default function ValidationOrdresPage() {
  const router = useRouter()
  const [selectedOrdre, setSelectedOrdre] = useState<OrdreMissionDisplay | null>(null)
  const [commentaire, setCommentaire] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [ordresEnAttente, setOrdresEnAttente] = useState<OrdreMissionDisplay[]>([])

  useEffect(() => {
    loadOrdresEnAttente()
  }, [])

  const loadOrdresEnAttente = async () => {
    setLoadingList(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const ordres = await ordresMissionService.getPendingValidation(user.id)

      const ordresAvecProfils = await Promise.all(
        ordres.map(async (ordre) => {
          const { data: profil } = await supabase
            .from("profils")
            .select("nom, prenom, email, departement")
            .eq("id", ordre.id_demandeur)
            .single()

          return {
            id: ordre.id,
            destination: ordre.destination,
            dateDebut: ordre.date_debut,
            dateFin: ordre.date_fin,
            motif: ordre.motif,
            activitesPrevues: ordre.activites_prevues,
            budgetEstime: ordre.budget_estime,
            demandeur: {
              nom: profil?.nom || "Inconnu",
              email: profil?.email || "",
              departement: profil?.departement || "",
            },
            dateCreation: ordre.date_creation,
            documents: [],
          }
        })
      )

      setOrdresEnAttente(ordresAvecProfils)
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoadingList(false)
    }
  }

  const handleApprouver = async (ordre: OrdreMissionDisplay) => {
    if (!commentaire.trim() && (ordre.budgetEstime || 0) > 100000) {
      alert("Un commentaire est requis pour les ordres de mission avec budget > 100 000 FCFA")
      return
    }

    setLoading(true)
    try {
      // Approuver en tant que chef (première validation)
      await ordresMissionService.approve(ordre.id, "chef", commentaire || undefined)

      alert("Ordre de mission approuvé. Notification envoyée à Finance et au demandeur.")
      setSelectedOrdre(null)
      setCommentaire("")
      await loadOrdresEnAttente()
    } catch (error: any) {
      console.error("Erreur:", error)
      alert(error.message || "Erreur lors de l'approbation")
    } finally {
      setLoading(false)
    }
  }

  const handleRejeter = async (ordre: OrdreMissionDisplay) => {
    if (!commentaire.trim()) {
      alert("Un commentaire est obligatoire pour rejeter un ordre de mission")
      return
    }

    setLoading(true)
    try {
      await ordresMissionService.reject(ordre.id, commentaire)

      alert("Ordre de mission rejeté. Notification envoyée au demandeur.")
      setSelectedOrdre(null)
      setCommentaire("")
      await loadOrdresEnAttente()
    } catch (error: any) {
      console.error("Erreur:", error)
      alert(error.message || "Erreur lors du rejet")
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2D7A32]">Validation des ordres de mission</h1>
        <p className="text-gray-600 mt-1">
          Validez ou rejetez les demandes d'ordres de mission de votre équipe
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des ordres en attente */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ordres en attente
                {ordresEnAttente.length > 0 && (
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                    {ordresEnAttente.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingList ? (
                <div className="p-6 text-center text-gray-500">
                  <p>Chargement...</p>
                </div>
              ) : ordresEnAttente.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>Aucun ordre en attente de validation</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {ordresEnAttente.map((ordre) => (
                    <button
                      key={ordre.id}
                      onClick={() => setSelectedOrdre(ordre)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedOrdre?.id === ordre.id ? "bg-[#2D7A32]/10 border-l-4 border-[#2D7A32]" : ""
                      }`}
                    >
                      <div className="font-medium text-gray-900">{ordre.destination}</div>
                      <div className="text-sm text-gray-600 mt-1">{ordre.demandeur.nom}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(ordre.dateCreation).toLocaleDateString("fr-FR")}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Détails et actions */}
        <div className="lg:col-span-2">
          {selectedOrdre ? (
            <Card>
              <CardHeader>
                <CardTitle>Détails de l'ordre de mission</CardTitle>
                <CardDescription>
                  Examinez les informations avant de valider ou rejeter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informations demandeur */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4" />
                    Demandeur
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{selectedOrdre.demandeur.nom}</div>
                    <div>{selectedOrdre.demandeur.email}</div>
                    <div>{selectedOrdre.demandeur.departement}</div>
                  </div>
                </div>

                {/* Informations mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4" />
                      Destination
                    </div>
                    <div className="text-gray-900">{selectedOrdre.destination}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4" />
                      Dates
                    </div>
                    <div className="text-gray-900">
                      {new Date(selectedOrdre.dateDebut).toLocaleDateString("fr-FR")} au{" "}
                      {new Date(selectedOrdre.dateFin).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Motif</div>
                  <div className="text-gray-900">{selectedOrdre.motif}</div>
                </div>

                {selectedOrdre.activitesPrevues && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Activités prévues</div>
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {selectedOrdre.activitesPrevues}
                    </div>
                  </div>
                )}

                {selectedOrdre.budgetEstime && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Budget estimé</div>
                    <div className="text-lg font-semibold text-[#2D7A32]">
                      {selectedOrdre.budgetEstime.toLocaleString("fr-FR")} FCFA
                    </div>
                  </div>
                )}

                {selectedOrdre.documents && selectedOrdre.documents.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Documents justificatifs</div>
                    <div className="space-y-2">
                      {selectedOrdre.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#2D7A32] hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {doc.nom}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Commentaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire{" "}
                    <span className="text-red-500">*</span>{" "}
                    <span className="text-xs text-gray-500 font-normal">
                      (obligatoire pour rejeter, recommandé pour approuver)
                    </span>
                  </label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Ajoutez un commentaire sur votre décision..."
                    rows={4}
                    className="w-full px-3 py-2 border border-[#2D7A32]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedOrdre(null)
                      setCommentaire("")
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRejeter(selectedOrdre)}
                    disabled={loading || !commentaire.trim()}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    {loading ? "Rejet en cours..." : "Rejeter"}
                  </Button>
                  <Button
                    onClick={() => handleApprouver(selectedOrdre)}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {loading ? "Validation..." : "Approuver"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Sélectionnez un ordre de mission pour voir les détails</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}
