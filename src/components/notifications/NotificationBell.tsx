"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export function NotificationBell() {
  const [count, setCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()

    // Écouter les changements en temps réel
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("id_utilisateur", user.id)
        .eq("lu", false)

      if (error) throw error
      setCount(count || 0)
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  return (
    <Link href="/notifications">
      <Button variant="ghost" size="icon" className="relative">
        <motion.div
          animate={count > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Bell className="h-5 w-5 text-[#2D7A32]" />
        </motion.div>
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C62828] text-xs text-white shadow-md"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {count > 9 ? "9+" : count}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </Link>
  )
}


