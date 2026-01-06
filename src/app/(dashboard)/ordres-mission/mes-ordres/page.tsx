"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

const statutLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" }> = {
  brouillon: { label: "Brouillon", variant: "secondary" },
  en_attente_chef: { label: "En attente chef", variant: "warning" },
  en_attente_finance: { label: "En attente finance", variant: "warning" },
  en_attente_direction: { label: "En attente direction", variant: "warning" },
  approuve: { label: "Approuvé", variant: "success" },
  rejete: { label: "Rejeté", variant: "destructive" },
}

export default function MesOrdresPage() {
  const [ordres, setOrdres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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

      const { data, error } = await supabase
        .from("ordres_mission")
        .select("*")
        .eq("id_demandeur", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrdres(data || [])
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet ordre de mission ?")) return

    try {
      const { error } = await supabase
        .from("ordres_mission")
        .delete()
        .eq("id", id)

      if (error) throw error
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1B5E20]">Mes ordres de mission</h1>
          <p className="text-[#757575]">
            Consultez l'historique de vos ordres de mission
          </p>
        </div>
        <Link href="/ordres-mission/nouveau">
          <Button>Nouvel ordre de mission</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des ordres de mission</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destination</TableHead>
                <TableHead>Date début</TableHead>
                <TableHead>Date fin</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[#757575]">
                    Aucun ordre de mission trouvé
                  </TableCell>
                </TableRow>
              ) : (
                ordres.map((ordre) => {
                  const statut = statutLabels[ordre.statut] || { label: ordre.statut, variant: "default" as const }
                  return (
                    <TableRow key={ordre.id}>
                      <TableCell className="font-medium">{ordre.destination}</TableCell>
                      <TableCell>{new Date(ordre.date_debut).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>{new Date(ordre.date_fin).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        <Badge variant={statut.variant}>{statut.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {ordre.budget_estime
                          ? `${ordre.budget_estime.toLocaleString("fr-FR")} FCFA`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ordre.statut === "approuve" && (
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {ordre.statut === "brouillon" && (
                            <>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(ordre.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


