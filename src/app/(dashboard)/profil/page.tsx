"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { User, Mail, Briefcase, Building, Camera, Save } from "lucide-react"

interface Profil {
  id: string
  email: string
  nom: string
  prenom?: string
  photo?: string
  departement?: string
  poste?: string
}

export default function ProfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profil, setProfil] = useState<Profil | null>(null)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    poste: "",
    departement: "",
  })

  useEffect(() => {
    loadProfil()
  }, [])

  const loadProfil = async () => {
    setLoading(true)
    try {
      const { profilService } = await import("@/lib/supabase/services")
      const data = await profilService.getCurrent()
      setProfil(data)
      setFormData({
        nom: data.nom || "",
        prenom: data.prenom || "",
        email: data.email || "",
        poste: data.poste || "",
        departement: data.departement || "",
      })
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { profilService } = await import("@/lib/supabase/services")
      await profilService.update({
        nom: formData.nom,
        prenom: formData.prenom,
        poste: formData.poste,
        departement: formData.departement,
      })
      await loadProfil()
      alert("Profil mis à jour avec succès")
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de la mise à jour")
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const { profilService } = await import("@/lib/supabase/services")
      const url = await profilService.uploadPhoto(file)
      await loadProfil()
      alert("Photo mise à jour avec succès")
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de l'upload de la photo")
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Chargement...</p>
        </div>
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
      <h1 className="text-3xl font-bold text-[#2D7A32]">Mon profil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                {profil?.photo ? (
                  <img
                    src={profil.photo}
                    alt="Photo de profil"
                    className="h-32 w-32 rounded-full object-cover mx-auto"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-[#2D7A32] flex items-center justify-center text-white text-4xl font-bold mx-auto">
                    {profil?.prenom?.[0] || profil?.nom?.[0] || "U"}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-[#2D7A32] text-white p-2 rounded-full cursor-pointer hover:bg-[#4CAF50]">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <h2 className="text-xl font-bold">
                {profil?.prenom} {profil?.nom}
              </h2>
              {profil?.poste && <p className="text-gray-600">{profil.poste}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Nom
                </label>
                <Input
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <Input
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              <Input value={formData.email} disabled />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Poste
                </label>
                <Input
                  value={formData.poste}
                  onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-1" />
                  Département
                </label>
                <Input
                  value={formData.departement}
                  onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
