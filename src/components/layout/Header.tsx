"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Search, User, LogOut, Menu } from "lucide-react"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "./Sidebar"
import { slideDown, transitionNormal } from "@/lib/utils/motion-variants"

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <motion.header
        initial="initial"
        animate="animate"
        variants={slideDown}
        transition={transitionNormal}
        className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-[#2D7A32]/20 bg-white px-4 md:px-6 shadow-sm"
      >
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-[#F5F5F5]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5 text-[#2D7A32]" />
        </Button>
        <div className="flex flex-1 items-center gap-4">
          <motion.div
            className="relative flex-1 max-w-md"
            animate={{
              scale: searchFocused ? 1.02 : 1,
            }}
            transition={transitionNormal}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#757575]" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-10 border-[#2D7A32]/20 focus:border-[#2D7A32] focus:ring-[#2D7A32]"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 md:gap-4"
        >
          <NotificationBell />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-[#F5F5F5]">
              <User className="h-5 w-5 text-[#2D7A32]" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-[#F5F5F5]">
              <LogOut className="h-5 w-5 text-[#757575]" />
            </Button>
          </div>
        </motion.div>
      </motion.header>
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={transitionNormal}
                className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl"
              >
                <Sidebar />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

