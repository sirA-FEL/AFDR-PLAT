"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Loader2 } from "lucide-react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, children, disabled, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([])
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const rippleIdRef = React.useRef(0)

    React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement)

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return
      
      const button = buttonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const newRipple = {
        x,
        y,
        id: rippleIdRef.current++,
      }

      setRipples((prev) => [...prev, newRipple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 600)
    }

    return (
      <button
        ref={buttonRef}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden will-animate",
          "active:scale-[0.98]",
          {
            "bg-[#2D7A32] text-white hover:bg-[#1B5E20] shadow-md hover:shadow-lg hover:scale-[1.02]": variant === "default",
            "bg-[#C62828] text-white hover:bg-[#B71C1C] hover:scale-[1.02]": variant === "destructive",
            "border-2 border-[#2D7A32] bg-transparent text-[#2D7A32] hover:bg-[#2D7A32] hover:text-white hover:scale-[1.02]": variant === "outline",
            "bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0] hover:scale-[1.02]": variant === "secondary",
            "hover:bg-[#F5F5F5] text-[#212121] hover:scale-[1.02]": variant === "ghost",
            "text-[#2D7A32] underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        disabled={disabled || loading}
        onClick={createRipple}
        {...props}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-pulse"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              transform: "translate(-50%, -50%)",
              animation: "ripple 0.6s ease-out",
            }}
          />
        ))}
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }

