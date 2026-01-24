"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { ArrowLeft, TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projet, setProjet] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      loadData()
    }
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const { projetsService } = await import("@/lib/supabase/services")
      const data = await projetsService.getById(params.id as string)
      setProjet(data)
    } catch (error: any) {
      console.error("Erreur:", error)
      router.push("/meal/projets")
    } finally {
      setLoading(false)
    }
  }

  // Données d'exemple pour les graphiques (à remplacer par données réelles)
  const realisationData = [
    { mois: "Jan", physique: 20, financiere: 15 },
    { mois: "Fév", physique: 35, financiere: 28 },
    { mois: "Mar", physique: 50, financiere: 42 },
    { mois: "Avr", physique: 65, financiere: 58 },
    { mois: "Mai", physique: 80, financiere: 72 },
    { mois: "Jun", physique: 90, financiere: 85 },
  ]

  const budgetData = [
    { categorie: "Personnel", alloue: 50000, depense: 42000 },
    { categorie: "Équipement", alloue: 30000, depense: 25000 },
    { categorie: "Fonctionnement", alloue: 20000, depense: 18000 },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/meal/projets/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#2D7A32]">Dashboard</h1>
            <p className="text-gray-600 mt-1">{projet?.nom}</p>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taux de réalisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#2D7A32]" />
              Taux de réalisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={realisationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="physique" stroke="#2D7A32" name="Réalisation physique (%)" />
                <Line type="monotone" dataKey="financiere" stroke="#4CAF50" name="Réalisation financière (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#2D7A32]" />
              Budget par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categorie" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="alloue" fill="#2D7A32" name="Budget alloué" />
                <Bar dataKey="depense" fill="#4CAF50" name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Taux de réalisation physique</p>
              <p className="text-4xl font-bold text-[#2D7A32]">85%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Taux de réalisation financière</p>
              <p className="text-4xl font-bold text-[#2D7A32]">78%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Budget utilisé</p>
              <p className="text-4xl font-bold text-[#2D7A32]">72%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
