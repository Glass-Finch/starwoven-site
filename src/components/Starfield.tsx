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

/** A constellation is a chain of star indices connected by lines */
type Constellation = number[]

interface StarfieldProps {
  className?: string
}

const STAR_COUNTS = {
  mobile: 100,
  tablet: 150,
  desktop: 200,
}

const CONSTELLATION_COUNTS = {
  mobile: 3,
  tablet: 5,
  desktop: 8,
}

/** Max distance (px) between stars to form a constellation edge */
const MAX_CONSTELLATION_DIST = 180

const LAYERS = [
  { speed: 0.1, sizeRange: [0.5, 1] },
  { speed: 0.2, sizeRange: [1, 1.5] },
  { speed: 0.3, sizeRange: [1.5, 2.5] },
]

/** Build small constellations by chaining nearby bright stars */
function buildConstellations(stars: Star[], count: number): Constellation[] {
  // Use only the brightest stars (layer 2) as constellation anchors
  const brightIndices = stars
    .map((s, i) => ({ star: s, index: i }))
    .filter(({ star }) => star.layer === 2)
    .map(({ index }) => index)

  if (brightIndices.length < 2) return []

  const used = new Set<number>()
  const constellations: Constellation[] = []

  // Shuffle so constellations vary on each resize
  const shuffled = [...brightIndices].sort(() => Math.random() - 0.5)

  for (const seedIdx of shuffled) {
    if (constellations.length >= count) break
    if (used.has(seedIdx)) continue

    // Grow a chain from this seed star
    const chain: number[] = [seedIdx]
    used.add(seedIdx)

    const chainLength = 2 + Math.floor(Math.random() * 3) // 2-4 stars per constellation
    for (let step = 0; step < chainLength - 1; step++) {
      const last = stars[chain[chain.length - 1]]

      // Find nearest unused bright star within range
      let bestIdx = -1
      let bestDist = MAX_CONSTELLATION_DIST

      for (const candidateIdx of brightIndices) {
        if (used.has(candidateIdx)) continue
        const c = stars[candidateIdx]
        const dx = c.x - last.x
        const dy = c.y - last.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = candidateIdx
        }
      }

      if (bestIdx === -1) break
      chain.push(bestIdx)
      used.add(bestIdx)
    }

    if (chain.length >= 2) {
      constellations.push(chain)
    }
  }

  return constellations
}

export function Starfield({ className = '' }: StarfieldProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const constellationsRef = useRef<Constellation[]>([])
  const animationRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const getStarCount = useCallback((): number => {
    if (typeof window === 'undefined') return STAR_COUNTS.mobile
    const width = window.innerWidth
    if (width < 640) return STAR_COUNTS.mobile
    if (width < 1024) return STAR_COUNTS.tablet
    return STAR_COUNTS.desktop
  }, [])

  const getConstellationCount = useCallback((): number => {
    if (typeof window === 'undefined') return CONSTELLATION_COUNTS.mobile
    const width = window.innerWidth
    if (width < 640) return CONSTELLATION_COUNTS.mobile
    if (width < 1024) return CONSTELLATION_COUNTS.tablet
    return CONSTELLATION_COUNTS.desktop
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

    // Draw constellation lines (behind stars)
    const stars = starsRef.current
    constellationsRef.current.forEach((chain) => {
      for (let i = 0; i < chain.length - 1; i++) {
        const a = stars[chain[i]]
        const b = stars[chain[i + 1]]
        // Gentle pulse tied to both stars' twinkle phases
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.0005 + (a.twinklePhase + b.twinklePhase) * 0.5)
        const lineOpacity = 0.06 + pulse * 0.04 // range 0.06-0.10, very subtle

        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(184, 180, 200, ${lineOpacity})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    })

    // Draw stars
    stars.forEach((star) => {
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
        gradient.addColorStop(0, `rgba(184, 180, 200, ${opacity * 0.3})`)
        gradient.addColorStop(1, 'rgba(184, 180, 200, 0)')
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
    constellationsRef.current = buildConstellations(starsRef.current, getConstellationCount())
  }, [createStars, getConstellationCount])

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
