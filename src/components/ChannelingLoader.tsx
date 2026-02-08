'use client'

import { useState, useEffect, useMemo } from 'react'
import type { AIModel, ModelResponse } from '@/lib/types'

interface ChannelingLoaderProps {
  responses: ModelResponse[]
  isComplete: boolean
}

const AI_MODELS: { model: AIModel; label: string; color: string }[] = [
  { model: 'gpt-4.1', label: 'Iris', color: '#10a37f' },
  { model: 'claude-sonnet-4.5', label: 'Luna', color: '#d97706' },
  { model: 'gemini-3.0-pro', label: 'Echo', color: '#4285f4' },
  { model: 'deepseek-reasoner', label: 'Shade', color: '#6366f1' },
  { model: 'grok-4', label: 'Nova', color: '#ef4444' },
]

const LOADING_MESSAGES = [
  'Opening channels...',
  'Receiving transmissions...',
  'Threads converging...',
  'Patterns emerging...',
  'Weaving responses...',
]

export function ChannelingLoader({ responses, isComplete }: ChannelingLoaderProps): React.ReactElement {
  const [messageIndex, setMessageIndex] = useState(0)

  // Rotate loading messages
  useEffect(() => {
    if (isComplete) return

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isComplete])

  // Track which models have responded
  const respondedModels = useMemo(() => {
    return new Set(responses.filter(r => r.status === 'success').map(r => r.model))
  }, [responses])

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
          const angle = (index * 72 - 90) * (Math.PI / 180)
          const radius = 80
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const hasResponded = respondedModels.has(model.model)

          return (
            <div
              key={model.model}
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
                  backgroundColor: model.color,
                  boxShadow: hasResponded ? `0 0 20px ${model.color}` : 'none',
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
            if (!respondedModels.has(model.model)) return null

            const angle1 = (i * 72 - 90) * (Math.PI / 180)
            const x1 = 100 + Math.cos(angle1) * 80
            const y1 = 100 + Math.sin(angle1) * 80

            // Draw lines to other responded models
            return AI_MODELS.slice(i + 1).map((otherModel, j) => {
              if (!respondedModels.has(otherModel.model)) return null

              const angle2 = ((i + j + 1) * 72 - 90) * (Math.PI / 180)
              const x2 = 100 + Math.cos(angle2) * 80
              const y2 = 100 + Math.sin(angle2) * 80

              return (
                <line
                  key={`${model.model}-${otherModel.model}`}
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
          const hasResponded = respondedModels.has(model.model)
          return (
            <div
              key={model.model}
              className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${
                hasResponded
                  ? 'text-cream bg-cream/10'
                  : 'text-gray-muted bg-cream/5'
              }`}
            >
              {model.label}
              {hasResponded && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-gold" />
              )}
            </div>
          )
        })}
      </div>

      {/* Loading message */}
      <div className="text-center">
        <p className="text-gray-muted animate-breathe">
          {isComplete ? 'Synthesis complete' : LOADING_MESSAGES[messageIndex]}
        </p>
      </div>

      {/* Response count */}
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-muted">
          {respondedModels.size} of {AI_MODELS.length} channels open
        </span>
      </div>
    </div>
  )
}
