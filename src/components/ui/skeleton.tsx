import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text" | "card"
  lines?: number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", lines, ...props }, ref) => {
    if (variant === "text" && lines) {
      return (
        <div className="space-y-2" ref={ref} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4 w-full rounded bg-gradient-to-r from-[#F5F5F5] via-[#E0E0E0] to-[#F5F5F5] bg-[length:200%_100%] animate-shimmer",
                i === lines - 1 && "w-3/4",
                className
              )}
            />
          ))}
        </div>
      )
    }

    const baseClasses = "bg-gradient-to-r from-[#F5F5F5] via-[#E0E0E0] to-[#F5F5F5] bg-[length:200%_100%] animate-shimmer"

    if (variant === "circular") {
      return (
        <div
          ref={ref}
          className={cn("rounded-full", baseClasses, className)}
          {...props}
        />
      )
    }

    if (variant === "card") {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-lg border border-[#2D7A32]/10 p-6 space-y-4",
            className
          )}
          {...props}
        >
          <div className={cn("h-6 w-3/4 rounded", baseClasses)} />
          <div className={cn("h-4 w-full rounded", baseClasses)} />
          <div className={cn("h-4 w-5/6 rounded", baseClasses)} />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("rounded", baseClasses, className)}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }

