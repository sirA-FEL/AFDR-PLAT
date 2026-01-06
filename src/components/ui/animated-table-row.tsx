"use client"

import { motion } from "framer-motion"
import { TableRow, TableCell } from "./table"
import { item, transitionNormal } from "@/lib/utils/motion-variants"
import { cn } from "@/lib/utils/cn"

interface AnimatedTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number
  children: React.ReactNode
}

export function AnimatedTableRow({ index, className, children, ...props }: AnimatedTableRowProps) {
  return (
    <motion.tr
      variants={item}
      initial="hidden"
      animate="show"
      custom={index}
      transition={transitionNormal}
      className={cn(
        "border-b border-[#2D7A32]/10 transition-colors hover:bg-[#F5F5F5] data-[state=selected]:bg-[#4CAF50]/10",
        className
      )}
      whileHover={{ x: 4 }}
      {...props}
    >
      {children}
    </motion.tr>
  )
}

