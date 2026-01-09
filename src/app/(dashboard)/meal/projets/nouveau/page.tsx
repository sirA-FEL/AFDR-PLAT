"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { ArrowLeft, Calendar, Save, Users } from "lucide-react"
import Link from "next/link"

export default function NouveauProjetMEALPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    codeProjet: "",
    objectifs: "",
    zonesIntervention: "",
    dateDebut: "",
    dateFin: "",
    budgetTotal: "",
    responsableId: "",
  })
  const [codeAutoGenere, setCodeAutoGenere] = useState(false)

  // Liste des responsables (à remplacer par données Supabase)
  const [responsables] = useState([
    { id: "1", nom: "Jean Dupont", email: "jean.dupont@afdr.org" },
    { id: "2", nom: "Marie Martin", email: "marie.martin@afdr.org" },
  ])

  // Génération automatique du code projet
  useEffect(() => {
    if (!formData.codeProjet && formData.nom) {
      const code = formData.nom
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 8)
      if (code.length >= 3) {
        setFormData((prev) => ({ ...prev, codeProjet: code }))
        setCodeAutoGenere(true)
      }
    } else if (formData.codeProjet && codeAutoGenere) {
      setCodeAutoGenere(false)
    }
  }, [formData.nom, formData.codeProjet, codeAutoGenere])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.nom || !formData.dateDebut || !formData.dateFin || !formData.budgetTotal) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (new Date(formData.dateDebut) >= new Date(formData.dateFin)) {
      alert("La date de fin doit être postérieure à la date de début")
      return
    }

    const budget = parseFloat(formData.budgetTotal)
    if (isNaN(budget) || budget <= 0) {
      alert("Le budget total doit être un nombre positif")
      return
    }

    if (!formData.responsableId) {
      alert("Veuillez sélectionner un responsable de projet")
      return
    }

    setLoading(true)

    try {
      const { projetsService } = await import("@/lib/supabase/services")

      const projet = await projetsService.create({
        nom: formData.nom,
        code_projet: formData.codeProjet || undefined,
        objectifs: formData.objectifs || undefined,
        zones_intervention: formData.zonesIntervention || undefined,
        date_debut: formData.dateDebut,
        date_fin: formData.dateFin,
        budget_total: budget,
        id_responsable: formData.responsableId,
      })

      alert("Projet créé avec succès")
      router.push("/meal/projets")
    } catch (error: any) {
      console.error("Erreur lors de la création:", error)
      alert(error.message || "Erreur lors de la création du projet")
    } finally {
      setLoading(false)
    }
  }

  const generateCodeAuto = () => {
    const prefix = "PROJ"
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}-${timestamp}`
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/meal/projets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#2D7A32]">Nouveau projet</h1>
          <p className="text-gray-600 mt-1">Créez un nouveau projet dans le système MEAL</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du projet</CardTitle>
            <CardDescription>Renseignez les informations du projet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nom du projet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du projet <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Nom du projet"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>

            {/* Code projet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code projet {codeAutoGenere && <span className="text-xs text-gray-500">(généré automatiquement)</span>}
              </label>
              <Input
                type="text"
                placeholder="Laissez vide pour génération automatique"
                value={formData.codeProjet}
                onChange={(e) => setFormData({ ...formData, codeProjet: e.target.value })}
              />
              {codeAutoGenere && (
                <p className="text-xs text-gray-500 mt-1">
                  Le code sera généré automatiquement à partir du nom du projet
                </p>
              )}
            </div>

            {/* Objectifs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Objectifs</label>
              <textarea
                placeholder="Objectifs du projet"
                value={formData.objectifs}
                onChange={(e) => setFormData({ ...formData, objectifs: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-[#2D7A32]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent resize-none"
              />
            </div>

            {/* Zones d'intervention */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zones d'intervention
              </label>
              <Input
                type="text"
                placeholder="Ex: Région Nord, Province de Kivu, etc."
                value={formData.zonesIntervention}
                onChange={(e) => setFormData({ ...formData, zonesIntervention: e.target.value })}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <Input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <Input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    required
                    min={formData.dateDebut}
                  />
                </div>
              </div>
            </div>

            {/* Budget total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget total (FCFA) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="0"
                value={formData.budgetTotal}
                onChange={(e) => setFormData({ ...formData, budgetTotal: e.target.value })}
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Responsable de projet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable de projet <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <select
                  value={formData.responsableId}
                  onChange={(e) => setFormData({ ...formData, responsableId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-[#2D7A32]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent bg-white"
                  required
                >
                  <option value="">Sélectionnez un responsable</option>
                  {responsables.map((resp) => (
                    <option key={resp.id} value={resp.id}>
                      {resp.nom} ({resp.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/meal/projets">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" loading={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Création..." : "Créer le projet"}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
