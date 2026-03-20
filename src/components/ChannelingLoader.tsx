'use client'

import { useMemo, useState, useEffect, useRef } from 'react'

import type { ModelResponse } from '@/lib/types'
import { ORACLE_INFO, AI_MODELS } from '@/lib/ai'
import { STALE_INDICATOR_MS } from '@/lib/constants'

interface ChannelingLoaderProps {
  responses: ModelResponse[]
  isComplete: boolean
}

export function ChannelingLoader({
  responses,
  isComplete,
}: ChannelingLoaderProps): React.ReactElement {
  // Track which models have responded
  const respondedModels = useMemo(() => {
    return new Set(responses.filter((r) => r.status === 'success').map((r) => r.model))
  }, [responses])

  // Stale timer: show warning after 30s without completion
  const [isStale, setIsStale] = useState(false)
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isComplete) {
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current)
      return
    }
    staleTimerRef.current = setTimeout(() => setIsStale(true), STALE_INDICATOR_MS)
    return () => {
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current)
    }
  }, [isComplete])

  // Contextual loading message
  const loadingMessage = useMemo(() => {
    if (isComplete) return 'Composing the reading'
    if (respondedModels.size === 0) return 'Listening'
    return `${respondedModels.size} of ${AI_MODELS.length} channels open`
  }, [isComplete, respondedModels.size])

  const angleStep = 360 / AI_MODELS.length

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-12">
      {/* Central orb */}
      <div className="relative flex items-center justify-center mb-16">
        <div className="relative w-24 h-24">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-gold/20 animate-breathe blur-xl" />

          {/* Core orb */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 animate-pulse-glow" />

          {/* Inner shine */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cream/20 to-transparent" />
        </div>

        {/* Orbiting model indicators */}
        {AI_MODELS.map((model, index) => {
          const angle = (index * angleStep - 90) * (Math.PI / 180)
          const radius = 80
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const hasResponded = respondedModels.has(model)
          const { color } = ORACLE_INFO[model]

          return (
            <div
              key={model}
              className="absolute transition-all duration-500"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <div
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  hasResponded ? 'scale-125' : 'opacity-40'
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow: hasResponded ? `0 0 20px ${color}` : 'none',
                }}
              />
            </div>
          )
        })}

        {/* Constellation lines between responded models */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: 200, height: 200, left: -52, top: -52 }}
        >
          {AI_MODELS.map((model, i) => {
            if (!respondedModels.has(model)) return null

            const angle1 = (i * angleStep - 90) * (Math.PI / 180)
            const x1 = 100 + Math.cos(angle1) * 80
            const y1 = 100 + Math.sin(angle1) * 80

            // Draw lines to other responded models
            return AI_MODELS.slice(i + 1).map((otherModel, j) => {
              if (!respondedModels.has(otherModel)) return null

              const angle2 = ((i + j + 1) * angleStep - 90) * (Math.PI / 180)
              const x2 = 100 + Math.cos(angle2) * 80
              const y2 = 100 + Math.sin(angle2) * 80

              return (
                <line
                  key={`${model}-${otherModel}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(200, 168, 78, 0.3)"
                  strokeWidth="1"
                  className="animate-twinkle"
                />
              )
            })
          })}
        </svg>
      </div>

      {/* Model status list */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {AI_MODELS.map((model) => {
          const hasResponded = respondedModels.has(model)
          return (
            <div
              key={model}
              className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${
                hasResponded ? 'text-cream bg-cream/10' : 'text-cream-muted bg-cream/5'
              }`}
            >
              {ORACLE_INFO[model].name}
              {hasResponded && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-gold" />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="max-w-xs mx-auto mb-6">
        <div
          role="progressbar"
          aria-valuenow={respondedModels.size}
          aria-valuemax={AI_MODELS.length}
          aria-label="Oracle response progress"
          className="h-0.5 bg-cream/10 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-700 ease-out"
            style={{ width: `${(respondedModels.size / AI_MODELS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Loading message */}
      <div className="text-center">
        <p className="text-cream-soft text-sm">{loadingMessage}</p>
      </div>

      {/* Stale indicator */}
      {isStale && !isComplete && (
        <div className="mt-4 text-center animate-fadeIn">
          <p className="text-sm text-cream-muted">Some channels are taking longer than expected.</p>
        </div>
      )}
    </div>
  )
}
