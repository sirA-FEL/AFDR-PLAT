"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { FileText, Download, ArrowLeft, User, Calendar, MapPin, Edit, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ordresMissionService, type OrdreMission } from "@/lib/supabase/services"
import { hasRole, getNiveauAcces } from "@/lib/auth/niveau-acces"

export default function OrdreMissionDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [authReady, setAuthReady] = useState(false)
  const [ordre, setOrdre] = useState<OrdreMission | null>(null)
  const [demandeurNom, setDemandeurNom] = useState("")
  const [validateurNom, setValidateurNom] = useState("")
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const niveauAcces = getNiveauAcces(roles)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
      if (!user?.id) {
        setAuthReady(true)
        return
      }
      supabase.from("roles_utilisateurs").select("role").eq("id_utilisateur", user.id).then(({ data }) => {
        setRoles((data ?? []).map((r) => r.role))
        setAuthReady(true)
      })
    })
  }, [])

  useEffect(() => {
    if (!id) return
    loadOrdre()
  }, [id])

  const loadOrdre = async () => {
    if (!id) return
    setLoading(true)
    setForbidden(false)
    try {
      const data = await ordresMissionService.getById(id)
      setOrdre(data)
      const supabase = createClient()
      const { data: pDemandeur } = await supabase.from("profils").select("nom, prenom").eq("id", data.id_demandeur).maybeSingle()
      setDemandeurNom(pDemandeur ? `${pDemandeur.prenom || ""} ${pDemandeur.nom}`.trim() : "Inconnu")
      if (data.id_validateur_direction) {
        const { data: pVal } = await supabase.from("profils").select("nom, prenom").eq("id", data.id_validateur_direction).maybeSingle()
        setValidateurNom(pVal ? `${pVal.prenom || ""} ${pVal.nom}`.trim() : "Inconnu")
      }
    } catch {
      setOrdre(null)
    } finally {
      setLoading(false)
    }
  }

  const canView =
    ordre &&
    currentUserId &&
    (currentUserId === ordre.id_demandeur ||
      (niveauAcces >= 3 && hasRole(roles, ["DIR", "MEAL"]) && ["en_attente", "approuve", "rejete", "en_cours", "termine"].includes(ordre.statut)))

  useEffect(() => {
    if (authReady && !loading && ordre && !canView) setForbidden(true)
  }, [authReady, loading, ordre, canView])

  const handleSoumettre = async () => {
    if (!ordre || ordre.statut !== "brouillon") return
    setSubmitting(true)
    try {
      await ordresMissionService.submit(ordre.id)
      setOrdre({ ...ordre, statut: "en_attente" })
      alert("Ordre de mission soumis. Il est en attente de validation.")
    } catch (err: unknown) {
      const e = err as { message?: string }
      alert(e?.message ?? "Erreur lors de la soumission.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!ordre) return
    setGeneratingPdf(true)
    try {
      if (ordre.pdf_url) {
        const signedUrl = await ordresMissionService.getSignedPdfUrl(ordre.id)
        window.open(signedUrl, "_blank")
        setGeneratingPdf(false)
        return
      }
      const ordreFull = await ordresMissionService.getById(ordre.id)
      const { generateOrdreMissionPdf } = await import("@/lib/ordres-mission/generate-pdf")
      const blob = await generateOrdreMissionPdf(ordreFull, { demandeurNom })
      const pdfPath = await ordresMissionService.uploadPdf(ordre.id, blob)
      await ordresMissionService.setPdfUrl(ordre.id, pdfPath)
      setOrdre({ ...ordre, pdf_url: pdfPath })
      const signedUrl = await ordresMissionService.getSignedPdfUrl(ordre.id)
      window.open(signedUrl, "_blank")
    } catch (err) {
      console.error(err)
      alert("Impossible de générer le PDF.")
    } finally {
      setGeneratingPdf(false)
    }
  }

  const statutLabels: Record<OrdreMission["statut"], string> = {
    brouillon: "Brouillon",
    en_attente: "En attente",
    approuve: "Approuvé",
    rejete: "Rejeté",
    en_cours: "En cours",
    termine: "Terminé",
  }

  if (loading) return <div className="p-6 text-gray-500">Chargement...</div>
  if (!ordre) {
    return (
      <motion.div initial="initial" animate="animate" variants={slideUp} transition={transitionNormal} className="p-6">
        <p className="text-gray-500">Ordre de mission introuvable.</p>
        <Link href="/ordres-mission"><Button variant="outline" className="mt-4">Retour à la liste</Button></Link>
      </motion.div>
    )
  }
  if (forbidden || !canView) {
    return (
      <motion.div initial="initial" animate="animate" variants={slideUp} transition={transitionNormal} className="p-6">
        <p className="text-gray-700">Vous n&apos;avez pas accès à cet ordre de mission.</p>
        <Link href="/ordres-mission"><Button variant="outline" className="mt-4">Retour à la liste</Button></Link>
      </motion.div>
    )
  }

  return (
    <motion.div initial="initial" animate="animate" variants={slideUp} transition={transitionNormal} className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/ordres-mission">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {ordre.statut === "brouillon" && (
            <>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleSoumettre}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="text-xs">...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Soumettre
                  </>
                )}
              </Button>
              <Link href={`/ordres-mission/nouveau?edit=${ordre.id}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" /> Modifier
                </Button>
              </Link>
            </>
          )}
          <Button onClick={handleDownloadPDF} disabled={generatingPdf} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {generatingPdf ? "Génération..." : "Télécharger le PDF"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ordre de mission
          </CardTitle>
          <p className="text-sm text-gray-500">
            Statut : <span className="font-medium text-gray-700">{statutLabels[ordre.statut]}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-medium">{ordre.destination}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Demandeur</p>
                <p className="font-medium">{demandeurNom}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Dates</p>
                <p className="font-medium">
                  Du {new Date(ordre.date_debut).toLocaleDateString("fr-FR")} au {new Date(ordre.date_fin).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Motif</p>
            <p className="text-gray-900">{ordre.motif}</p>
          </div>

          {ordre.activites_prevues && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Activités prévues</p>
              <p className="text-gray-900 whitespace-pre-wrap">{ordre.activites_prevues}</p>
            </div>
          )}

          {ordre.budget_estime != null && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Budget estimé</p>
              <p className="font-medium">{ordre.budget_estime} FCFA</p>
            </div>
          )}

          {(ordre.signature_validation_url || ordre.date_validation || validateurNom) && (
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Validation</p>
              {ordre.date_validation && (
                <p className="text-sm text-gray-600">Date : {new Date(ordre.date_validation).toLocaleDateString("fr-FR")}</p>
              )}
              {validateurNom && <p className="text-sm text-gray-600">Validateur : {validateurNom}</p>}
              {ordre.commentaire_validation && <p className="text-sm text-gray-600">Commentaire : {ordre.commentaire_validation}</p>}
              {ordre.signature_validation_url && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Signature</p>
                  <img src={ordre.signature_validation_url} alt="Signature" className="h-20 border border-gray-200 rounded" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
