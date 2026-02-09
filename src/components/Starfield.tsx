'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
  layer: number
}

interface StarfieldProps {
  className?: string
}

const STAR_COUNTS = {
  mobile: 100,
  tablet: 150,
  desktop: 200,
}

const LAYERS = [
  { speed: 0.1, sizeRange: [0.5, 1] },
  { speed: 0.2, sizeRange: [1, 1.5] },
  { speed: 0.3, sizeRange: [1.5, 2.5] },
]

export function Starfield({ className = '' }: StarfieldProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const getStarCount = useCallback((): number => {
    if (typeof window === 'undefined') return STAR_COUNTS.mobile
    const width = window.innerWidth
    if (width < 640) return STAR_COUNTS.mobile
    if (width < 1024) return STAR_COUNTS.tablet
    return STAR_COUNTS.desktop
  }, [])

  const createStars = useCallback(
    (width: number, height: number): Star[] => {
      const count = getStarCount()
      const stars: Star[] = []

      for (let i = 0; i < count; i++) {
        const layerIndex = Math.floor(Math.random() * LAYERS.length)
        const layer = LAYERS[layerIndex]
        const [minSize, maxSize] = layer.sizeRange

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: minSize + Math.random() * (maxSize - minSize),
          opacity: 0.3 + Math.random() * 0.7,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinklePhase: Math.random() * Math.PI * 2,
          layer: layerIndex,
        })
      }

      return stars
    },
    [getStarCount]
  )

  const draw = useCallback((ctx: CanvasRenderingContext2D, time: number): void => {
    const { width, height } = ctx.canvas

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw stars
    starsRef.current.forEach((star) => {
      // Calculate twinkle
      const twinkle = Math.sin(time * 0.001 * star.twinkleSpeed + star.twinklePhase)
      const opacity = star.opacity * (0.5 + twinkle * 0.5)

      // Draw star
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(232, 228, 220, ${opacity})`
      ctx.fill()

      // Add glow for larger stars
      if (star.radius > 1.5) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.radius * 2
        )
        gradient.addColorStop(0, `rgba(200, 168, 78, ${opacity * 0.3})`)
        gradient.addColorStop(1, 'rgba(200, 168, 78, 0)')
        ctx.fillStyle = gradient
        ctx.fill()
      }
    })
  }, [])

  const animate = useCallback(
    (time: number): void => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')

      if (!ctx) return

      // Throttle to ~30fps for performance
      if (time - lastTimeRef.current < 33) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastTimeRef.current = time

      draw(ctx, time)
      animationRef.current = requestAnimationFrame(animate)
    },
    [draw]
  )

  const handleResize = useCallback((): void => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    const width = window.innerWidth
    const height = window.innerHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    starsRef.current = createStars(width, height)
  }, [createStars])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [handleResize, animate])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
