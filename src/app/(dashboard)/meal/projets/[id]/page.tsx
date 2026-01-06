"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, BarChart3 } from "lucide-react"

export default function ProjetDetailPage() {
  const params = useParams()
  const [projet, setProjet] = useState<any>(null)
  const [activites, setActivites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadProjet()
      loadActivites()
    }
  }, [params.id])

  const loadProjet = async () => {
    try {
      const { data, error } = await supabase
        .from("projets")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) throw error
      setProjet(data)
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadActivites = async () => {
    try {
      const { data, error } = await supabase
        .from("activites")
        .select("*")
        .eq("id_projet", params.id)
        .order("ordre", { ascending: true })

      if (error) throw error
      setActivites(data || [])
    } catch (error: any) {
      console.error("Erreur:", error)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  if (!projet) {
    return <div>Projet non trouvé</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1B5E20]">{projet.nom}</h1>
          <p className="text-[#757575]">
            {projet.code_projet}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/meal/projets/${projet.id}/activites`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une activité
            </Button>
          </Link>
          <Link href={`/meal/projets/${projet.id}/dashboard`}>
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations du projet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <p className="text-sm font-medium text-[#757575]">Statut</p>
              <Badge variant={projet.statut === "actif" ? "success" : "secondary"}>
                {projet.statut}
              </Badge>
            </div>
            {projet.date_debut && (
              <div>
                <p className="text-sm font-medium text-[#757575]">Date de début</p>
                <p className="text-[#212121]">{new Date(projet.date_debut).toLocaleDateString("fr-FR")}</p>
              </div>
            )}
            {projet.date_fin && (
              <div>
                <p className="text-sm font-medium text-[#757575]">Date de fin</p>
                <p className="text-[#212121]">{new Date(projet.date_fin).toLocaleDateString("fr-FR")}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-[#757575]">Budget total</p>
              <p className="text-lg font-semibold">
                {projet.budget_total.toLocaleString("fr-FR")} FCFA
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectifs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#212121]">
              {projet.objectifs || "Aucun objectif défini"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activités ({activites.length})</CardTitle>
          <CardDescription>
            Liste des activités du projet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activites.length === 0 ? (
            <p className="text-center text-[#757575] py-8">
              Aucune activité pour ce projet
            </p>
          ) : (
            <div className="space-y-2">
              {activites.map((activite) => (
                <div
                  key={activite.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{activite.nom}</p>
                    {activite.description && (
                      <p className="text-sm text-[#757575]">
                        {activite.description}
                      </p>
                    )}
                  </div>
                  <Link href={`/meal/projets/${projet.id}/activites/${activite.id}`}>
                    <Button variant="ghost" size="sm">
                      Voir
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


