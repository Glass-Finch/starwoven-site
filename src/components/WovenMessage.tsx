'use client'

import { useState, useEffect, useMemo } from 'react'

import type { ModelResponse, CoordinateSet } from '@/lib/types'
import { DISCLAIMER_BRIEF } from '@/lib/constants'
import { stripMarkdown, renderMarkdown, renderInlineMarkdown } from '@/lib/markdown'

import { ThreadsAccordion } from './ThreadsAccordion'
import { CoordinateReveal } from './CoordinateReveal'

interface WovenMessageProps {
  synthesis: string
  threads: ModelResponse[]
  coordinates: CoordinateSet
  onStartNew: () => void
}

/** Split text into paragraphs, then words within each paragraph */
function buildParagraphWords(text: string): string[][] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.split(/\s+/))
}

export function WovenMessage({
  synthesis,
  threads,
  coordinates,
  onStartNew,
}: WovenMessageProps): React.ReactElement {
  const [wordCount, setWordCount] = useState(0)
  const [isRevealing, setIsRevealing] = useState(true)

  const stripped = useMemo(() => stripMarkdown(synthesis), [synthesis])
  const originalParagraphs = useMemo(
    () =>
      synthesis
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean),
    [synthesis]
  )
  const paragraphWords = useMemo(() => buildParagraphWords(stripped), [stripped])
  const totalWords = useMemo(
    () => paragraphWords.reduce((sum, p) => sum + p.length, 0),
    [paragraphWords]
  )

  useEffect(() => {
    if (!synthesis) return

    setWordCount(0)
    setIsRevealing(true)

    let current = 0
    const interval = setInterval(() => {
      current++
      if (current <= totalWords) {
        setWordCount(current)
      } else {
        clearInterval(interval)
        setIsRevealing(false)
      }
    }, 60)

    return () => clearInterval(interval)
  }, [synthesis, totalWords])

  // Build revealed text: complete paragraphs + partial current paragraph
  const revealedContent = useMemo(() => {
    if (!isRevealing) return null

    let remaining = wordCount
    const parts: React.ReactNode[] = []

    for (let i = 0; i < paragraphWords.length; i++) {
      const pWords = paragraphWords[i]
      if (remaining <= 0) break

      if (remaining >= pWords.length) {
        // Full paragraph: render with inline markdown formatting
        parts.push(
          <p
            key={i}
            className="mb-4 last:mb-0 font-serif text-lg sm:text-xl leading-relaxed text-cream"
          >
            {originalParagraphs[i] ? renderInlineMarkdown(originalParagraphs[i]) : pWords.join(' ')}
          </p>
        )
        remaining -= pWords.length
      } else {
        // Partial paragraph (currently revealing)
        parts.push(
          <p
            key={i}
            className="mb-4 last:mb-0 font-serif text-lg sm:text-xl leading-relaxed text-cream"
          >
            {pWords.slice(0, remaining).join(' ')}
            <span className="inline-block w-0.5 h-5 bg-gold ml-1 animate-pulse" />
          </p>
        )
        remaining = 0
      }
    }

    return parts
  }, [isRevealing, wordCount, paragraphWords, originalParagraphs])

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Synthesis */}
      <div className="card relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-radial from-gold/5 to-transparent pointer-events-none" />

        <div className="relative">
          {isRevealing
            ? revealedContent
            : renderMarkdown(synthesis, 'font-serif text-lg sm:text-xl leading-relaxed text-cream')}

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

          <p className="text-cream-muted text-center text-sm mt-6">{DISCLAIMER_BRIEF}</p>
        </div>
      )}
    </div>
  )
}
