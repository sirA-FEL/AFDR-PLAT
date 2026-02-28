"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { FileText, Download, ArrowLeft, User, Calendar, MapPin, Edit, Send, Car, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  ordresMissionService,
  affectationsVehiculesService,
  vehiculesService,
  type OrdreMission,
} from "@/lib/supabase/services"
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
  const [signatureImageUrl, setSignatureImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [affectations, setAffectations] = useState<{ id: string; id_vehicule: string; date_debut: string; date_fin: string | null; kilometrage_debut: number; kilometrage_fin: number | null; statut: string }[]>([])
  const [vehiculesMap, setVehiculesMap] = useState<Record<string, { immatriculation: string; marque: string; modele: string }>>({})
  const [showAddAffect, setShowAddAffect] = useState(false)
  const [affectForm, setAffectForm] = useState({ id_vehicule: "", id_conducteur: "", date_debut: "", kilometrage_debut: "" })
  const [vehiculesList, setVehiculesList] = useState<{ id: string; immatriculation: string; marque: string; modele: string }[]>([])
  const [profilsList, setProfilsList] = useState<{ id: string; nom: string; prenom: string }[]>([])
  const [savingAffect, setSavingAffect] = useState(false)
  const niveauAcces = getNiveauAcces(roles)
  const canManageVehicule = hasRole(roles, ["LOG", "DIR"])

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

  useEffect(() => {
    if (!id || !canManageVehicule) return
    loadAffectations()
  }, [id, canManageVehicule])

  const loadAffectations = async () => {
    if (!id) return
    try {
      const aff = await affectationsVehiculesService.getByOrdreMission(id)
      setAffectations(aff)
      const ids = [...new Set(aff.map((a) => a.id_vehicule))]
      if (ids.length === 0) {
        setVehiculesMap({})
        return
      }
      const all = await vehiculesService.getAll()
      const map: Record<string, { immatriculation: string; marque: string; modele: string }> = {}
      all.filter((v) => ids.includes(v.id)).forEach((v) => { map[v.id] = { immatriculation: v.immatriculation, marque: v.marque, modele: v.modele } })
      setVehiculesMap(map)
    } catch {
      setAffectations([])
      setVehiculesMap({})
    }
  }

  const openAddAffectation = async () => {
    setShowAddAffect(true)
    try {
      const [vehicules, { data: profilsData }] = await Promise.all([
        vehiculesService.getAll(),
        createClient().from("profils").select("id, nom, prenom"),
      ])
      setVehiculesList(vehicules)
      setProfilsList((profilsData ?? []) as { id: string; nom: string; prenom: string }[])
    } catch {
      // ignore
    }
  }

  const handleAddAffectation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !affectForm.id_vehicule || !affectForm.date_debut || affectForm.kilometrage_debut === "") return
    setSavingAffect(true)
    try {
      await affectationsVehiculesService.create({
        id_vehicule: affectForm.id_vehicule,
        id_ordre_mission: id,
        id_conducteur: affectForm.id_conducteur || null,
        date_debut: affectForm.date_debut,
        kilometrage_debut: Number(affectForm.kilometrage_debut),
        statut: "active",
      })
      setShowAddAffect(false)
      setAffectForm({ id_vehicule: "", id_conducteur: "", date_debut: "", kilometrage_debut: "" })
      await loadAffectations()
    } catch (err: unknown) {
      const e = err as { message?: string }
      alert(e?.message ?? "Erreur lors de l'affectation.")
    } finally {
      setSavingAffect(false)
    }
  }

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
      if (data.signature_validation_url) {
        try {
          const url = await ordresMissionService.getSignedSignatureUrl(data.id)
          setSignatureImageUrl(url)
        } catch {
          setSignatureImageUrl(null)
        }
      } else {
        setSignatureImageUrl(null)
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
      alert("Ordre soumis. Il est en attente de validation par la Direction / MEAL. Les validateurs peuvent traiter la demande depuis la page Validation des ordres.")
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
      const opts: { demandeurNom?: string; signatureImageUrl?: string; validateurNom?: string } = { demandeurNom }
      if (ordre.signature_validation_url) {
        opts.signatureImageUrl = await ordresMissionService.getSignedSignatureUrl(ordre.id)
        opts.validateurNom = validateurNom
      }
      const blob = await generateOrdreMissionPdf(ordreFull, opts)
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
              {validateurNom && ordre.date_validation && (
                <p className="text-sm text-gray-600">
                  Validé par {validateurNom} le {new Date(ordre.date_validation).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}.
                </p>
              )}
              {ordre.signature_validation_hash && (
                <p className="text-xs text-gray-500 font-mono break-all">
                  Empreinte signature : SHA-256: {ordre.signature_validation_hash}
                </p>
              )}
              {ordre.commentaire_validation && <p className="text-sm text-gray-600">Commentaire : {ordre.commentaire_validation}</p>}
              {ordre.signature_validation_url && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Signature</p>
                  {signatureImageUrl ? (
                    <img src={signatureImageUrl} alt="Signature" className="h-20 border border-gray-200 rounded" />
                  ) : (
                    <p className="text-xs text-gray-400">(Signature non disponible)</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {canManageVehicule && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Véhicule affecté
            </CardTitle>
            <Button size="sm" onClick={openAddAffectation}>
              <Plus className="h-4 w-4 mr-1" />
              Affecter un véhicule
            </Button>
          </CardHeader>
          <CardContent>
            {affectations.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun véhicule affecté à cet ordre.</p>
            ) : (
              <ul className="space-y-2">
                {affectations.map((aff) => {
                  const v = vehiculesMap[aff.id_vehicule]
                  return (
                    <li key={aff.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {v ? (
                          <Link
                            href={`/logistique/vehicules/${aff.id_vehicule}`}
                            className="font-medium text-[#2D7A32] hover:underline"
                          >
                            {v.marque} {v.modele} — {v.immatriculation}
                          </Link>
                        ) : (
                          <Link
                            href={`/logistique/vehicules/${aff.id_vehicule}`}
                            className="text-[#2D7A32] hover:underline"
                          >
                            Voir le véhicule
                          </Link>
                        )}
                        <span className="text-gray-500 text-sm">
                          {new Date(aff.date_debut).toLocaleDateString("fr-FR")}
                          {aff.date_fin ? ` → ${new Date(aff.date_fin).toLocaleDateString("fr-FR")}` : " (en cours)"}
                          · {aff.kilometrage_debut} km
                          {aff.kilometrage_fin != null ? ` → ${aff.kilometrage_fin} km` : ""}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            aff.statut === "active" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {aff.statut === "active" ? "En cours" : "Terminée"}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {showAddAffect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Affecter un véhicule à cet ordre</h2>
              <form onSubmit={handleAddAffectation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule *</label>
                  <select
                    required
                    value={affectForm.id_vehicule}
                    onChange={(e) => setAffectForm((f) => ({ ...f, id_vehicule: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">— Choisir —</option>
                    {vehiculesList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.marque} {v.modele} — {v.immatriculation}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conducteur (optionnel)</label>
                  <select
                    value={affectForm.id_conducteur}
                    onChange={(e) => setAffectForm((f) => ({ ...f, id_conducteur: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">— Aucun —</option>
                    {profilsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.prenom} {p.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                  <input
                    type="datetime-local"
                    required
                    value={affectForm.date_debut}
                    onChange={(e) => setAffectForm((f) => ({ ...f, date_debut: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage début *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={affectForm.kilometrage_debut}
                    onChange={(e) => setAffectForm((f) => ({ ...f, kilometrage_debut: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddAffect(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={savingAffect}>
                    {savingAffect ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  )
}
