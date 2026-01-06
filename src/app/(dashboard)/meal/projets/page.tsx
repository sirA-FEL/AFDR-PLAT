"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function ProjetsPage() {
  const [projets, setProjets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadProjets()
  }, [])

  const loadProjets = async () => {
    try {
      const { data, error } = await supabase
        .from("projets")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setProjets(data || [])
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1B5E20]">Projets</h1>
          <p className="text-[#757575]">
            Gérez vos projets MEAL
          </p>
        </div>
        <Link href="/meal/projets/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des projets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Date début</TableHead>
                <TableHead>Date fin</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[#757575]">
                    Aucun projet trouvé
                  </TableCell>
                </TableRow>
              ) : (
                projets.map((projet) => (
                  <TableRow key={projet.id}>
                    <TableCell className="font-medium">{projet.nom}</TableCell>
                    <TableCell>{projet.code_projet || "-"}</TableCell>
                    <TableCell>
                      {projet.date_debut
                        ? new Date(projet.date_debut).toLocaleDateString("fr-FR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {projet.date_fin
                        ? new Date(projet.date_fin).toLocaleDateString("fr-FR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {projet.budget_total.toLocaleString("fr-FR")} FCFA
                    </TableCell>
                    <TableCell>
                      <Badge variant={projet.statut === "actif" ? "success" : "secondary"}>
                        {projet.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/meal/projets/${projet.id}`}>
                        <Button variant="ghost" size="sm">
                          Voir
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


