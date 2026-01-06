import { requireAuth } from "@/lib/supabase/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedStats } from "@/components/dashboard/AnimatedStats"

export default async function DashboardPage() {
  await requireAuth()
  const supabase = await createClient()

  // Récupérer les statistiques selon le rôle de l'utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer le profil et le rôle
  const { data: profile } = await supabase
    .from("profils")
    .select("id")
    .eq("id", user.id)
    .single()

  let userRole = "USER"
  if (profile) {
    const { data: roles } = await supabase
      .from("roles_utilisateurs")
      .select("role")
      .eq("id_utilisateur", profile.id)
      .limit(1)
      .single()

    if (roles) {
      userRole = roles.role
    }
  }

  // Statistiques selon le rôle
  let stats: any[] = []

  if (userRole === "USER" || userRole === "PM") {
    // Ordres de mission en attente
    const { count: ordresEnAttente } = await supabase
      .from("ordres_mission")
      .select("*", { count: "exact", head: true })
      .eq("id_demandeur", user.id)
      .in("statut", ["en_attente_chef", "en_attente_finance", "en_attente_direction"])

    stats.push({
      title: "Ordres de mission en attente",
      value: ordresEnAttente || 0,
      iconName: "FileText",
    })
  }

  if (userRole === "MEAL" || userRole === "PM") {
    // Projets actifs
    const { count: projetsActifs } = await supabase
      .from("projets")
      .select("*", { count: "exact", head: true })
      .eq("statut", "actif")

    stats.push({
      title: "Projets actifs",
      value: projetsActifs || 0,
      iconName: "BarChart3",
    })
  }

  if (userRole === "FIN") {
    // Dépenses ce mois
    const { count: depensesMois } = await supabase
      .from("depenses")
      .select("*", { count: "exact", head: true })
      .gte("date_depense", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    stats.push({
      title: "Dépenses ce mois",
      value: depensesMois || 0,
      iconName: "DollarSign",
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2D7A32] to-[#1B5E20] rounded-lg p-4 md:p-6 text-white shadow-lg animate-gradient">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-white/90 text-sm md:text-base">
          Bienvenue sur la plateforme AFDR
        </p>
      </div>

      <AnimatedStats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1B5E20]">Mes tâches en attente</CardTitle>
          <CardDescription>
            Actions nécessitant votre attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#757575]">
            Aucune tâche en attente pour le moment.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


