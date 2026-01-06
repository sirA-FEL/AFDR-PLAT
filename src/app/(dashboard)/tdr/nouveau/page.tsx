"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { FileUpload } from "@/components/forms/FileUpload"

export default function NouveauTdrPage() {
  const [projets, setProjets] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProjets()
  }, [])

  const loadProjets = async () => {
    try {
      const { data, error } = await supabase
        .from("projets")
        .select("id, nom")
        .eq("statut", "actif")

      if (error) throw error
      setProjets(data || [])
    } catch (error: any) {
      console.error("Erreur:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!uploadedFile || uploadedFile.length === 0) {
      alert("Veuillez uploader un document TdR")
      return
    }

    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const formData = new FormData(e.currentTarget)
      const file = uploadedFile[0]

      const { error } = await supabase
        .from("tdrs")
        .insert({
          id_demandeur: user.id,
          titre: formData.get("titre") as string,
          type_tdr: formData.get("type_tdr") as string,
          budget: formData.get("budget") ? parseFloat(formData.get("budget") as string) : null,
          delai_jours: formData.get("delai_jours") ? parseInt(formData.get("delai_jours") as string) : null,
          chemin_document: file.chemin_fichier,
          id_projet: formData.get("id_projet") || null,
          statut: "en_attente",
        })

      if (error) throw error

      router.push("/tdr")
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau TdR</h1>
        <p className="text-[#757575]">
          Soumettez un nouveau Terme de Référence
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du TdR</CardTitle>
          <CardDescription>
            Renseignez les informations et uploadez le document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre *</label>
              <Input name="titre" required placeholder="Titre du TdR" />
            </div>

            <div>
              <label className="text-sm font-medium">Type *</label>
              <Select name="type_tdr" required>
                <option value="consultant">Consultant</option>
                <option value="prestation">Prestation</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Budget (FCFA)</label>
              <Input
                type="number"
                step="0.01"
                name="budget"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Délai (jours)</label>
              <Input
                type="number"
                name="delai_jours"
                placeholder="Nombre de jours"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Projet (optionnel)</label>
              <Select name="id_projet">
                <option value="">Aucun projet</option>
                {projets.map((projet) => (
                  <option key={projet.id} value={projet.id}>
                    {projet.nom}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Document TdR *</label>
              <FileUpload
                onUploadComplete={(files) => setUploadedFile(files)}
                maxSize={10}
                accept=".pdf,.doc,.docx"
                multiple={false}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Soumission..." : "Soumettre"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


