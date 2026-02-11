'use client'

import { useState, useEffect } from 'react'

import type { ModelResponse, CoordinateSet } from '@/lib/types'
import { DISCLAIMER_BRIEF } from '@/lib/constants'

import { ThreadsAccordion } from './ThreadsAccordion'
import { CoordinateReveal } from './CoordinateReveal'

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

  useEffect(() => {
    if (!synthesis) return

    const words = synthesis.split(' ')
    let currentIndex = 0

    setDisplayedText('')
    setIsRevealing(true)

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText((prev) => (prev ? `${prev} ${words[currentIndex]}` : words[currentIndex]))
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
      {/* Synthesis */}
      <div className="card relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-radial from-gold/5 to-transparent pointer-events-none" />

        <div className="relative">
          <p className="font-serif text-lg sm:text-xl leading-relaxed text-cream">
            {displayedText}
            {isRevealing && <span className="inline-block w-0.5 h-5 bg-gold ml-1 animate-pulse" />}
          </p>

          {!isRevealing && (
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-cream/5">
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-xs text-cream-muted tracking-wide">Starweaver</span>
            </div>
          )}
        </div>
      </div>

      {!isRevealing && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-3">
            <ThreadsAccordion threads={threads} />
            <CoordinateReveal coordinates={coordinates} />
          </div>

          <div className="pt-4 flex justify-center">
            <button onClick={onStartNew} className="btn-secondary">
              Begin anew
            </button>
          </div>

          <p className="text-cream-muted/60 text-center text-sm mt-6">{DISCLAIMER_BRIEF}</p>
        </div>
      )}
    </div>
  )
}
