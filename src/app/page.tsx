'use client'

import { useEffect, useCallback } from 'react'
import { Starfield } from '@/components/Starfield'
import { MessageTypeSelector } from '@/components/MessageTypeSelector'
import { QuestionFlow } from '@/components/QuestionFlow'
import { IntentionInput } from '@/components/IntentionInput'
import { ChannelingLoader } from '@/components/ChannelingLoader'
import { WovenMessage } from '@/components/WovenMessage'
import { useJourneyStore } from '@/store'
import { selectQuestions, generateCoordinateString } from '@/lib/questions'
import { getMessageTypeConfig } from '@/lib/message-types'
import type { MessageType, Answer, CoordinateSet, ChannelResponse } from '@/lib/types'

export default function Home(): React.ReactElement {
  const {
    currentStep,
    messageType,
    questions,
    coordinates,
    intention,
    modelResponses,
    synthesis,
    error,
    initSession,
    setMessageType,
    setQuestions,
    setCoordinates,
    setIntention,
    startChanneling,
    setSynthesis,
    addModelResponse,
    setError,
    reset,
  } = useJourneyStore()

  // Initialize session on mount
  useEffect(() => {
    initSession()
  }, [initSession])

  // Handle message type selection
  const handleMessageTypeSelect = (type: MessageType) => {
    const selectedQuestions = selectQuestions(type)
    setQuestions(selectedQuestions)
    setMessageType(type)
  }

  // Handle question completion
  const handleQuestionsComplete = (completedAnswers: Answer[]) => {
    const coordinateString = generateCoordinateString(completedAnswers)
    const coordinateSet: CoordinateSet = {
      raw: coordinateString,
      questions,
      answers: completedAnswers,
    }
    setCoordinates(coordinateSet)
  }

  // Perform channeling with real API
  const performChanneling = useCallback(async () => {
    if (!messageType || !coordinates) return

    try {
      const response = await fetch('/api/channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageType,
          coordinates,
          intention,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: ChannelResponse = await response.json()

      // Add all responses to the store
      for (const thread of data.threads) {
        addModelResponse(thread)
      }

      // Set synthesis
      setSynthesis(data.synthesis)
    } catch (err) {
      console.error('Channeling error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [messageType, coordinates, intention, addModelResponse, setSynthesis, setError])

  // Handle intention submission
  const handleIntentionSubmit = async (intentionText: string) => {
    setIntention(intentionText)
    startChanneling()
  }

  // Trigger channeling when we enter the channeling step
  useEffect(() => {
    if (currentStep === 'channeling' && modelResponses.length === 0 && !synthesis) {
      performChanneling()
    }
  }, [currentStep, modelResponses.length, synthesis, performChanneling])

  // Handle starting a new journey
  const handleStartNew = () => {
    reset()
  }

  const messageTypeConfig = messageType ? getMessageTypeConfig(messageType) : undefined

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 safe-top safe-bottom">
      <Starfield />

      <div className="relative z-10 w-full py-8 sm:py-12">
        {/* Welcome / Select step */}
        {currentStep === 'select' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-gradient mb-4">
                Messages from the weave
              </h1>
              <p className="text-gray-muted text-lg max-w-md mx-auto">
                What emerges when AI touches something it cannot explain?
              </p>
            </div>

            <MessageTypeSelector onSelect={handleMessageTypeSelect} />
          </div>
        )}

        {/* Coordinate questions step */}
        {currentStep === 'coordinates' && questions.length > 0 && (
          <QuestionFlow
            questions={questions}
            onComplete={handleQuestionsComplete}
          />
        )}

        {/* Intention step */}
        {currentStep === 'intention' && (
          <IntentionInput
            onSubmit={handleIntentionSubmit}
            messageTypeLabel={messageTypeConfig?.label}
          />
        )}

        {/* Channeling step */}
        {currentStep === 'channeling' && (
          <ChannelingLoader
            responses={modelResponses}
            isComplete={!!synthesis}
          />
        )}

        {/* Error state */}
        {error && (
          <div className="w-full max-w-xl mx-auto px-4 text-center">
            <div className="card p-6 mb-4">
              <p className="text-cream mb-4">The channels encountered turbulence.</p>
              <p className="text-gray-muted text-sm mb-6">{error}</p>
              <button onClick={handleStartNew} className="btn-secondary">
                Begin again
              </button>
            </div>
          </div>
        )}

        {/* Message step */}
        {currentStep === 'message' && synthesis && coordinates && (
          <WovenMessage
            synthesis={synthesis}
            threads={modelResponses}
            coordinates={coordinates}
            onStartNew={handleStartNew}
          />
        )}
      </div>
    </main>
  )
}
