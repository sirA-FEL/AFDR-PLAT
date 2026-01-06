"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function RapportagePage() {
  const [rapports, setRapports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadRapports()
  }, [])

  const loadRapports = async () => {
    try {
      const { data, error } = await supabase
        .from("rapports")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setRapports(data || [])
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
          <h1 className="text-3xl font-bold text-[#1B5E20]">Rapportage</h1>
          <p className="text-[#757575]">
            Gérez les rapports
          </p>
        </div>
        <Link href="/rapportage/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rapport
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des rapports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Date limite</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Jours de retard</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rapports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#757575]">
                    Aucun rapport trouvé
                  </TableCell>
                </TableRow>
              ) : (
                rapports.map((rapport) => (
                  <TableRow key={rapport.id}>
                    <TableCell className="font-medium">{rapport.type_rapport}</TableCell>
                    <TableCell>{rapport.periode}</TableCell>
                    <TableCell>
                      {new Date(rapport.date_limite).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rapport.statut === "en_retard"
                            ? "destructive"
                            : rapport.statut === "soumis"
                            ? "success"
                            : "warning"
                        }
                      >
                        {rapport.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const dateLimite = new Date(rapport.date_limite)
                        const aujourdhui = new Date()
                        aujourdhui.setHours(0, 0, 0, 0)
                        dateLimite.setHours(0, 0, 0, 0)
                        const joursRetard = Math.max(0, Math.floor((aujourdhui.getTime() - dateLimite.getTime()) / (1000 * 60 * 60 * 24)))
                        return joursRetard > 0 ? (
                          <span className="text-red-600">{joursRetard} jours</span>
                        ) : (
                          "-"
                        )
                      })()}
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

