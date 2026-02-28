"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { ArrowLeft, Car, Calendar, Edit, Plus, Check, X } from "lucide-react"
import { hasRole } from "@/lib/auth/niveau-acces"
import {
  vehiculesService,
  affectationsVehiculesService,
  ordresMissionService,
} from "@/lib/supabase/services"
import type { Vehicule, EtatVehicule, TypeVehicule, Carburant } from "@/lib/supabase/services/vehicules"
import type { AffectationVehicule } from "@/lib/supabase/services/affectations-vehicules"
import type { OrdreMission } from "@/lib/supabase/services/ordres-mission"

const ETAT_LABELS: Record<EtatVehicule, string> = {
  disponible: "Disponible (présent)",
  en_mission: "En mission",
  en_entretien: "En entretien",
  hors_service: "Hors service",
}

const TYPE_LABELS: Record<string, string> = {
  voiture: "Voiture",
  moto: "Moto",
  camion: "Camion",
  bus: "Bus",
  autre: "Autre",
}

export default function VehiculeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [vehicule, setVehicule] = useState<Vehicule | null>(null)
  const [affectations, setAffectations] = useState<AffectationVehicule[]>([])
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Vehicule>>({})
  const [showAffectModal, setShowAffectModal] = useState(false)
  const [ordres, setOrdres] = useState<OrdreMission[]>([])
  const [profils, setProfils] = useState<{ id: string; nom: string; prenom: string }[]>([])
  const [affectForm, setAffectForm] = useState({
    id_ordre_mission: "",
    id_conducteur: "",
    date_debut: "",
    kilometrage_debut: "",
    motif: "",
  })
  const [closingId, setClosingId] = useState<string | null>(null)
  const [closeForm, setCloseForm] = useState({ date_fin: "", kilometrage_fin: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (roles.length && !hasRole(roles, ["LOG", "DIR"])) {
      router.replace("/logistique")
      return
    }
    if (id && hasRole(roles, ["LOG", "DIR"])) {
      loadData()
    }
  }, [id, roles, router])

  const loadUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const { data: rolesData } = await supabase
        .from("roles_utilisateurs")
        .select("role")
        .eq("id_utilisateur", user.id)
      setRoles((rolesData ?? []).map((r) => r.role))
    } catch {
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [v, aff] = await Promise.all([
        vehiculesService.getById(id),
        affectationsVehiculesService.getByVehicule(id),
      ])
      setVehicule(v)
      setEditForm({ ...v })
      setAffectations(aff)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadOrdresAndProfils = async () => {
    try {
      const [ordresList, { data: profilsData }] = await Promise.all([
        ordresMissionService.getAll({ statut: "approuve" }).catch(() => []),
        createClient().from("profils").select("id, nom, prenom"),
      ])
      setOrdres(ordresList as OrdreMission[])
      setProfils((profilsData ?? []) as { id: string; nom: string; prenom: string }[])
    } catch {
      // ignore
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicule) return
    setSaving(true)
    try {
      await vehiculesService.update(vehicule.id, editForm)
      setVehicule({ ...vehicule, ...editForm })
      setEditing(false)
      await loadData()
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la mise à jour")
    } finally {
      setSaving(false)
    }
  }

  const handleCreateAffectation = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await affectationsVehiculesService.create({
        id_vehicule: id,
        id_ordre_mission: affectForm.id_ordre_mission || null,
        id_conducteur: affectForm.id_conducteur || null,
        date_debut: affectForm.date_debut,
        kilometrage_debut: Number(affectForm.kilometrage_debut) || (vehicule?.kilometrage ?? 0),
        motif: affectForm.motif || null,
        statut: "active",
      })
      setShowAffectModal(false)
      setAffectForm({ id_ordre_mission: "", id_conducteur: "", date_debut: "", kilometrage_debut: "", motif: "" })
      await loadData()
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la création de l'affectation")
    } finally {
      setSaving(false)
    }
  }

  const handleCloseAffectation = async (affId: string) => {
    const aff = affectations.find((a) => a.id === affId)
    if (!aff || !closeForm.date_fin || closeForm.kilometrage_fin === "") return
    setSaving(true)
    setClosingId(affId)
    try {
      await affectationsVehiculesService.update(affId, {
        date_fin: closeForm.date_fin,
        kilometrage_fin: Number(closeForm.kilometrage_fin),
        statut: "terminee",
      })
      setClosingId(null)
      setCloseForm({ date_fin: "", kilometrage_fin: "" })
      await loadData()
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la clôture")
    } finally {
      setSaving(false)
      setClosingId(null)
    }
  }

  if (loading && roles.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  if (roles.length && !hasRole(roles, ["LOG", "DIR"])) {
    return null
  }

  if (!vehicule) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Véhicule introuvable.</p>
        <Link href="/logistique/vehicules">
          <Button variant="outline" className="mt-4">
            Retour au parc
          </Button>
        </Link>
      </div>
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
      <div className="flex items-center gap-4">
        <Link href="/logistique/vehicules">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#2D7A32]">
            {vehicule.marque} {vehicule.modele} — {vehicule.immatriculation}
          </h1>
          <p className="text-gray-600">
            {TYPE_LABELS[vehicule.type_vehicule] ?? vehicule.type_vehicule} · {ETAT_LABELS[vehicule.etat]}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Fiche véhicule
          </CardTitle>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Annuler
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
                  <select
                    value={editForm.etat ?? vehicule.etat}
                    onChange={(e) => setEditForm((f) => ({ ...f, etat: e.target.value as EtatVehicule }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {(Object.entries(ETAT_LABELS) as [EtatVehicule, string][]).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.kilometrage ?? vehicule.kilometrage}
                    onChange={(e) => setEditForm((f) => ({ ...f, kilometrage: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <dt className="text-sm text-gray-500">Immatriculation</dt>
                <dd className="font-medium">{vehicule.immatriculation}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Marque / Modèle</dt>
                <dd className="font-medium">
                  {vehicule.marque} {vehicule.modele}
                  {vehicule.annee ? ` (${vehicule.annee})` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Kilométrage</dt>
                <dd>{vehicule.kilometrage.toLocaleString("fr-FR")} km</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">État</dt>
                <dd>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      vehicule.etat === "disponible"
                        ? "bg-green-100 text-green-800"
                        : vehicule.etat === "en_mission"
                          ? "bg-blue-100 text-blue-800"
                          : vehicule.etat === "en_entretien"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ETAT_LABELS[vehicule.etat]}
                  </span>
                </dd>
              </div>
              {vehicule.carburant && (
                <div>
                  <dt className="text-sm text-gray-500">Carburant</dt>
                  <dd className="capitalize">{vehicule.carburant}</dd>
                </div>
              )}
              {vehicule.date_achat && (
                <div>
                  <dt className="text-sm text-gray-500">Date d'achat</dt>
                  <dd>{new Date(vehicule.date_achat).toLocaleDateString("fr-FR")}</dd>
                </div>
              )}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Affectations</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              loadOrdresAndProfils()
              setShowAffectModal(true)
            }}
            disabled={vehicule.etat === "en_mission"}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nouvelle affectation
          </Button>
        </CardHeader>
        <CardContent>
          {affectations.length === 0 ? (
            <p className="text-gray-500">Aucune affectation.</p>
          ) : (
            <ul className="space-y-3">
              {affectations.map((aff) => (
                <li
                  key={aff.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {new Date(aff.date_debut).toLocaleDateString("fr-FR")}
                      {aff.date_fin ? ` → ${new Date(aff.date_fin).toLocaleDateString("fr-FR")}` : " (en cours)"}
                    </span>
                    <span className="text-gray-500">
                      · {aff.kilometrage_debut} km
                      {aff.kilometrage_fin != null ? ` → ${aff.kilometrage_fin} km` : ""}
                    </span>
                    {aff.id_ordre_mission && (
                      <Link
                        href={`/ordres-mission/${aff.id_ordre_mission}`}
                        className="text-[#2D7A32] hover:underline font-medium"
                      >
                        Voir ordre de mission
                      </Link>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        aff.statut === "active"
                          ? "bg-blue-100 text-blue-800"
                          : aff.statut === "terminee"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {aff.statut === "active" ? "En cours" : aff.statut === "terminee" ? "Terminée" : "Annulée"}
                    </span>
                  </div>
                  {aff.statut === "active" && (
                    <div className="flex items-center gap-2">
                      {closingId === aff.id ? (
                        <>
                          <input
                            type="date"
                            value={closeForm.date_fin}
                            onChange={(e) => setCloseForm((f) => ({ ...f, date_fin: e.target.value }))}
                            className="px-2 py-1 border rounded text-sm"
                          />
                          <input
                            type="number"
                            min={aff.kilometrage_debut}
                            placeholder="Km fin"
                            value={closeForm.kilometrage_fin}
                            onChange={(e) => setCloseForm((f) => ({ ...f, kilometrage_fin: e.target.value }))}
                            className="w-24 px-2 py-1 border rounded text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleCloseAffectation(aff.id)}
                            disabled={saving || !closeForm.date_fin || closeForm.kilometrage_fin === ""}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setClosingId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setClosingId(aff.id)}>
                          Clôturer
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {showAffectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Nouvelle affectation</h2>
              <form onSubmit={handleCreateAffectation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre de mission (optionnel)</label>
                  <select
                    value={affectForm.id_ordre_mission}
                    onChange={(e) => setAffectForm((f) => ({ ...f, id_ordre_mission: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">— Aucun —</option>
                    {ordres.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.destination} ({new Date(o.date_debut).toLocaleDateString("fr-FR")})
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
                    {profils.map((p) => (
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
                    value={affectForm.kilometrage_debut || vehicule.kilometrage}
                    onChange={(e) => setAffectForm((f) => ({ ...f, kilometrage_debut: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motif (optionnel)</label>
                  <input
                    value={affectForm.motif}
                    onChange={(e) => setAffectForm((f) => ({ ...f, motif: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Mission, déplacement..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAffectModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Création..." : "Créer"}
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
