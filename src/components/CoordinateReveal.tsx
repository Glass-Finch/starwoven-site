'use client'

import { useState } from 'react'

import type { CoordinateSet } from '@/lib/types'
import { generateAnswerSegments } from '@/lib/questions'

interface CoordinateRevealProps {
  coordinates: CoordinateSet
}

export function CoordinateReveal({ coordinates }: CoordinateRevealProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)

  const hasQuestions = coordinates.questions.length > 0 && coordinates.answers.length > 0
  const segments = hasQuestions
    ? generateAnswerSegments(coordinates.answers, coordinates.questions)
    : []

  return (
    <div className="border border-cream/10 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle coordinate details"
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-cream/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-cream">Your coordinates</span>
          <code className="text-xs text-gold bg-gold/10 px-2 py-0.5 rounded">
            {coordinates.raw}
            {segments.length > 0 && ` (${segments.join('-')})`}
          </code>
        </div>
        <svg
          aria-hidden="true"
          className={`w-4 h-4 text-gray-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-cream/10 px-4 py-4 space-y-4">
          {hasQuestions ? (
            <>
              <p className="text-sm text-gray-muted">
                These coordinates were generated from your responses:
              </p>

              <div className="space-y-3">
                {coordinates.questions.map((question, index) => {
                  const answer = coordinates.answers.find((a) => a.questionId === question.id)
                  // Segments are generated in the same order as questions, so index is safe here
                  const segment = segments[index]
                  return (
                    <div key={question.id} className="p-3 bg-cosmic-deep/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-cream/60">{question.text}</p>
                        {segment && (
                          <code className="text-xs text-gold bg-gold/10 px-1.5 py-0.5 rounded shrink-0 ml-2">
                            {segment}
                          </code>
                        )}
                      </div>
                      <p className="text-sm text-cream font-medium">{answer?.answer || '—'}</p>
                    </div>
                  )
                })}
              </div>

              <p className="text-xs text-gray-muted text-center pt-2">
                Your answers shaped these coordinates.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-muted text-center">Custom coordinates provided.</p>
          )}
        </div>
      )}
    </div>
  )
}
