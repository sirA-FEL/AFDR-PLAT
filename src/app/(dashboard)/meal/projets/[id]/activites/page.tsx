"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { ArrowLeft, Plus, GripVertical } from "lucide-react"

interface Activite {
  id: string
  nom: string
  description?: string
  date_debut?: string
  date_fin?: string
  budget_alloue: number
  taux_realisation_physique: number
  taux_realisation_financiere: number
  depenses_reelles: number
  ordre: number
}

export default function ActivitesPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [activites, setActivites] = useState<Activite[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadActivites()
    }
  }, [params.id])

  const loadActivites = async () => {
    setLoading(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { data, error } = await supabase
        .from("activites_projet")
        .select("*")
        .eq("id_projet", params.id)
        .order("ordre", { ascending: true })

      if (error) throw error
      setActivites(data || [])
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/meal/projets/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-[#2D7A32]">Activités</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle activité
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle activité</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Formulaire de création d'activité à implémenter</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-gray-500">Chargement...</p>
            </div>
          </CardContent>
        </Card>
      ) : activites.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-gray-500">Aucune activité définie</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activites.map((activite) => (
            <Card key={activite.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{activite.nom}</h3>
                    {activite.description && (
                      <p className="text-gray-600 mb-4">{activite.description}</p>
                    )}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Réalisation physique</p>
                        <p className="font-medium">{activite.taux_realisation_physique}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Réalisation financière</p>
                        <p className="font-medium">{activite.taux_realisation_financiere}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Budget alloué</p>
                        <p className="font-medium">{activite.budget_alloue.toLocaleString()} €</p>
                      </div>
                    </div>
                  </div>
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
