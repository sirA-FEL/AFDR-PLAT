"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ProjetDashboardPage() {
  const params = useParams()
  const [projet, setProjet] = useState<any>(null)
  const [activites, setActivites] = useState<any[]>([])
  const [tauxRealisation, setTauxRealisation] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadData()
    }
  }, [params.id])

  const loadData = async () => {
    try {
      // Charger le projet
      const { data: projetData, error: projetError } = await supabase
        .from("projets")
        .select("*")
        .eq("id", params.id)
        .single()

      if (projetError) throw projetError
      setProjet(projetData)

      // Charger les activités avec leur avancement
      const { data: activitesData, error: activitesError } = await supabase
        .from("activites")
        .select(`
          *,
          avancement_activite (
            taux_realisation_physique,
            taux_realisation_financier,
            date_mise_a_jour
          )
        `)
        .eq("id_projet", params.id)

      if (activitesError) throw activitesError
      setActivites(activitesData || [])

      // Calculer le taux de réalisation global
      if (activitesData && activitesData.length > 0) {
        const { data: tauxData, error: tauxError } = await supabase.rpc(
          "calculer_taux_realisation_projet",
          { id_projet_uuid: params.id }
        )

        if (!tauxError && tauxData !== null) {
          setTauxRealisation(tauxData)
        }
      }
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  if (!projet) {
    return <div>Projet non trouvé</div>
  }

  const chartData = activites.map((activite) => {
    const dernierAvancement = activite.avancement_activite?.[0]
    return {
      nom: activite.nom,
      physique: dernierAvancement?.taux_realisation_physique || 0,
      financier: dernierAvancement?.taux_realisation_financier || 0,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1B5E20]">Dashboard - {projet.nom}</h1>
        <p className="text-[#757575]">
          Vue d'ensemble du projet
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Taux de réalisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tauxRealisation.toFixed(1)}%</div>
            <p className="text-sm text-[#757575]">
              Moyenne des activités
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nombre d'activités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1976D2]">{activites.length}</div>
            <p className="text-sm text-[#757575]">
              Activités créées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2D7A32]">
              {projet.budget_total.toLocaleString("fr-FR")}
            </div>
            <p className="text-sm text-[#757575]">FCFA</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparaison physique vs financier</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nom" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="physique" fill="#8884d8" name="Physique (%)" />
              <Bar dataKey="financier" fill="#82ca9d" name="Financier (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}


