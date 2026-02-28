"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Bell,
  ArrowRight,
  Calendar,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Notification {
  id: string
  titre: string
  message: string
  created_at: string
  lue: boolean
  lien?: string
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    ordresEnAttente: 0,
    mesTaches: 0,
    mesProjets: 0,
    notificationsNonLues: 0,
  })
  const [cockpitKpi, setCockpitKpi] = useState({
    projetsActifs: 0,
    budgetTotal: 0,
    budgetDepense: 0,
    tauxPhysiqueMoyen: 0,
    tauxFinancierMoyen: 0,
    ordresParStatut: {} as Record<string, number>,
  })
  const [cockpitData, setCockpitData] = useState<{
    projets: any[]
    activites: any[]
    indicateurs: any[]
    ordres: any[]
    depenses: any[]
  }>({ projets: [], activites: [], indicateurs: [], ordres: [], depenses: [] })
  const [notificationsRecentes, setNotificationsRecentes] = useState<Notification[]>([])
  const [tachesEnAttente, setTachesEnAttente] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const { ordresMissionService, projetsService, notificationsService, activitesProjetService, indicateursProjetService } = await import("@/lib/supabase/services")
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Ordres et notifications (existants)
      const [ordresEnAttente, mesProjets, notifications, allProjets, allOrdres] = await Promise.all([
        ordresMissionService.getAll({ statut: "en_attente" }),
        user ? projetsService.getAll({ id_responsable: user.id }) : [],
        notificationsService.getAll({ lue: false }),
        projetsService.getAll(),
        ordresMissionService.getAll(),
      ])

      const notificationsNonLues = await notificationsService.countUnread()
      setNotificationsRecentes(notifications.slice(0, 5))

      setStats({
        ordresEnAttente: ordresEnAttente.length,
        mesTaches: 0,
        mesProjets: mesProjets.length,
        notificationsNonLues,
      })

      // Cockpit : limiter à 50 projets pour les détails
      const projetIds = (allProjets as any[]).slice(0, 50).map((p) => p.id)
      let activites: any[] = []
      let indicateurs: any[] = []
      let depenses: any[] = []

      if (projetIds.length > 0) {
        const [actRes, indRes] = await Promise.all([
          supabase.from("activites_projet").select("*").in("id_projet", projetIds),
          supabase.from("indicateurs_projet").select("*").in("id_projet", projetIds),
        ])
        activites = actRes.data ?? []
        indicateurs = indRes.data ?? []
      }

      try {
        const { depensesService } = await import("@/lib/supabase/services")
        depenses = await depensesService.getAll()
      } catch {
        depenses = []
      }

      setCockpitData({
        projets: allProjets as any[],
        activites,
        indicateurs,
        ordres: allOrdres as any[],
        depenses,
      })

      const now = new Date().toISOString().slice(0, 10)
      const projetsActifs = (allProjets as any[]).filter((p) => p.date_fin >= now).length
      const budgetTotal = (allProjets as any[]).reduce((s, p) => s + Number(p.budget_total ?? 0), 0)
      const budgetDepense = activites.reduce((s, a) => s + Number(a.depenses_reelles ?? 0), 0)
      const totalPhysique = activites.reduce((s, a) => s + (a.taux_realisation_physique ?? 0), 0)
      const totalFinancier = activites.reduce((s, a) => s + Number(a.taux_realisation_financiere ?? 0), 0)
      const n = activites.length || 1
      const ordresParStatut = (allOrdres as any[]).reduce(
        (acc, o) => {
          const st = o.statut ?? "brouillon"
          acc[st] = (acc[st] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      setCockpitKpi({
        projetsActifs,
        budgetTotal,
        budgetDepense,
        tauxPhysiqueMoyen: Math.round(totalPhysique / n),
        tauxFinancierMoyen: Math.round(totalFinancier / n),
        ordresParStatut,
      })
    } catch (error) {
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
      {/* Header avec banner */}
      <div className="bg-gradient-to-r from-[#2D7A32] to-[#4CAF50] rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-white/90 text-lg">Bienvenue sur la plateforme AFDR</p>
      </div>

      {/* Cockpit de pilotage - KPI */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cockpit de pilotage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Projets actifs</p>
              <p className="text-2xl font-bold text-[#2D7A32] mt-1">{loading ? "—" : cockpitKpi.projetsActifs}</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget total (FCFA)</p>
              <p className="text-2xl font-bold text-[#2D7A32] mt-1">
                {loading ? "—" : cockpitKpi.budgetTotal.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dépensé (FCFA)</p>
              <p className="text-2xl font-bold text-[#2D7A32] mt-1">
                {loading ? "—" : cockpitKpi.budgetDepense.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Taux réal. physique</p>
              <p className="text-2xl font-bold text-[#2D7A32] mt-1">{loading ? "—" : `${cockpitKpi.tauxPhysiqueMoyen} %`}</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Taux réal. financier</p>
              <p className="text-2xl font-bold text-[#2D7A32] mt-1">{loading ? "—" : `${cockpitKpi.tauxFinancierMoyen} %`}</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ordres en attente</p>
              <p className="text-2xl font-bold text-[#2D7A32] mt-1">
                {loading ? "—" : (cockpitKpi.ordresParStatut["en_attente"] ?? 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Graphiques avancés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget par projet (top 10) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget par projet</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-500">Chargement...</div>
            ) : cockpitData.projets.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">Aucune donnée</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cockpitData.projets
                      .slice()
                      .sort((a, b) => Number(b.budget_total ?? 0) - Number(a.budget_total ?? 0))
                      .slice(0, 10)
                      .map((p) => ({
                        nom: (p.nom ?? "").length > 12 ? (p.nom as string).slice(0, 12) + "…" : p.nom,
                        budget: Number(p.budget_total ?? 0),
                      }))}
                    margin={{ top: 8, right: 8, left: 8, bottom: 24 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                    <Tooltip formatter={(v: number | undefined) => [(v ?? 0).toLocaleString("fr-FR"), "Budget (FCFA)"]} />
                    <Bar dataKey="budget" fill="#2D7A32" name="Budget (FCFA)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ordres de mission par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ordres de mission par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-500">Chargement...</div>
            ) : Object.keys(cockpitKpi.ordresParStatut).length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">Aucune donnée</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(cockpitKpi.ordresParStatut).map(([statut, count]) => ({
                        name: statut.replace("_", " "),
                        value: count,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {Object.entries(cockpitKpi.ordresParStatut).map((_, i) => {
                        const colors = ["#2D7A32", "#4CAF50", "#81C784", "#FFB74D", "#E57373", "#64B5F6"]
                        return <Cell key={i} fill={colors[i % colors.length]} />
                      })}
                    </Pie>
                    <Tooltip formatter={(v: number | undefined) => [v ?? 0, "Nombre"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Indicateurs : objectif vs réalisé */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Indicateurs : objectif vs réalisé</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-500">Chargement...</div>
            ) : cockpitData.indicateurs.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">Aucun indicateur</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cockpitData.indicateurs
                      .slice(0, 12)
                      .map((ind) => ({
                        nom: (ind.nom ?? "").length > 14 ? (ind.nom as string).slice(0, 14) + "…" : ind.nom,
                        objectif: Number(ind.valeur_cible ?? 0),
                        realise: Number(ind.valeur_actuelle ?? 0),
                      }))}
                    margin={{ top: 8, right: 8, left: 8, bottom: 24 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="nom" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="objectif" fill="#94A3B8" name="Objectif" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="realise" fill="#2D7A32" name="Réalisé" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Widgets statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ordres de mission en attente */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Ordres de mission en attente
                </p>
                <p className="text-4xl font-bold text-[#2D7A32]">{stats.ordresEnAttente}</p>
              </div>
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-[#2D7A32]" />
              </div>
            </div>
            <Link href="/ordres-mission/validation" className="block mt-4">
              <Button variant="ghost" size="sm" className="w-full">
                Voir les ordres <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Mes tâches en attente</p>
                <p className="text-4xl font-bold text-[#2D7A32]">{stats.mesTaches}</p>
                <p className="text-xs text-gray-500 mt-1">Actions nécessitant votre attention</p>
              </div>
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mes projets */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Mes projets</p>
                <p className="text-4xl font-bold text-[#2D7A32]">{stats.mesProjets}</p>
              </div>
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <Link href="/meal/projets" className="block mt-4">
              <Button variant="ghost" size="sm" className="w-full">
                Voir mes projets <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Mes tâches en attente */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Notifications</p>
                <p className="text-4xl font-bold text-[#2D7A32]">{stats.notificationsNonLues}</p>
                <p className="text-xs text-gray-500 mt-1">Non lues</p>
              </div>
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center relative">
                <Bell className="h-8 w-8 text-yellow-600" />
                {stats.notificationsNonLues > 0 && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {stats.notificationsNonLues}
                  </span>
                )}
              </div>
            </div>
            <Link href="/notifications" className="block mt-4">
              <Button variant="ghost" size="sm" className="w-full">
                Voir toutes <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal en 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes tâches en attente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#2D7A32]" />
              Mes tâches en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tachesEnAttente.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Aucune tâche en attente pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tachesEnAttente.map((tache, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[#2D7A32] rounded-full flex items-center justify-center text-white">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tache.titre}</p>
                        <p className="text-sm text-gray-500">{tache.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Traiter
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#2D7A32]" />
              Notifications récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chargement...</p>
              </div>
            ) : notificationsRecentes.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Aucune notification récente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notificationsRecentes.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.lien || "/notifications"}
                    className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                      !notif.lue ? "bg-blue-50 border-l-4 border-blue-500" : "bg-gray-50"
                    }`}
                  >
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notif.titre}</p>
                      <p className="text-sm text-gray-600">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link href="/notifications">
                <Button variant="outline" className="w-full">
                  Voir toutes les notifications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/ordres-mission/nouveau">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Nouvel ordre</span>
              </Button>
            </Link>
            <Link href="/meal/projets/nouveau">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Nouveau projet</span>
              </Button>
            </Link>
            <Link href="/grh/employes">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                <span>Employés</span>
              </Button>
            </Link>
            <Link href="/finance">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <DollarSign className="h-6 w-6" />
                <span>Finance</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

