"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { slideLeft, containerFast, itemSlide, transitionNormal } from "@/lib/utils/motion-variants"
import {
  FileText,
  BarChart3,
  DollarSign,
  Truck,
  FileCheck,
  Users,
  ClipboardList,
  Home,
} from "lucide-react"

const menuItems = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: Home,
  },
  {
    title: "Ordres de Mission",
    href: "/ordres-mission",
    icon: FileText,
  },
  {
    title: "MEAL",
    href: "/meal",
    icon: BarChart3,
  },
  {
    title: "Finance",
    href: "/finance",
    icon: DollarSign,
  },
  {
    title: "Logistique",
    href: "/logistique",
    icon: Truck,
  },
  {
    title: "TdRs",
    href: "/tdr",
    icon: FileCheck,
  },
  {
    title: "GRH",
    href: "/grh",
    icon: Users,
  },
  {
    title: "Rapportage",
    href: "/rapportage",
    icon: ClipboardList,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideLeft}
      transition={transitionNormal}
      className="hidden md:flex h-screen w-64 flex-col border-r border-[#2D7A32]/20 bg-white shadow-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex h-16 items-center border-b border-[#2D7A32]/20 px-6 bg-gradient-to-r from-[#2D7A32] to-[#1B5E20]"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center gap-2"
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"
          >
            <span className="text-lg font-bold text-white">A</span>
          </motion.div>
          <h1 className="text-xl font-bold text-white">Plateforme AFDR</h1>
        </motion.div>
      </motion.div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <motion.div
          variants={containerFast}
          initial="hidden"
          animate="show"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <motion.div
                key={item.href}
                variants={itemSlide}
                custom={index}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#4CAF50]/20 text-[#1B5E20] shadow-sm"
                      : "text-[#757575] hover:bg-[#F5F5F5] hover:text-[#2D7A32]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-[#2D7A32] rounded-r"
                      initial={false}
                      transition={transitionNormal}
                    />
                  )}
                  <Icon className={cn(
                    "h-5 w-5 transition-colors relative z-10",
                    isActive ? "text-[#2D7A32]" : "text-[#757575]"
                  )} />
                  <span className="relative z-10">{item.title}</span>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </nav>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-[#2D7A32]/20 p-4"
      >
        <div className="text-xs text-[#757575] text-center">
          <p className="font-semibold text-[#2D7A32]">AFDR</p>
          <p>Association Formation</p>
          <p>Développement Ruralité</p>
        </div>
      </motion.div>
    </motion.div>
  )
}


