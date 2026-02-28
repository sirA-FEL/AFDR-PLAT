"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { Car, Plus, ArrowLeft, Search } from "lucide-react"
import { hasRole } from "@/lib/auth/niveau-acces"
import {
  vehiculesService,
  type Vehicule,
  type EtatVehicule,
  type TypeVehicule,
  type Carburant,
} from "@/lib/supabase/services"

const ETAT_LABELS: Record<EtatVehicule, string> = {
  disponible: "Disponible (présent)",
  en_mission: "En mission",
  en_entretien: "En entretien",
  hors_service: "Hors service",
}

const TYPE_LABELS: Record<TypeVehicule, string> = {
  voiture: "Voiture",
  moto: "Moto",
  camion: "Camion",
  bus: "Bus",
  autre: "Autre",
}

export default function ParcAutomobilePage() {
  const router = useRouter()
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [filterEtat, setFilterEtat] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    immatriculation: "",
    marque: "",
    modele: "",
    annee: "" as string | number,
    type_vehicule: "voiture" as TypeVehicule,
    carburant: "" as Carburant | "",
    kilometrage: "0",
    etat: "disponible" as EtatVehicule,
  })

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (roles.length && !hasRole(roles, ["LOG", "DIR"])) {
      router.replace("/logistique")
      return
    }
    if (hasRole(roles, ["LOG", "DIR"])) {
      loadVehicules()
    }
  }, [roles, router, filterEtat])

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

  const loadVehicules = async () => {
    setLoading(true)
    try {
      const data = await vehiculesService.getAll(
        filterEtat !== "all" ? { etat: filterEtat as EtatVehicule } : undefined
      )
      setVehicules(data)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicules = vehicules.filter(
    (v) =>
      v.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modele.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await vehiculesService.create({
        immatriculation: form.immatriculation.trim(),
        marque: form.marque.trim(),
        modele: form.modele.trim(),
        annee: form.annee ? Number(form.annee) : undefined,
        type_vehicule: form.type_vehicule,
        carburant: form.carburant || undefined,
        kilometrage: Number(form.kilometrage) || 0,
        etat: form.etat,
      })
      setShowAddModal(false)
      setForm({
        immatriculation: "",
        marque: "",
        modele: "",
        annee: "",
        type_vehicule: "voiture",
        carburant: "",
        kilometrage: "0",
        etat: "disponible",
      })
      await loadVehicules()
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la création")
    } finally {
      setSaving(false)
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

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/logistique">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#2D7A32]">Parc automobile</h1>
            <p className="text-gray-600 mt-1">Véhicules présents et affectations</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un véhicule
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher (immat., marque, modèle)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
              />
            </div>
            <select
              value={filterEtat}
              onChange={(e) => setFilterEtat(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
            >
              <option value="all">Tous les états</option>
              <option value="disponible">Disponible (présent)</option>
              <option value="en_mission">En mission</option>
              <option value="en_entretien">En entretien</option>
              <option value="hors_service">Hors service</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">Chargement...</CardContent>
        </Card>
      ) : filteredVehicules.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun véhicule trouvé</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un véhicule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 border-b border-gray-200">Immatriculation</th>
                <th className="text-left p-3 border-b border-gray-200">Marque / Modèle</th>
                <th className="text-left p-3 border-b border-gray-200">Type</th>
                <th className="text-left p-3 border-b border-gray-200">État</th>
                <th className="text-right p-3 border-b border-gray-200">Kilométrage</th>
                <th className="text-right p-3 border-b border-gray-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicules.map((v) => (
                <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{v.immatriculation}</td>
                  <td className="p-3">
                    {v.marque} {v.modele}
                    {v.annee ? ` (${v.annee})` : ""}
                  </td>
                  <td className="p-3">{TYPE_LABELS[v.type_vehicule]}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        v.etat === "disponible"
                          ? "bg-green-100 text-green-800"
                          : v.etat === "en_mission"
                            ? "bg-blue-100 text-blue-800"
                            : v.etat === "en_entretien"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ETAT_LABELS[v.etat]}
                    </span>
                  </td>
                  <td className="p-3 text-right">{v.kilometrage.toLocaleString("fr-FR")} km</td>
                  <td className="p-3 text-right">
                    <Link href={`/logistique/vehicules/${v.id}`}>
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Nouveau véhicule</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation *</label>
                  <input
                    required
                    value={form.immatriculation}
                    onChange={(e) => setForm((f) => ({ ...f, immatriculation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2D7A32]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
                    <input
                      required
                      value={form.marque}
                      onChange={(e) => setForm((f) => ({ ...f, marque: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2D7A32]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modèle *</label>
                    <input
                      required
                      value={form.modele}
                      onChange={(e) => setForm((f) => ({ ...f, modele: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2D7A32]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      value={form.annee}
                      onChange={(e) => setForm((f) => ({ ...f, annee: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2D7A32]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage</label>
                    <input
                      type="number"
                      min="0"
                      value={form.kilometrage}
                      onChange={(e) => setForm((f) => ({ ...f, kilometrage: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2D7A32]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={form.type_vehicule}
                      onChange={(e) => setForm((f) => ({ ...f, type_vehicule: e.target.value as TypeVehicule }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2D7A32]"
                    >
                      {(Object.keys(TYPE_LABELS) as TypeVehicule[]).map((t) => (
                        <option key={t} value={t}>
                          {TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carburant</label>
                    <select
                      value={form.carburant}
                      onChange={(e) => setForm((f) => ({ ...f, carburant: e.target.value as Carburant | "" }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2D7A32]"
                    >
                      <option value="">—</option>
                      <option value="essence">Essence</option>
                      <option value="diesel">Diesel</option>
                      <option value="electrique">Électrique</option>
                      <option value="hybride">Hybride</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
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
