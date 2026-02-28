"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  Package,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ClipboardList,
  FileCheck,
  FolderOpen,
  ClipboardCheck,
  Car,
} from "lucide-react"
import { LogoAfdr } from "@/components/ui/logo-afdr"
import { isPartenaire, hasRole } from "@/lib/auth/niveau-acces"

const navigation = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Ordres de Mission", href: "/ordres-mission", icon: FileText },
  { name: "Validation des ordres", href: "/ordres-mission/validation", icon: ClipboardCheck, roles: ["DIR", "MEAL"] as const },
  { name: "Projets MEAL", href: "/meal/projets", icon: TrendingUp },
  { name: "GRH", href: "/grh/employes", icon: Users },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Logistique", href: "/logistique", icon: Package },
  { name: "Parc automobile", href: "/logistique/vehicules", icon: Car, roles: ["LOG", "DIR"] as const },
  { name: "TDR", href: "/tdr", icon: ClipboardList },
  { name: "Rapportage", href: "/rapportage", icon: FileCheck },
  { name: "Notifications", href: "/notifications", icon: Bell },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (!loading && user?.roles && isPartenaire(user.roles)) {
      const inPartenaire = pathname === "/partenaire" || pathname?.startsWith("/partenaire/")
      const inProfil = pathname === "/profil"
      if (!inPartenaire && !inProfil) {
        router.replace("/partenaire")
      }
    }
  }, [loading, user?.roles, pathname, router])

  const loadUser = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        setLoading(false)
        return
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const [profilRes, rolesRes] = await Promise.all([
          supabase.from("profils").select("nom, prenom, email").eq("id", authUser.id).single(),
          supabase.from("roles_utilisateurs").select("role").eq("id_utilisateur", authUser.id),
        ])
        const roles = (rolesRes.data ?? []).map((r: { role: string }) => r.role)
        setUser({
          ...authUser,
          profil: profilRes.data || { nom: "", prenom: "", email: authUser.email },
          roles,
        })
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'utilisateur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      if (supabase) {
        await supabase.auth.signOut()
        router.push("/login")
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-200 shrink-0">
                <LogoAfdr size={36} variant="icon" className="object-contain" />
              </div>
              <span className="font-bold text-lg text-gray-900">AFDR Platform</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {user?.roles && isPartenaire(user.roles) ? (
              <>
                <Link
                  href="/partenaire"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    pathname === "/partenaire" || pathname?.startsWith("/partenaire/")
                      ? "bg-[#2D7A32] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FolderOpen className="h-5 w-5" />
                  <span className="font-medium">Projets partagés</span>
                </Link>
              </>
            ) : (
              navigation
                .filter((item) => !("roles" in item) || (item.roles && hasRole(user?.roles ?? [], [...item.roles])))
                .map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive ? "bg-[#2D7A32] text-white" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })
            )}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4">
            {loading ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 bg-[#2D7A32] rounded-full flex items-center justify-center text-white font-semibold">
                  {user.profil?.prenom?.[0] || user.profil?.nom?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.profil?.prenom && user.profil?.nom
                      ? `${user.profil.prenom} ${user.profil.nom}`
                      : user.profil?.email || "Utilisateur"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.profil?.email || ""}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 text-gray-500">
                <User className="h-5 w-5" />
                <span className="text-sm">Non connecté</span>
              </div>
            )}
            <Link href="/profil">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-gray-700 hover:bg-gray-100"
              >
                <User className="h-4 w-4" />
                <span>Mon profil</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

