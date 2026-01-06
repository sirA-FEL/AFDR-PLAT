"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-[#2D7A32]/20 bg-white px-3 py-2 text-sm text-[#212121] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7A32] focus-visible:ring-offset-2 focus-visible:border-[#2D7A32] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }


