"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Input, InputProps } from "./input"
import { cn } from "@/lib/utils/cn"

export const AnimatedInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)

    return (
      <motion.div
        animate={{
          scale: focused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <Input
          ref={ref}
          className={cn(className)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {focused && (
          <motion.div
            layoutId="inputFocus"
            className="absolute inset-0 rounded-md border-2 border-[#2D7A32] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
          />
        )}
      </motion.div>
    )
  }
)
AnimatedInput.displayName = "AnimatedInput"

