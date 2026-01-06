"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { X } from "lucide-react"

export default function NouveauBudgetPage() {
  const [projets, setProjets] = useState<any[]>([])
  const [selectedProjet, setSelectedProjet] = useState("")
  const [lignes, setLignes] = useState<Array<{ categorie: string; montant: number }>>([
    { categorie: "", montant: 0 },
  ])
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

  const addLigne = () => {
    setLignes([...lignes, { categorie: "", montant: 0 }])
  }

  const removeLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const updateLigne = (index: number, field: string, value: any) => {
    const newLignes = [...lignes]
    newLignes[index] = { ...newLignes[index], [field]: value }
    setLignes(newLignes)
  }

  const handleSubmit = async () => {
    if (!selectedProjet) {
      alert("Veuillez sélectionner un projet")
      return
    }

    try {
      const lignesToInsert = lignes
        .filter((l) => l.categorie && l.montant > 0)
        .map((l) => ({
          id_projet: selectedProjet,
          categorie: l.categorie,
          montant_alloue: l.montant,
        }))

      const { error } = await supabase
        .from("lignes_budgetaires")
        .insert(lignesToInsert)

      if (error) throw error

      router.push("/finance/budgets")
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau budget</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Créez un budget pour un projet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du budget</CardTitle>
          <CardDescription>
            Sélectionnez un projet et définissez les lignes budgétaires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Projet *</label>
            <Select
              value={selectedProjet}
              onChange={(e) => setSelectedProjet(e.target.value)}
            >
              <option value="">Sélectionner un projet</option>
              {projets.map((projet) => (
                <option key={projet.id} value={projet.id}>
                  {projet.nom}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Lignes budgétaires</label>
              <Button type="button" variant="outline" onClick={addLigne}>
                Ajouter une ligne
              </Button>
            </div>

            {lignes.map((ligne, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Catégorie"
                  value={ligne.categorie}
                  onChange={(e) => updateLigne(index, "categorie", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Montant"
                  value={ligne.montant}
                  onChange={(e) =>
                    updateLigne(index, "montant", parseFloat(e.target.value) || 0)
                  }
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLigne(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSubmit}>Créer le budget</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

