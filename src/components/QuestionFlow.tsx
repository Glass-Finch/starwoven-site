'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Question, Answer } from '@/lib/types'

interface QuestionFlowProps {
  questions: Question[]
  onComplete: (answers: Answer[]) => void
}

export function QuestionFlow({ questions, onComplete }: QuestionFlowProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [textInput, setTextInput] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleAnswer = useCallback((answer: string) => {
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer,
      timestamp: Date.now(),
    }

    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)
    setTextInput('')

    // Transition to next question or complete
    setIsTransitioning(true)
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        onComplete(updatedAnswers)
      }
      setIsTransitioning(false)
    }, 300)
  }, [currentQuestion, answers, currentIndex, questions.length, onComplete])

  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (textInput.trim()) {
      handleAnswer(textInput.trim())
    }
  }, [textInput, handleAnswer])

  // Reset state when questions change
  useEffect(() => {
    setCurrentIndex(0)
    setAnswers([])
    setTextInput('')
  }, [questions])

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {/* Progress bar */}
      <div className="mb-8 sm:mb-12">
        <div className="h-1 bg-cream/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-muted text-sm mt-2 text-center">
          {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div
        className={`transition-all duration-300 ${
          isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <h2 className="font-serif text-xl sm:text-2xl text-cream text-center mb-8 leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Answer options */}
        {currentQuestion.answerType === 'multiple_choice' && currentQuestion.options ? (
          <div className="grid gap-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="w-full tap-target px-6 py-4 rounded-xl border border-cream/10 text-cream text-left
                         hover:border-gold/40 hover:bg-gold/5 active:scale-[0.98]
                         transition-all duration-200 ease-out"
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your answer..."
              className="input text-center"
              autoFocus
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </form>
        )}
      </div>

      {/* Category indicator */}
      <div className="mt-8 text-center">
        <span className="inline-block px-3 py-1 text-xs text-gray-muted bg-cream/5 rounded-full">
          {currentQuestion.category === 'grounding' ? 'Grounding' :
           currentQuestion.category === 'weird' ? 'Opening' : 'Attuning'}
        </span>
      </div>
    </div>
  )
}
