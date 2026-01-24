"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { DollarSign, TrendingUp, AlertCircle, ArrowRight } from "lucide-react"

export default function FinancePage() {
  const [stats, setStats] = useState({
    budgetTotal: 0,
    depenses: 0,
    restant: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { budgetsService } = await import("@/lib/supabase/services")
      const totals = await budgetsService.getTotalGeneral()
      setStats({
        budgetTotal: totals.alloue,
        depenses: totals.paye,
        restant: totals.alloue - totals.paye,
      })
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 space-y-6"
    >
      <div className="bg-gradient-to-r from-[#2D7A32] to-[#4CAF50] rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Finance</h1>
        <p className="text-white/90 text-lg">Gestion financière et budgétaire</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Budget total</p>
                <p className="text-4xl font-bold text-[#2D7A32]">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(stats.budgetTotal)}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-[#2D7A32]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Dépenses</p>
                <p className="text-4xl font-bold text-blue-600">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(stats.depenses)}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Restant</p>
                <p className="text-4xl font-bold text-green-600">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(stats.restant)}
                </p>
              </div>
              <AlertCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/finance/budgets/nouveau">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <DollarSign className="h-6 w-6" />
                <span>Nouveau budget</span>
              </Button>
            </Link>
            <Link href="/finance/budgets">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Voir tous les budgets</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
