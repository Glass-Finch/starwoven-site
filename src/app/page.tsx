'use client'

import { useEffect, useCallback } from 'react'
import { Starfield } from '@/components/Starfield'
import { MessageTypeSelector } from '@/components/MessageTypeSelector'
import { PersonalizationForm } from '@/components/PersonalizationForm'
import { QuestionFlow } from '@/components/QuestionFlow'
import { IntentionInput } from '@/components/IntentionInput'
import { ChannelingLoader } from '@/components/ChannelingLoader'
import { WovenMessage } from '@/components/WovenMessage'
import { useJourneyStore } from '@/store'
import { selectQuestions, generateCoordinateString } from '@/lib/questions'
import { getMessageTypeConfig } from '@/lib/message-types'
import { saveReading } from '@/lib/supabase'
import type { MessageType, Answer, CoordinateSet, ChannelResponse } from '@/lib/types'

export default function Home(): React.ReactElement {
  const {
    sessionId,
    currentStep,
    messageType,
    personalization,
    questions,
    coordinates,
    intention,
    modelResponses,
    synthesis,
    error,
    initSession,
    setMessageType,
    setPersonalization,
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

  // Handle personalization submission
  const handlePersonalizationSubmit = (data: Record<string, string>) => {
    setPersonalization(data)
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
    if (!messageType || !coordinates || !sessionId) return

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
          personalization: {
            type: messageType,
            data: personalization,
          },
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

      // Save reading to database (fire and forget)
      saveReading({
        session_id: sessionId,
        message_type: messageType,
        intention,
        coordinates,
        synthesis: data.synthesis,
        threads: data.threads,
        metadata: {
          personalization,
          synthesis: data.synthesisMetadata,
        },
      }).catch((err) => console.error('Failed to save reading:', err))
    } catch (err) {
      console.error('Channeling error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [messageType, coordinates, intention, personalization, sessionId, addModelResponse, setSynthesis, setError])

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
                Starwoven
              </h1>
              <p className="text-gray-muted text-lg max-w-md mx-auto">
                A question, seen from many angles.
              </p>
            </div>

            <MessageTypeSelector onSelect={handleMessageTypeSelect} />
          </div>
        )}

        {/* Personalization step */}
        {currentStep === 'personalization' && messageTypeConfig && (
          <PersonalizationForm
            messageTypeConfig={messageTypeConfig}
            onSubmit={handlePersonalizationSubmit}
            initialValues={personalization}
          />
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
            messageTypeConfig={messageTypeConfig}
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
            <div className="card p-8 mb-4">
              {/* Mystical error icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gold">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>

              <h3 className="font-serif text-xl text-cream mb-3">
                Something slipped
              </h3>
              <p className="text-gray-muted mb-2">
                {error.includes('timeout') || error.includes('Timeout')
                  ? 'The connection timed out.'
                  : error.includes('network') || error.includes('Network') || error.includes('fetch')
                  ? 'Couldn\'t reach the oracles. Check your connection.'
                  : error.includes('API') || error.includes('500')
                  ? 'One or more oracles didn\'t respond.'
                  : 'The transmission was interrupted.'}
              </p>
              <p className="text-gray-muted/60 text-sm mb-8">
                Your intention and coordinates are preserved.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setError(null)
                    startChanneling()
                  }}
                  className="btn-primary"
                >
                  Try again
                </button>
                <button onClick={handleStartNew} className="btn-secondary">
                  Begin anew
                </button>
              </div>
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
