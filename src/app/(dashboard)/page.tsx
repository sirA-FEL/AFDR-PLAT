"use client"

import { useState } from "react"
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

export default function DashboardPage() {
  // Données d'exemple (à remplacer par des données réelles depuis Supabase)
  const [stats] = useState({
    ordresEnAttente: 0,
    mesTaches: 0,
    mesProjets: 0,
    notificationsNonLues: 0,
  })

  const [tachesEnAttente] = useState([
    // Les données viendront de Supabase
  ])

  const [notificationsRecentes] = useState([
    // Les données viendront de Supabase
  ])

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

        {/* Mes tâches en attente */}
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

        {/* Notifications */}
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
            {notificationsRecentes.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Aucune notification récente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notificationsRecentes.map((notif, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      !notif.lue ? "bg-blue-50 border-l-4 border-blue-500" : "bg-gray-50"
                    }`}
                  >
                    <div className="h-10 w-10 bg-[#2D7A32] rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notif.titre}</p>
                      <p className="text-sm text-gray-600">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
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

