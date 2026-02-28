"use client"

import { useState } from "react"
import Image from "next/image"

interface LogoAfdrProps {
  /** Taille en pixels (carré ou hauteur selon variant). */
  size?: number
  /** "icon" = carré (sidebar), "card" = plus grand pour cartes login/accueil. */
  variant?: "icon" | "card"
  className?: string
}

export function LogoAfdr({ size = 40, variant = "icon", className = "" }: LogoAfdrProps) {
  const [error, setError] = useState(false)
  const w = variant === "card" ? 80 : size
  const h = variant === "card" ? 80 : size

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-[#2D7A32] to-[#1B5E20] text-white font-bold ${className}`}
        style={{ width: w, height: h, minWidth: w, minHeight: h }}
      >
        {variant === "card" ? "A" : "AFDR"}
      </div>
    )
  }

  return (
    <Image
      src="/logo-afdr.png"
      alt="Logo AFDR"
      width={w}
      height={h}
      className={className}
      priority
      onError={() => setError(true)}
    />
  )
}
