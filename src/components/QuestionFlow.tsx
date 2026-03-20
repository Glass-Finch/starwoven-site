'use client'

import { useState, useEffect, useCallback, useRef, Fragment } from 'react'

import type { Question, Answer } from '@/lib/types'
import { generateSingleSegment } from '@/lib/questions'

interface QuestionFlowProps {
  questions: Question[]
  onComplete: (answers: Answer[]) => void
}

export function QuestionFlow({ questions, onComplete }: QuestionFlowProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Reveal state
  const [revealState, setRevealState] = useState<'asking' | 'revealing'>('asking')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [accumulatedSegments, setAccumulatedSegments] = useState<string[]>([])
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const answersRef = useRef<Answer[]>([])

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const advanceToNext = useCallback(
    (updatedAnswers: Answer[]) => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current)
        revealTimerRef.current = null
      }
      setRevealState('asking')
      setSelectedAnswer(null)
      setIsTransitioning(true)

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1)
        } else {
          onComplete(updatedAnswers)
        }
        setIsTransitioning(false)
      }, 300)
    },
    [currentIndex, questions.length, onComplete]
  )

  const handleAnswer = useCallback(
    (answer: string) => {
      if (revealState === 'revealing') return

      setSelectedAnswer(answer)
      setRevealState('revealing')

      // Compute segment for coordinate bar
      const segment = generateSingleSegment(currentQuestion, answer)
      setAccumulatedSegments((prev) => [...prev, segment])

      // Build the answer
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        answer,
        timestamp: Date.now(),
      }
      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)
      answersRef.current = updatedAnswers

      // Auto-advance after reveal hold (2.5s to allow reading meanings)
      revealTimerRef.current = setTimeout(() => advanceToNext(updatedAnswers), 2500)
    },
    [currentQuestion, answers, revealState, advanceToNext]
  )

  // Tap-to-skip during reveal
  const handleRevealTap = useCallback(() => {
    if (revealState === 'revealing') {
      advanceToNext(answersRef.current)
    }
  }, [revealState, advanceToNext])

  // Reset state when questions change
  useEffect(() => {
    setCurrentIndex(0)
    setAnswers([])
    answersRef.current = []
    setRevealState('asking')
    setSelectedAnswer(null)
    setAccumulatedSegments([])
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current)
      revealTimerRef.current = null
    }
  }, [questions])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current)
      }
    }
  }, [])

  const hasValues = questions.some((q) => q.values && q.values.length > 0)

  return (
    <div className="w-full">
      {/* Coordinate bar: xxxx-xxxx format, grouped in two halves */}
      {hasValues && (
        <div className="flex items-center justify-center gap-1 mb-4 h-8">
          {questions.map((_, i) => (
            <Fragment key={i}>
              {i === Math.ceil(questions.length / 2) && (
                <span className="text-cream-muted text-sm font-mono select-none mx-0.5">-</span>
              )}
              {accumulatedSegments[i] ? (
                <code className="text-gold text-sm font-mono animate-fadeIn">
                  {accumulatedSegments[i]}
                </code>
              ) : (
                <span className="text-cream-muted text-sm font-mono select-none">__</span>
              )}
            </Fragment>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-8 sm:mb-12">
        <div className="h-1 bg-cream/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-cream-muted text-sm mt-2 text-center">
          {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div
        className={`transition-all duration-300 ${
          isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
        onClick={handleRevealTap}
        role={revealState === 'revealing' ? 'button' : undefined}
        tabIndex={revealState === 'revealing' ? 0 : undefined}
        aria-label={revealState === 'revealing' ? 'Tap to continue' : undefined}
        onKeyDown={
          revealState === 'revealing'
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') handleRevealTap()
              }
            : undefined
        }
      >
        <h2 className="font-serif text-xl sm:text-2xl text-cream text-center mb-8 leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Answer options */}
        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="grid gap-3">
            {currentQuestion.options.map((option) => {
              const isSelected = option === selectedAnswer
              const optionIndex = currentQuestion.options?.indexOf(option) ?? -1
              const isRevealing = revealState === 'revealing'

              return (
                <div key={option}>
                  <button
                    onClick={!isRevealing ? () => handleAnswer(option) : undefined}
                    disabled={isRevealing}
                    className={`w-full tap-target px-6 py-4 rounded-xl border text-left
                      transition-all duration-200 ease-out
                      ${
                        isRevealing
                          ? isSelected
                            ? 'border-gold/40 bg-gold/5'
                            : 'border-cream/5 opacity-20'
                          : 'border-cream/10 text-cream hover:border-gold/40 hover:bg-gold/5 active:scale-[0.98]'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={isSelected && isRevealing ? 'text-gold' : 'text-cream'}>
                        {option}
                      </span>
                      {isSelected && isRevealing && (
                        <code className="text-gold bg-gold/10 px-2 py-0.5 rounded text-sm animate-fadeIn">
                          {accumulatedSegments[accumulatedSegments.length - 1]}
                        </code>
                      )}
                    </div>
                    {isSelected && isRevealing && currentQuestion.meanings?.[optionIndex] && (
                      <p
                        className="text-sm text-cream-muted mt-2 animate-fadeIn"
                        style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}
                      >
                        {currentQuestion.meanings[optionIndex]}
                      </p>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Category indicator + tap hint */}
      <div className="mt-8 text-center space-y-2">
        <span className="inline-block px-3 py-1 text-xs text-cream-muted bg-cream/5 rounded-full">
          {currentQuestion.category === 'grounding'
            ? 'Grounding'
            : currentQuestion.category === 'weird'
              ? 'Opening'
              : 'Attuning'}
        </span>
        {revealState === 'revealing' && (
          <p
            className="text-xs text-cream-muted animate-fadeIn"
            style={{ animationDelay: '800ms', animationFillMode: 'backwards' }}
          >
            Tap to continue
          </p>
        )}
      </div>
    </div>
  )
}
