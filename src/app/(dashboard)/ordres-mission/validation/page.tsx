"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X } from "lucide-react"

export default function ValidationOrdresPage() {
  const [ordres, setOrdres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrdre, setSelectedOrdre] = useState<any>(null)
  const [commentaire, setCommentaire] = useState("")
  const supabase = createClient()

  useEffect(() => {
    loadOrdres()
  }, [])

  const loadOrdres = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Récupérer les ordres en attente de validation
      const { data, error } = await supabase
        .from("ordres_mission")
        .select("*")
        .in("statut", ["en_attente_chef", "en_attente_finance", "en_attente_direction"])
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrdres(data || [])
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidation = async (ordre: any, decision: "approuve" | "rejete") => {
    if (decision === "rejete" && !commentaire.trim()) {
      alert("Un commentaire est obligatoire pour rejeter un ordre de mission")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Déterminer le niveau de validation selon le statut
      let niveauValidation: "chef" | "finance" | "direction" = "chef"
      if (ordre.statut === "en_attente_finance") niveauValidation = "finance"
      if (ordre.statut === "en_attente_direction") niveauValidation = "direction"

      // Créer la validation
      const { error: validationError } = await supabase
        .from("validations_ordre_mission")
        .insert({
          id_ordre_mission: ordre.id,
          id_validateur: user.id,
          niveau_validation: niveauValidation,
          decision,
          commentaire: decision === "rejete" ? commentaire : null,
        })

      if (validationError) throw validationError

      // Mettre à jour le statut
      let nouveauStatut = ""
      if (decision === "rejete") {
        nouveauStatut = "rejete"
      } else {
        if (niveauValidation === "chef") {
          nouveauStatut = "en_attente_finance"
        } else if (niveauValidation === "finance") {
          nouveauStatut = "en_attente_direction"
        } else if (niveauValidation === "direction") {
          nouveauStatut = "approuve"
        }
      }

      const { error: ordreError } = await supabase
        .from("ordres_mission")
        .update({
          statut: nouveauStatut,
          commentaire_rejet: decision === "rejete" ? commentaire : null,
        })
        .eq("id", ordre.id)

      if (ordreError) throw ordreError

      setSelectedOrdre(null)
      setCommentaire("")
      loadOrdres()
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1B5E20]">Validation des ordres de mission</h1>
        <p className="text-[#757575]">
          Validez ou rejetez les ordres de mission en attente
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ordres en attente</CardTitle>
            <CardDescription>
              {ordres.length} ordre(s) en attente de validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ordres.length === 0 ? (
                <p className="text-sm text-[#757575]">Aucun ordre en attente</p>
              ) : (
                ordres.map((ordre) => (
                  <div
                    key={ordre.id}
                    className="cursor-pointer rounded-lg border border-[#2D7A32]/20 p-4 hover:bg-[#F5F5F5] hover:border-[#2D7A32]/40 transition-all"
                    onClick={() => setSelectedOrdre(ordre)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{ordre.destination}</p>
                        <p className="text-sm text-[#757575]">
                          {new Date(ordre.date_debut).toLocaleDateString("fr-FR")} -{" "}
                          {new Date(ordre.date_fin).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge variant="warning">{ordre.statut}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {selectedOrdre && (
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'ordre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[#757575]">Destination</p>
                <p className="text-[#212121]">{selectedOrdre.destination}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#757575]">Dates</p>
                <p className="text-[#212121]">
                  {new Date(selectedOrdre.date_debut).toLocaleDateString("fr-FR")} -{" "}
                  {new Date(selectedOrdre.date_fin).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#757575]">Motif</p>
                <p className="text-[#212121]">{selectedOrdre.motif}</p>
              </div>
              {selectedOrdre.budget_estime && (
                <div>
                  <p className="text-sm font-medium text-[#757575]">Budget estimé</p>
                  <p className="text-[#212121] font-semibold">{selectedOrdre.budget_estime.toLocaleString("fr-FR")} FCFA</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Commentaire (obligatoire si rejet)</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-[#2D7A32]/20 bg-white px-3 py-2 text-sm focus:border-[#2D7A32] focus:ring-[#2D7A32]"
                  placeholder="Ajoutez un commentaire..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => handleValidation(selectedOrdre, "approuve")}
                  className="flex-1"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleValidation(selectedOrdre, "rejete")}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


