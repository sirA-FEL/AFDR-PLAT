"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { scaleIn, transitionFast } from "@/lib/utils/motion-variants"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
  pulse?: boolean
}

function Badge({ className, variant = "default", pulse, ...props }: BadgeProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={scaleIn}
      transition={transitionFast}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        pulse && "animate-pulse-custom",
        {
          "border-transparent bg-[#2D7A32] text-white": variant === "default",
          "border-transparent bg-[#F5F5F5] text-[#212121]": variant === "secondary",
          "border-transparent bg-[#C62828] text-white": variant === "destructive",
          "border-[#2D7A32] text-[#2D7A32] bg-transparent": variant === "outline",
          "border-transparent bg-[#2D7A32] text-white": variant === "success",
          "border-transparent bg-[#F9A825] text-white": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }


