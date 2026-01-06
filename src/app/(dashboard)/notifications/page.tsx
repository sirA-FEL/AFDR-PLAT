"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check } from "lucide-react"
import { container, item, notificationTransition, transitionNormal } from "@/lib/utils/motion-variants"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("id_utilisateur", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ lu: true })
        .eq("id", id)

      if (error) throw error
      loadNotifications()
    } catch (error: any) {
      console.error("Erreur:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from("notifications")
        .update({ lu: true })
        .eq("id_utilisateur", user.id)
        .eq("lu", false)

      if (error) throw error
      loadNotifications()
    } catch (error: any) {
      console.error("Erreur:", error)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  const unreadCount = notifications.filter((n) => !n.lu).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1B5E20]">Notifications</h1>
          <p className="text-[#757575]">
            {unreadCount > 0
              ? `${unreadCount} notification(s) non lue(s)`
              : "Aucune notification non lue"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center text-[#757575] py-8">
              Aucune notification
            </p>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    variants={item}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    className={`flex items-start justify-between rounded-lg border p-4 transition-all ${
                      !notification.lu
                        ? "border-[#1976D2]/30 bg-[#1976D2]/5 shadow-sm"
                        : "border-[#2D7A32]/20 bg-white"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            notification.type === "alerte"
                              ? "destructive"
                              : notification.type === "approbation"
                              ? "success"
                              : "default"
                          }
                        >
                          {notification.type}
                        </Badge>
                        {!notification.lu && (
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-2 w-2 rounded-full bg-blue-600"
                          />
                        )}
                      </div>
                      <h3 className="mt-2 font-medium">{notification.titre}</h3>
                      <p className="text-sm text-[#212121]">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-[#757575]">
                        {new Date(notification.created_at).toLocaleString("fr-FR")}
                      </p>
                      {notification.lien_action && (
                        <Link href={notification.lien_action}>
                          <Button variant="link" size="sm" className="mt-2">
                            Voir
                          </Button>
                        </Link>
                      )}
                    </div>
                    {!notification.lu && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


