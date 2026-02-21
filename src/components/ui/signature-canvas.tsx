"use client"

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react"

export interface SignatureCanvasRef {
  getBlob: () => Promise<Blob | null>
  clear: () => void
  isEmpty: () => boolean
}

interface SignatureCanvasProps {
  width?: number
  height?: number
  className?: string
}

export const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  ({ width = 400, height = 180, className = "" }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const hasDrawnRef = useRef(false)

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext("2d")
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
  }, [])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      const ctx = getCtx()
      if (!ctx) return
      const { x, y } = getPos(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
      hasDrawnRef.current = true
    },
    [getCtx, getPos]
  )

  const move = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawing) return
      const ctx = getCtx()
      if (!ctx) return
      const { x, y } = getPos(e)
      ctx.lineTo(x, y)
      ctx.stroke()
    },
    [isDrawing, getCtx, getPos]
  )

  const end = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasDrawnRef.current = false
  }, [getCtx])

  const getBlob = useCallback((): Promise<Blob | null> => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawnRef.current) return Promise.resolve(null)
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/png",
        1
      )
    })
  }, [])

  const isEmpty = useCallback(() => !hasDrawnRef.current, [])

  useImperativeHandle(ref, () => ({ getBlob, clear, isEmpty }), [getBlob, clear, isEmpty])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`border border-gray-300 rounded-md bg-white touch-none cursor-crosshair ${className}`}
      style={{ width: "100%", maxWidth: width, height }}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
    />
  )
})

SignatureCanvas.displayName = "SignatureCanvas"
