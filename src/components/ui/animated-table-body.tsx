"use client"

import { motion } from "framer-motion"
import { containerFast } from "@/lib/utils/motion-variants"
import { cn } from "@/lib/utils/cn"

interface AnimatedTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

export function AnimatedTableBody({ className, children, ...props }: AnimatedTableBodyProps) {
  return (
    <motion.tbody
      variants={containerFast}
      initial="hidden"
      animate="show"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    >
      {children}
    </motion.tbody>
  )
}

