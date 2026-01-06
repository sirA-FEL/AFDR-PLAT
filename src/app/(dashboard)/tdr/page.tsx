"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function TdrPage() {
  const [tdrs, setTdrs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadTdrs()
  }, [])

  const loadTdrs = async () => {
    try {
      const { data, error } = await supabase
        .from("tdrs")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTdrs(data || [])
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
          <h1 className="text-3xl font-bold text-[#1B5E20]">Termes de Référence</h1>
          <p className="text-[#757575]">
            Gérez les TdRs
          </p>
        </div>
        <Link href="/tdr/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau TdR
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des TdRs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tdrs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#757575]">
                    Aucun TdR trouvé
                  </TableCell>
                </TableRow>
              ) : (
                tdrs.map((tdr) => (
                  <TableRow key={tdr.id}>
                    <TableCell className="font-medium">{tdr.titre}</TableCell>
                    <TableCell>{tdr.type_tdr}</TableCell>
                    <TableCell>
                      {tdr.budget ? `${tdr.budget.toLocaleString("fr-FR")} FCFA` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tdr.statut === "approuve" ? "success" : "warning"}>
                        {tdr.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(tdr.created_at).toLocaleDateString("fr-FR")}
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


