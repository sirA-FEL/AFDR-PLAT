import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Loader2 } from "lucide-react"

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "spinner" | "dots" | "bars"
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, variant = "spinner", size = "md", fullScreen = false, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12",
    }

    const Spinner = () => (
      <Loader2
        className={cn(
          "animate-spin text-[#2D7A32]",
          sizeClasses[size],
          className
        )}
      />
    )

    const Dots = () => (
      <div className={cn("flex items-center gap-2", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-[#2D7A32] animate-pulse-custom",
              size === "sm" && "h-2 w-2",
              size === "md" && "h-3 w-3",
              size === "lg" && "h-4 w-4"
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    )

    const Bars = () => (
      <div className={cn("flex items-end gap-1", className)}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-[#2D7A32] rounded-t animate-pulse-custom",
              size === "sm" && "w-1 h-3",
              size === "md" && "w-1.5 h-6",
              size === "lg" && "w-2 h-8"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    )

    const content = (
      <>
        {variant === "spinner" && <Spinner />}
        {variant === "dots" && <Dots />}
        {variant === "bars" && <Bars />}
      </>
    )

    if (fullScreen) {
      return (
        <div
          ref={ref}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
          {...props}
        >
          {content}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className="flex items-center justify-center"
        {...props}
      >
        {content}
      </div>
    )
  }
)
Loading.displayName = "Loading"

export { Loading }

