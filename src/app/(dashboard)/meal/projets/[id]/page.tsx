"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  MapPin,
  TrendingUp,
  BarChart3,
  List,
  Edit,
  Download,
} from "lucide-react"

interface Projet {
  id: string
  nom: string
  code_projet: string
  objectifs?: string
  zones_intervention?: string
  date_debut: string
  date_fin: string
  budget_total: number
  id_responsable: string
  date_creation: string
}

export default function ProjetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projet, setProjet] = useState<Projet | null>(null)
  const [responsable, setResponsable] = useState<string>("")
  const [stats, setStats] = useState({
    activites: 0,
    indicateurs: 0,
    budgetUtilise: 0,
  })

  useEffect(() => {
    if (params.id) {
      loadProjet()
    }
  }, [params.id])

  const loadProjet = async () => {
    setLoading(true)
    try {
      const { projetsService } = await import("@/lib/supabase/services")
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const data = await projetsService.getById(params.id as string)
      setProjet(data)

      // Charger le profil du responsable
      const { data: profil } = await supabase
        .from("profils")
        .select("nom, prenom")
        .eq("id", data.id_responsable)
        .single()

      setResponsable(profil ? `${profil.prenom} ${profil.nom}` : "Inconnu")

      // Charger les statistiques
      const { data: activites } = await supabase
        .from("activites_projet")
        .select("id", { count: "exact", head: true })
        .eq("id_projet", data.id)

      const { data: indicateurs } = await supabase
        .from("indicateurs_projet")
        .select("id", { count: "exact", head: true })
        .eq("id_projet", data.id)

      setStats({
        activites: activites?.length || 0,
        indicateurs: indicateurs?.length || 0,
        budgetUtilise: 0, // À calculer depuis les dépenses
      })
    } catch (error: any) {
      console.error("Erreur:", error)
      router.push("/meal/projets")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const getProgressPercentage = () => {
    if (!projet) return 0
    const today = new Date()
    const debut = new Date(projet.date_debut)
    const fin = new Date(projet.date_fin)
    const total = fin.getTime() - debut.getTime()
    const elapsed = today.getTime() - debut.getTime()
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!projet) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Projet introuvable</p>
          <Link href="/meal/projets" className="inline-block mt-4">
            <Button>Retour à la liste</Button>
          </Link>
        </div>
      </div>
    )
  }

  const progress = getProgressPercentage()

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
          <Link href="/meal/projets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#2D7A32]">{projet.nom}</h1>
            <p className="text-gray-600 mt-1 font-mono">{projet.code_projet}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
        <Link href={`/meal/projets/${projet.id}`}>
          <Button variant="ghost" size="sm" className="font-medium">
            Vue d'ensemble
          </Button>
        </Link>
        <Link href={`/meal/projets/${projet.id}/dashboard`}>
          <Button variant="ghost" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Link href={`/meal/projets/${projet.id}/activites`}>
          <Button variant="ghost" size="sm">
            <List className="h-4 w-4 mr-2" />
            Activités
          </Button>
        </Link>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Budget total</p>
                <p className="text-2xl font-bold text-[#2D7A32]">{formatCurrency(projet.budget_total)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#2D7A32]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Activités</p>
                <p className="text-2xl font-bold text-[#2D7A32]">{stats.activites}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <List className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Indicateurs</p>
                <p className="text-2xl font-bold text-[#2D7A32]">{stats.indicateurs}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avancement</p>
                <p className="text-2xl font-bold text-[#2D7A32]">{progress}%</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails du projet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Période</p>
                <p className="text-gray-900">
                  {new Date(projet.date_debut).toLocaleDateString("fr-FR")} -{" "}
                  {new Date(projet.date_fin).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Responsable</p>
                <p className="text-gray-900">{responsable}</p>
              </div>
            </div>

            {projet.zones_intervention && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Zones d'intervention</p>
                  <p className="text-gray-900">{projet.zones_intervention}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectifs</CardTitle>
          </CardHeader>
          <CardContent>
            {projet.objectifs ? (
              <p className="text-gray-700 whitespace-pre-wrap">{projet.objectifs}</p>
            ) : (
              <p className="text-gray-400 italic">Aucun objectif défini</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Barre de progression */}
      <Card>
        <CardHeader>
          <CardTitle>Avancement temporel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progression</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-[#2D7A32] h-4 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Début: {new Date(projet.date_debut).toLocaleDateString("fr-FR")}</span>
              <span>Fin: {new Date(projet.date_fin).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
