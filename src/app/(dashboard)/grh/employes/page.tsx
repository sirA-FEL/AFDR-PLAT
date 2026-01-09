"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { Plus, Search, User, Mail, Calendar, Briefcase, FileText, Edit, Trash2 } from "lucide-react"

interface Employe {
  id: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  poste: string
  departement: string
  dateEmbauche: string
  typeContrat: "CDI" | "CDD" | "Stage" | "Consultant"
  soldeConges: number
  photoUrl?: string
  compteUtilisateurId?: string
  dateCreation?: string
  dateModification?: string
}

export default function EmployesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null)
  const [loading, setLoading] = useState(false)
  const [employes, setEmployes] = useState<Employe[]>([])

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    poste: "",
    departement: "",
    dateEmbauche: "",
    typeContrat: "CDI" as Employe["typeContrat"],
    photo: null as File | null,
  })

  const filteredEmployes = employes.filter((emp) => {
    const fullName = `${emp.prenom} ${emp.nom}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.departement.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { employesService } = await import("@/lib/supabase/services")

      // Créer l'employé (crée aussi le profil utilisateur)
      const employe = await employesService.create({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        poste: formData.poste,
        departement: formData.departement,
        date_embauche: formData.dateEmbauche,
        type_contrat: formData.typeContrat.toLowerCase() as "cdi" | "cdd" | "stage" | "consultant" | "autre",
      })

      // Upload photo si fournie
      if (formData.photo) {
        await employesService.uploadPhoto(employe.id, formData.photo)
      }

      alert("Fiche employé créée avec succès")
      setShowForm(false)
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        poste: "",
        departement: "",
        dateEmbauche: "",
        typeContrat: "CDI",
        photo: null,
      })
      await loadEmployes()
    } catch (error: any) {
      console.error("Erreur:", error)
      alert(error.message || "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  const loadEmployes = async () => {
    try {
      const { employesService } = await import("@/lib/supabase/services")
      const data = await employesService.getAll(searchTerm || undefined)

      // Transformer les données
      const transformed = data.map((emp) => ({
        id: emp.id,
        nom: emp.nom || "",
        prenom: emp.prenom || "",
        email: emp.email || "",
        telephone: "",
        poste: emp.poste || "",
        departement: emp.departement || "",
        dateEmbauche: emp.date_embauche,
        typeContrat: emp.type_contrat.toUpperCase() as "CDI" | "CDD" | "Stage" | "Consultant",
        soldeConges: emp.solde_conges,
        photoUrl: emp.photo,
        compteUtilisateurId: emp.id_utilisateur,
        dateCreation: emp.date_creation,
        dateModification: emp.date_modification,
      }))

      setEmployes(transformed)
    } catch (error: any) {
      console.error("Erreur:", error)
      alert("Erreur lors du chargement des employés")
    }
  }

  useEffect(() => {
    loadEmployes()
  }, [searchTerm])

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      return
    }

    try {
      const { employesService } = await import("@/lib/supabase/services")
      await employesService.delete(id)
      await loadEmployes()
      alert("Employé supprimé avec succès")
    } catch (error: any) {
      console.error("Erreur:", error)
      alert(error.message || "Erreur lors de la suppression")
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
          <h1 className="text-3xl font-bold text-[#2D7A32]">Employés</h1>
          <p className="text-gray-600 mt-1">Gérez les fiches des employés</p>
        </div>
        <Button size="lg" onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nouvel employé
        </Button>
      </div>

      {/* Formulaire de création (Modal simplifié) */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvel employé</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <Input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.poste}
                    onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Département <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.departement}
                    onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'embauche <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.dateEmbauche}
                    onChange={(e) => setFormData({ ...formData, dateEmbauche: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contrat <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.typeContrat}
                    onChange={(e) =>
                      setFormData({ ...formData, typeContrat: e.target.value as Employe["typeContrat"] })
                    }
                    className="w-full px-3 py-2 border border-[#2D7A32]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent"
                    required
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo (optionnel)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, photo: e.target.files?.[0] || null })
                  }
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" loading={loading}>
                  {loading ? "Création..." : "Créer la fiche"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, poste, département..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des employés</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployes.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun employé trouvé</p>
              <p className="text-gray-400 text-sm mt-2">
                {employes.length === 0
                  ? "Créez votre premier employé pour commencer"
                  : "Aucun résultat ne correspond à votre recherche"}
              </p>
              {employes.length === 0 && (
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  Créer un employé
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date embauche</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type contrat</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Solde congés</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployes.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {emp.photoUrl ? (
                            <img
                              src={emp.photoUrl}
                              alt={`${emp.prenom} ${emp.nom}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#2D7A32] flex items-center justify-center text-white font-medium">
                              {emp.prenom[0]}{emp.nom[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {emp.prenom} {emp.nom}
                            </div>
                            <div className="text-sm text-gray-500">{emp.poste}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {emp.email}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(emp.dateEmbauche).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                          {emp.typeContrat}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{emp.soldeConges} jours</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="Voir les détails">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Supprimer"
                            onClick={() => handleDelete(emp.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
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
