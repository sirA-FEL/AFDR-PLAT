"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { DollarSign, Plus, Search, Download } from "lucide-react"

interface LigneBudgetaire {
  id: string
  nom: string
  montant_alloue: number
  montant_engage: number
  montant_paye: number
  annee: number
  statut: string
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<LigneBudgetaire[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    setLoading(true)
    try {
      const { budgetsService } = await import("@/lib/supabase/services")
      const data = await budgetsService.getAll()
      setBudgets(data)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // Export Excel à implémenter avec xlsx
    alert("Export Excel à implémenter")
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D7A32]">Budgets</h1>
          <p className="text-gray-600 mt-1">Gestion des lignes budgétaires</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Link href="/finance/budgets/nouveau">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Nouveau budget
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-gray-500">Chargement...</p>
            </div>
          </CardContent>
        </Card>
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun budget trouvé</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lignes budgétaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Année</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Alloué</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Engagé</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Payé</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((budget) => (
                    <tr key={budget.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium">{budget.nom}</td>
                      <td className="py-4 px-4">{budget.annee}</td>
                      <td className="py-4 px-4">
                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(budget.montant_alloue)}
                      </td>
                      <td className="py-4 px-4">
                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(budget.montant_engage)}
                      </td>
                      <td className="py-4 px-4">
                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(budget.montant_paye)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 capitalize">
                          {budget.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
