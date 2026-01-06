"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from("lignes_budgetaires")
        .select(`
          *,
          projets:id_projet (
            nom
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setBudgets(data || [])
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
          <h1 className="text-3xl font-bold text-[#1B5E20]">Budgets</h1>
          <p className="text-[#757575]">
            Gérez les budgets des projets
          </p>
        </div>
        <Link href="/finance/budgets/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau budget
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lignes budgétaires</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projet</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Montant alloué</TableHead>
                <TableHead>Montant consommé</TableHead>
                <TableHead>Disponible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#757575]">
                    Aucune ligne budgétaire trouvée
                  </TableCell>
                </TableRow>
              ) : (
                budgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">
                      {budget.projets?.nom || "-"}
                    </TableCell>
                    <TableCell>{budget.categorie}</TableCell>
                    <TableCell>
                      {budget.montant_alloue.toLocaleString("fr-FR")} FCFA
                    </TableCell>
                    <TableCell>
                      {budget.montant_consomme.toLocaleString("fr-FR")} FCFA
                    </TableCell>
                    <TableCell>
                      {(budget.montant_alloue - budget.montant_consomme).toLocaleString("fr-FR")} FCFA
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


