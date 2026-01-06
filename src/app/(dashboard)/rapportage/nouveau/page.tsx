"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { FileUpload } from "@/components/forms/FileUpload"

export default function NouveauRapportPage() {
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
      alert("Veuillez uploader un document de rapport")
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

      // Calculer la date limite selon le type de rapport
      const dateLimite = new Date()
      if (formData.get("type_rapport") === "mensuel") {
        dateLimite.setMonth(dateLimite.getMonth() + 1)
      } else if (formData.get("type_rapport") === "trimestriel") {
        dateLimite.setMonth(dateLimite.getMonth() + 3)
      } else if (formData.get("type_rapport") === "annuel") {
        dateLimite.setFullYear(dateLimite.getFullYear() + 1)
      }

      const { error } = await supabase
        .from("rapports")
        .insert({
          id_responsable: user.id,
          type_rapport: formData.get("type_rapport") as string,
          periode: formData.get("periode") as string,
          chemin_document: file.chemin_fichier,
          date_limite: dateLimite.toISOString().split("T")[0],
          id_projet: formData.get("id_projet") || null,
          statut: "en_attente",
        })

      if (error) throw error

      router.push("/rapportage")
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau rapport</h1>
        <p className="text-[#757575]">
          Soumettez un nouveau rapport
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du rapport</CardTitle>
          <CardDescription>
            Renseignez les informations et uploadez le document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type de rapport *</label>
              <Select name="type_rapport" required>
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="annuel">Annuel</option>
                <option value="final">Final</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Période *</label>
              <Input
                name="periode"
                required
                placeholder="Ex: Janvier 2024, Q1 2024, etc."
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
              <label className="text-sm font-medium">Document du rapport *</label>
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


