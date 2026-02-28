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
  Users,
  UserPlus,
  X,
} from "lucide-react"

interface Projet {
  id: string
  nom: string
  code_projet: string
  objectifs?: string
  zones_intervention?: string | string[]
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
  const [partenaires, setPartenaires] = useState<{ id: string; id_partenaire: string; nom?: string; email?: string }[]>([])
  const [partenairesDispos, setPartenairesDispos] = useState<{ id: string; nom: string; email: string }[]>([])
  const [partenaireSelect, setPartenaireSelect] = useState("")
  const [partenaireLoading, setPartenaireLoading] = useState(false)

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

      // Charger les statistiques (activités et indicateurs)
      const { activitesProjetService, indicateursProjetService } = await import(
        "@/lib/supabase/services"
      )
      const [activitesList, indicateursList] = await Promise.all([
        activitesProjetService.getByProjet(data.id),
        indicateursProjetService.getByProjet(data.id),
      ])

      setStats({
        activites: activitesList.length,
        indicateurs: indicateursList.length,
        budgetUtilise: 0,
      })

      const { partenairesProjetService } = await import("@/lib/supabase/services")
      const [partenairesList, disposList] = await Promise.all([
        partenairesProjetService.getPartenairesPourProjet(data.id),
        partenairesProjetService.getUtilisateursPartenaire(),
      ])
      setPartenairesDispos(disposList)
      const avecProfils = await Promise.all(
        partenairesList.map(async (pp) => {
          const { data: pr } = await supabase
            .from("profils")
            .select("nom, prenom, email")
            .eq("id", pp.id_partenaire)
            .single()
          return {
            id: pp.id,
            id_partenaire: pp.id_partenaire,
            nom: pr ? [pr.prenom, pr.nom].filter(Boolean).join(" ") : undefined,
            email: pr?.email,
          }
        })
      )
      setPartenaires(avecProfils)
    } catch (error: any) {
      console.error("Erreur:", error)
      router.push("/meal/projets")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} FCFA`
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

            {projet.zones_intervention && (Array.isArray(projet.zones_intervention) ? projet.zones_intervention.length > 0 : true) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Zones d'intervention</p>
                  <p className="text-gray-900">
                    {Array.isArray(projet.zones_intervention)
                      ? projet.zones_intervention.join(", ")
                      : projet.zones_intervention}
                  </p>
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

      {/* Partenaires : partage du projet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Partenaires ayant accès à ce projet
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Les partenaires sélectionnés pourront voir ce projet en lecture seule dans leur espace partenaire.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {partenaires.map((p) => (
              <li
                key={p.id_partenaire}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{p.nom || p.email || p.id_partenaire}</p>
                  {p.email && <p className="text-xs text-gray-500">{p.email}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={partenaireLoading}
                  onClick={async () => {
                    setPartenaireLoading(true)
                    try {
                      const { partenairesProjetService } = await import("@/lib/supabase/services")
                      await partenairesProjetService.retirer(projet.id, p.id_partenaire)
                      setPartenaires((prev) => prev.filter((x) => x.id_partenaire !== p.id_partenaire))
                    } finally {
                      setPartenaireLoading(false)
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Retirer
                </Button>
              </li>
            ))}
          </ul>
          {partenaires.length === 0 && (
            <p className="text-sm text-gray-500 italic">Aucun partenaire n'a accès à ce projet.</p>
          )}
          <div className="flex flex-wrap items-end gap-2 pt-2">
            <div className="min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Partager avec un partenaire
              </label>
              <select
                value={partenaireSelect}
                onChange={(e) => setPartenaireSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent"
              >
                <option value="">Sélectionner un partenaire</option>
                {partenairesDispos
                  .filter((d) => !partenaires.some((p) => p.id_partenaire === d.id))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nom} ({d.email})
                    </option>
                  ))}
              </select>
            </div>
            <Button
              size="sm"
              disabled={!partenaireSelect || partenaireLoading}
              onClick={async () => {
                if (!partenaireSelect) return
                setPartenaireLoading(true)
                try {
                  const { partenairesProjetService } = await import("@/lib/supabase/services")
                  await partenairesProjetService.ajouter(projet.id, partenaireSelect)
                  const added = partenairesDispos.find((d) => d.id === partenaireSelect)
                  setPartenaires((prev) => [
                    ...prev,
                    {
                      id: "",
                      id_partenaire: partenaireSelect,
                      nom: added?.nom,
                      email: added?.email,
                    },
                  ])
                  setPartenaireSelect("")
                } finally {
                  setPartenaireLoading(false)
                }
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
