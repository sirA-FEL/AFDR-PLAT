"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { CheckCircle, XCircle, Eye, FileText, User, Calendar, MapPin, PenLine } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ordresMissionService } from "@/lib/supabase/services"
import { SignatureCanvas, type SignatureCanvasRef } from "@/components/ui/signature-canvas"

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
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [commentaireApprove, setCommentaireApprove] = useState("")
  const [consentementApprove, setConsentementApprove] = useState(false)
  const signatureRef = useRef<SignatureCanvasRef>(null)
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null)

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

      const ordres = await ordresMissionService.getPendingValidation()

      const ordresAvecProfils = await Promise.all(
        ordres.map(async (ordre) => {
          const { data: profil } = await supabase
            .from("profils")
            .select("nom, prenom, email, departement")
            .eq("id", ordre.id_demandeur)
            .maybeSingle()

          const nomComplet = [profil?.prenom, profil?.nom].filter(Boolean).join(" ") || "Inconnu"
          return {
            id: ordre.id,
            destination: ordre.destination,
            dateDebut: ordre.date_debut,
            dateFin: ordre.date_fin,
            motif: ordre.motif,
            activitesPrevues: ordre.activites_prevues,
            budgetEstime: ordre.budget_estime,
            demandeur: {
              nom: nomComplet,
              email: profil?.email ?? "",
              departement: profil?.departement ?? "",
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

  const handleOuvrirModalApprouver = (ordre: OrdreMissionDisplay) => {
    if ((ordre.budgetEstime || 0) > 100000 && !commentaire.trim()) {
      alert("Un commentaire est recommandé pour les ordres avec budget > 100 000 FCFA")
    }
    setCommentaireApprove(commentaire)
    setShowApproveModal(true)
  }

  const handleConfirmApprove = async () => {
    if (!selectedOrdre) return
    const blob = await signatureRef.current?.getBlob()
    if (!blob || signatureRef.current?.isEmpty()) {
      alert("Veuillez signer dans la zone ci-dessous avant de confirmer.")
      return
    }
    setLoading(true)
    try {
      await ordresMissionService.approveWithSignature(
        selectedOrdre.id,
        blob,
        commentaireApprove.trim() || undefined
      )
      setShowApproveModal(false)
      setCommentaireApprove("")
      setConsentementApprove(false)
      signatureRef.current?.clear()
      setSelectedOrdre(null)
      setCommentaire("")
      await loadOrdresEnAttente()
      alert("Ordre de mission approuvé avec succès.")
    } catch (error: any) {
      console.error("Erreur:", error)
      alert(error.message || "Erreur lors de l'approbation")
    } finally {
      setLoading(false)
    }
  }

  const handleVoirPdf = async (ordreId: string) => {
    setLoadingPdf(ordreId)
    try {
      const url = await ordresMissionService.getSignedPdfUrl(ordreId)
      window.open(url, "_blank")
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Impossible d'ouvrir le PDF")
    } finally {
      setLoadingPdf(null)
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
          Les ordres en statut « En attente » sont listés ici. En tant que validateur (Direction / MEAL), vous pouvez les approuver avec signature ou les rejeter.
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
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Détails de l'ordre de mission</CardTitle>
                  <CardDescription>
                    Examinez les informations avant de valider ou rejeter
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVoirPdf(selectedOrdre.id)}
                  disabled={loadingPdf === selectedOrdre.id}
                  className="flex items-center gap-2 shrink-0"
                >
                  <FileText className="h-4 w-4" />
                  {loadingPdf === selectedOrdre.id ? "Ouverture..." : "Voir le PDF"}
                </Button>
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
                    onClick={() => handleOuvrirModalApprouver(selectedOrdre)}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approuver avec signature
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

      {/* Modal Approuver avec signature */}
      {showApproveModal && selectedOrdre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-[#2D7A32]">Approuver l'ordre de mission</h3>
              <p className="text-sm text-gray-600">
                Signez ci-dessous pour valider l'ordre de mission de {selectedOrdre.demandeur.nom} ({selectedOrdre.destination}).
              </p>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consentement-approve"
                  checked={consentementApprove}
                  onChange={(e) => setConsentementApprove(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#2D7A32] focus:ring-[#2D7A32]"
                />
                <label htmlFor="consentement-approve" className="text-sm text-gray-700 cursor-pointer">
                  Je certifie avoir pris connaissance de cet ordre de mission et l'approuver.
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire (optionnel)</label>
                <textarea
                  value={commentaireApprove}
                  onChange={(e) => setCommentaireApprove(e.target.value)}
                  placeholder="Commentaire éventuel..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                <SignatureCanvas ref={signatureRef} width={400} height={160} className="w-full" />
                <p className="text-xs text-gray-500 mt-1">Dessinez votre signature dans la zone ci-dessus</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    signatureRef.current?.clear()
                    setShowApproveModal(false)
                    setCommentaireApprove("")
                    setConsentementApprove(false)
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="outline"
                  onClick={() => signatureRef.current?.clear()}
                  className="flex items-center gap-2"
                >
                  <PenLine className="h-4 w-4" />
                  Effacer
                </Button>
                <Button
                  onClick={handleConfirmApprove}
                  disabled={loading || !consentementApprove}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {loading ? "Validation..." : "Confirmer la validation"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
