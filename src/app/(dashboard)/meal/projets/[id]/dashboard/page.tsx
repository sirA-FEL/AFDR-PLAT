"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { ArrowLeft, TrendingUp, DollarSign, BarChart3, Target } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projet, setProjet] = useState<any>(null)
  const [activites, setActivites] = useState<any[]>([])
  const [indicateurs, setIndicateurs] = useState<any[]>([])

  useEffect(() => {
    if (params.id) {
      loadData()
    }
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const { projetsService, activitesProjetService, indicateursProjetService } = await import(
        "@/lib/supabase/services"
      )
      const [projetData, activitesData, indicateursData] = await Promise.all([
        projetsService.getById(params.id as string),
        activitesProjetService.getByProjet(params.id as string),
        indicateursProjetService.getByProjet(params.id as string),
      ])
      setProjet(projetData)
      setActivites(activitesData)
      setIndicateurs(indicateursData)
    } catch (error: any) {
      console.error("Erreur:", error)
      router.push("/meal/projets")
    } finally {
      setLoading(false)
    }
  }

  // Données réelles : taux de réalisation par activité
  const realisationData =
    activites.length > 0
      ? activites.map((a, i) => ({
          label: a.nom.length > 15 ? a.nom.slice(0, 15) + "…" : a.nom,
          nom: a.nom,
          physique: a.taux_realisation_physique ?? 0,
          financiere: Number(a.taux_realisation_financiere ?? 0),
        }))
      : [{ label: "Aucune donnée", nom: "", physique: 0, financiere: 0 }]

  // Budget par activité (alloué vs dépensé)
  const budgetData =
    activites.length > 0
      ? activites.map((a) => ({
          categorie: a.nom.length > 12 ? a.nom.slice(0, 12) + "…" : a.nom,
          alloue: Number(a.budget_alloue ?? 0),
          depense: Number(a.depenses_reelles ?? 0),
        }))
      : []

  const tauxPhysiqueMoyen =
    activites.length > 0
      ? Math.round(
          activites.reduce((s, a) => s + (a.taux_realisation_physique ?? 0), 0) / activites.length
        )
      : 0
  const tauxFinancierMoyen =
    activites.length > 0
      ? Math.round(
          activites.reduce((s, a) => s + Number(a.taux_realisation_financiere ?? 0), 0) /
            activites.length
        )
      : 0
  const totalAlloue = activites.reduce((s, a) => s + Number(a.budget_alloue ?? 0), 0)
  const totalDepense = activites.reduce((s, a) => s + Number(a.depenses_reelles ?? 0), 0)
  const budgetUtilisePct =
    projet?.budget_total && Number(projet.budget_total) > 0
      ? Math.round((totalDepense / Number(projet.budget_total)) * 100)
      : 0

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
        {/* Taux de réalisation (données réelles par activité) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#2D7A32]" />
              Taux de réalisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {realisationData.length > 0 && realisationData[0].nom !== "" ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={realisationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="physique"
                    stroke="#2D7A32"
                    name="Réalisation physique (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="financiere"
                    stroke="#4CAF50"
                    name="Réalisation financière (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 py-8 text-center">
                Ajoutez des activités au projet pour afficher les taux de réalisation.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Budget par activité (données réelles) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#2D7A32]" />
              Budget par activité
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetData.length > 0 ? (
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
            ) : (
              <p className="text-gray-500 py-8 text-center">
                Ajoutez des activités pour afficher le budget par activité.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Indicateurs clés (agrégés depuis les activités) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Taux de réalisation physique</p>
              <p className="text-4xl font-bold text-[#2D7A32]">{tauxPhysiqueMoyen}%</p>
              <p className="text-xs text-gray-500 mt-1">Moyenne des activités</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Taux de réalisation financière
              </p>
              <p className="text-4xl font-bold text-[#2D7A32]">{tauxFinancierMoyen}%</p>
              <p className="text-xs text-gray-500 mt-1">Moyenne des activités</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Budget utilisé</p>
              <p className="text-4xl font-bold text-[#2D7A32]">{budgetUtilisePct}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalDepense.toLocaleString("fr-FR")} /{" "}
                {Number(projet?.budget_total ?? 0).toLocaleString("fr-FR")} FCFA
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicateurs projet (valeur cible / actuelle) */}
      {indicateurs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#2D7A32]" />
              Indicateurs du projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indicateurs.map((ind) => (
                <div
                  key={ind.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50/50"
                >
                  <p className="text-sm font-medium text-gray-800">{ind.nom}</p>
                  {ind.description && (
                    <p className="text-xs text-gray-500 mt-1">{ind.description}</p>
                  )}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#2D7A32]">
                      {ind.valeur_actuelle != null ? Number(ind.valeur_actuelle) : "–"}
                    </span>
                    {ind.unite && <span className="text-sm text-gray-600">{ind.unite}</span>}
                    {ind.valeur_cible != null && (
                      <span className="text-sm text-gray-500">
                        / cible {Number(ind.valeur_cible)} {ind.unite ?? ""}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
