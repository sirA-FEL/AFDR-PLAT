"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { Bell, Check, Trash2, Filter } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  titre: string
  message: string
  type_notification: "info" | "success" | "warning" | "error" | "validation"
  lien?: string
  lue: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { notificationsService } = await import("@/lib/supabase/services")
      const data = await notificationsService.getAll({
        lue: filter === "all" ? undefined : filter === "read",
      })
      setNotifications(data)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { notificationsService } = await import("@/lib/supabase/services")
      await notificationsService.markAsRead(id)
      loadNotifications()
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { notificationsService } = await import("@/lib/supabase/services")
      await notificationsService.delete(id)
      loadNotifications()
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const getTypeColor = (type: Notification["type_notification"]) => {
    const colors = {
      info: "bg-blue-100 text-blue-800 border-blue-300",
      success: "bg-green-100 text-green-800 border-green-300",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
      error: "bg-red-100 text-red-800 border-red-300",
      validation: "bg-purple-100 text-purple-800 border-purple-300",
    }
    return colors[type] || colors.info
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
        <div>
          <h1 className="text-3xl font-bold text-[#2D7A32]">Notifications</h1>
          <p className="text-gray-600 mt-1">Centre de notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
          >
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-gray-500">Chargement...</p>
            </div>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune notification</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card key={notif.id} className={!notif.lue ? "border-l-4 border-l-blue-500" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(notif.type_notification)}`}>
                        {notif.type_notification}
                      </span>
                      {!notif.lue && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{notif.titre}</h3>
                    <p className="text-gray-600 mb-2">{notif.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleString("fr-FR")}
                    </p>
                    {notif.lien && (
                      <Link href={notif.lien} className="text-sm text-[#2D7A32] hover:underline mt-2 inline-block">
                        Voir plus →
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notif.lue && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notif.id)}
                        title="Marquer comme lue"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notif.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
