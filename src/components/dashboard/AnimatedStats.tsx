"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { container, item, transitionNormal } from "@/lib/utils/motion-variants"
import { useEffect, useState } from "react"
import { FileText, BarChart3, DollarSign, LucideIcon } from "lucide-react"

interface Stat {
  title: string
  value: number
  iconName: string
}

interface AnimatedStatsProps {
  stats: Stat[]
}

// Map des noms d'icônes vers les composants
const iconMap: Record<string, LucideIcon> = {
  FileText,
  BarChart3,
  DollarSign,
}

function CountUp({ value, color }: { value: number; color: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <div className={`text-3xl font-bold ${color}`}>{count}</div>
}

export function AnimatedStats({ stats }: AnimatedStatsProps) {
  const colors = [
    { bg: "bg-[#2D7A32]", icon: "text-[#2D7A32]", border: "border-[#2D7A32]" },
    { bg: "bg-[#1976D2]", icon: "text-[#1976D2]", border: "border-[#1976D2]" },
    { bg: "bg-[#F9A825]", icon: "text-[#F9A825]", border: "border-[#F9A825]" },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.iconName] || FileText
        const color = colors[index % colors.length]
        return (
          <motion.div key={index} variants={item}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#212121]">
                  {stat.title}
                </CardTitle>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, ...transitionNormal }}
                  className={`p-2 rounded-lg ${color.bg}/10`}
                >
                  <Icon className={`h-5 w-5 ${color.icon}`} />
                </motion.div>
              </CardHeader>
              <CardContent>
                <CountUp value={stat.value} color={color.icon} />
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

