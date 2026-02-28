"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { ArrowLeft, Calendar, MapPin, Target, FileText } from "lucide-react"

export default function PartenaireProjetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projet, setProjet] = useState<any>(null)
  const [activites, setActivites] = useState<any[]>([])
  const [indicateurs, setIndicateurs] = useState<any[]>([])

  useEffect(() => {
    if (params.id) loadData()
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const { projetsService, activitesProjetService, indicateursProjetService } = await import(
        "@/lib/supabase/services"
      )
      const [p, a, i] = await Promise.all([
        projetsService.getById(params.id as string),
        activitesProjetService.getByProjet(params.id as string),
        indicateursProjetService.getByProjet(params.id as string),
      ])
      setProjet(p)
      setActivites(a)
      setIndicateurs(i)
    } catch (e) {
      console.error(e)
      router.push("/partenaire")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      </div>
    )
  }

  if (!projet) return null

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/partenaire">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2D7A32]">{projet.nom}</h1>
          <p className="text-sm text-gray-500">{projet.code_projet}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informations du projet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projet.zones_intervention && (Array.isArray(projet.zones_intervention) ? projet.zones_intervention.length > 0 : true) && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Zones d'intervention</p>
                <p className="text-gray-900">
                  {Array.isArray(projet.zones_intervention)
                    ? projet.zones_intervention.join(", ")
                    : projet.zones_intervention}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {new Date(projet.date_debut).toLocaleDateString("fr-FR")} –{" "}
              {new Date(projet.date_fin).toLocaleDateString("fr-FR")}
            </span>
          </div>
          {projet.objectifs && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Objectifs</p>
              <p className="text-gray-900 whitespace-pre-wrap">{projet.objectifs}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {activites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activités</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {activites.map((a) => (
                <li key={a.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <p className="font-medium text-gray-900">{a.nom}</p>
                  {a.description && (
                    <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Physique : {a.taux_realisation_physique ?? 0} %</span>
                    <span>Financier : {Number(a.taux_realisation_financiere ?? 0)} %</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {indicateurs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Indicateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {indicateurs.map((ind) => (
                <div key={ind.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-800">{ind.nom}</p>
                  <p className="text-2xl font-bold text-[#2D7A32] mt-1">
                    {ind.valeur_actuelle != null ? Number(ind.valeur_actuelle) : "–"}
                    {ind.unite && <span className="text-base font-normal text-gray-600"> {ind.unite}</span>}
                  </p>
                  {ind.valeur_cible != null && (
                    <p className="text-xs text-gray-500 mt-1">
                      Cible : {Number(ind.valeur_cible)} {ind.unite ?? ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
