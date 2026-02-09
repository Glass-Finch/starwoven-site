'use client'

import { useState, useEffect } from 'react'
import { ThreadsAccordion } from './ThreadsAccordion'
import { CoordinateReveal } from './CoordinateReveal'
import type { ModelResponse, CoordinateSet } from '@/lib/types'

interface WovenMessageProps {
  synthesis: string
  threads: ModelResponse[]
  coordinates: CoordinateSet
  onStartNew: () => void
}

export function WovenMessage({
  synthesis,
  threads,
  coordinates,
  onStartNew,
}: WovenMessageProps): React.ReactElement {
  const [displayedText, setDisplayedText] = useState('')
  const [isRevealing, setIsRevealing] = useState(true)

  // Animate text reveal word by word
  useEffect(() => {
    if (!synthesis) return

    const words = synthesis.split(' ')
    let currentIndex = 0

    setDisplayedText('')
    setIsRevealing(true)

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText((prev) =>
          prev ? `${prev} ${words[currentIndex]}` : words[currentIndex]
        )
        currentIndex++
      } else {
        clearInterval(interval)
        setIsRevealing(false)
      }
    }, 60)

    return () => clearInterval(interval)
  }, [synthesis])

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Woven message */}
      <div className="card relative overflow-hidden mb-8">
        {/* Subtle glow behind text */}
        <div className="absolute inset-0 bg-gradient-radial from-gold/5 to-transparent pointer-events-none" />

        <div className="relative">
          <p className="font-serif text-lg sm:text-xl leading-relaxed text-cream">
            {displayedText}
            {isRevealing && (
              <span className="inline-block w-0.5 h-5 bg-gold ml-1 animate-pulse" />
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      {!isRevealing && (
        <div className="space-y-4 animate-fadeIn">
          {/* Expandable sections */}
          <div className="space-y-3">
            <ThreadsAccordion threads={threads} />
            <CoordinateReveal coordinates={coordinates} />
          </div>

          {/* Start new reading */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={onStartNew}
              className="btn-secondary"
            >
              Begin anew
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
