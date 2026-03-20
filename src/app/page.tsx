'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'

import { Starfield } from '@/components/Starfield'
import { MessageTypeSelector } from '@/components/MessageTypeSelector'
import { PersonalizationForm } from '@/components/PersonalizationForm'
import { QuestionFlow } from '@/components/QuestionFlow'
import { CustomCoordinateInput } from '@/components/CustomCoordinateInput'
import { IntentionInput } from '@/components/IntentionInput'
import { ChannelingLoader } from '@/components/ChannelingLoader'
import { WovenMessage } from '@/components/WovenMessage'
import { useJourneyStore } from '@/store'
import {
  selectQuestions,
  generateCoordinateString,
  enrichQuestionsWithMappings,
} from '@/lib/questions'
import { fetchCoordinateMappings } from '@/lib/supabase'
import { getMessageTypeConfig } from '@/lib/message-types'
import { classifyError, ERROR_MESSAGES, ERROR_TIPS } from '@/lib/errors'
import { DISCLAIMER_FULL } from '@/lib/constants'
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
    moderationResult,
    useCustomCoordinates,
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
    setModerationResult,
    setUseCustomCoordinates,
    reset,
  } = useJourneyStore()

  // Initialize session and pre-warm coordinate mappings cache on mount
  useEffect(() => {
    initSession()
    fetchCoordinateMappings().catch(() => {})
  }, [initSession])

  // Handle message type selection
  const handleMessageTypeSelect = async (type: MessageType) => {
    const selectedQuestions = selectQuestions(type)

    try {
      const mappings = await fetchCoordinateMappings()
      const finalQuestions =
        mappings.size > 0
          ? enrichQuestionsWithMappings(selectedQuestions, mappings)
          : selectedQuestions
      setQuestions(finalQuestions)
    } catch {
      setQuestions(selectedQuestions)
    }

    setMessageType(type)
  }

  // Handle personalization submission
  const handlePersonalizationSubmit = (data: Record<string, string>) => {
    setPersonalization(data)
  }

  // Handle question completion
  const handleQuestionsComplete = (completedAnswers: Answer[]) => {
    const coordinateString = generateCoordinateString(completedAnswers, questions)
    const coordinateSet: CoordinateSet = {
      raw: coordinateString,
      questions,
      answers: completedAnswers,
    }
    setCoordinates(coordinateSet)
  }

  // Handle custom coordinate submission
  const handleCustomCoordinateSubmit = (raw: string) => {
    const coordinateSet: CoordinateSet = {
      raw,
      questions: [],
      answers: [],
    }
    setCoordinates(coordinateSet)
  }

  // Perform channeling with real API
  const performChanneling = useCallback(async () => {
    if (!messageType || !coordinates || !intention || !sessionId) return

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
          sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: ChannelResponse = await response.json()

      // Handle moderation rejection
      if (data.status === 'moderated') {
        setModerationResult(data.moderationResult ?? null)
        setError(data.synthesis)
        return
      }

      // Carry through self-harm crisis resources (reading still proceeds)
      if (data.moderationResult?.category === 'self_harm') {
        setModerationResult(data.moderationResult)
      }

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
  }, [
    messageType,
    coordinates,
    intention,
    personalization,
    sessionId,
    addModelResponse,
    setSynthesis,
    setError,
    setModerationResult,
  ])

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

  // Handle starting a new reading
  const handleStartNew = () => {
    reset()
  }

  const messageTypeConfig = messageType ? getMessageTypeConfig(messageType) : undefined

  // Pre-compute error display values
  const errorKind = error ? classifyError(error) : null
  const errorMessage = errorKind ? ERROR_MESSAGES[errorKind] : null
  const errorTip = errorKind ? ERROR_TIPS[errorKind] : null

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 safe-top safe-bottom">
      <Starfield />

      <div className="relative z-10 w-full py-8 sm:py-12">
        {/* Welcome / Select step */}
        {currentStep === 'select' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-gradient mb-4">Starwoven</h1>
              <p className="text-cream-muted text-lg max-w-md mx-auto">
                A question, seen from many angles.
              </p>
            </div>

            <MessageTypeSelector onSelect={handleMessageTypeSelect} />

            <div className="max-w-md mx-auto text-center">
              <p className="text-cream-muted text-center text-sm mt-8">{DISCLAIMER_FULL}</p>
              <p className="text-center mt-3">
                <Link
                  href="/about"
                  className="text-xs text-cream-muted hover:text-cream-soft transition-colors"
                >
                  Learn how this works
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Personalization step */}
        {currentStep === 'personalization' && messageTypeConfig && (
          <div className="w-full max-w-xl mx-auto">
            <div className="content-panel">
              <PersonalizationForm
                messageTypeConfig={messageTypeConfig}
                onSubmit={handlePersonalizationSubmit}
                initialValues={personalization}
              />
            </div>
          </div>
        )}

        {/* Coordinate questions step */}
        {currentStep === 'coordinates' && (
          <div className="w-full max-w-xl mx-auto">
            <div className="content-panel">
              {useCustomCoordinates ? (
                <CustomCoordinateInput
                  onSubmit={handleCustomCoordinateSubmit}
                  onCancel={() => setUseCustomCoordinates(false)}
                />
              ) : (
                <>
                  {questions.length > 0 && (
                    <QuestionFlow questions={questions} onComplete={handleQuestionsComplete} />
                  )}
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setUseCustomCoordinates(true)}
                      aria-label="Switch to custom coordinate entry"
                      className="text-sm text-cream-muted hover:text-cream transition-colors"
                    >
                      I have my own coordinates
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Intention step */}
        {currentStep === 'intention' && messageTypeConfig && (
          <div className="w-full max-w-xl mx-auto">
            <div className="content-panel">
              <IntentionInput
                onSubmit={handleIntentionSubmit}
                messageTypeConfig={messageTypeConfig}
              />
            </div>
          </div>
        )}

        {/* Channeling step */}
        {currentStep === 'channeling' && !error && (
          <ChannelingLoader responses={modelResponses} isComplete={!!synthesis} />
        )}

        {/* Moderation rejection */}
        {error && moderationResult && !moderationResult.allowed && (
          <div className="w-full max-w-xl mx-auto px-4 text-center">
            <div className="card p-8 mb-4">
              <h3 className="font-serif text-xl text-cream mb-3">Unable to proceed</h3>
              <p className="text-cream-muted mb-8">{moderationResult.message}</p>
              <button onClick={handleStartNew} className="btn-secondary">
                Begin anew
              </button>
            </div>
          </div>
        )}

        {/* Generic error state */}
        {error && (!moderationResult || moderationResult.allowed) && (
          <div className="w-full max-w-xl mx-auto px-4 text-center">
            <div className="card p-8 mb-4">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-silver/10 flex items-center justify-center">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-8 h-8 text-silver"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>

              <h3 className="font-serif text-xl text-cream mb-3">Something slipped</h3>
              <p className="text-cream-muted mb-2">{errorMessage}</p>
              {errorTip && <p className="text-cream-muted text-sm mb-2">{errorTip}</p>}
              <p className="text-cream-muted text-sm mb-8">
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
          <>
            <WovenMessage
              synthesis={synthesis}
              threads={modelResponses}
              coordinates={coordinates}
              onStartNew={handleStartNew}
            />
            {moderationResult?.crisisResources && (
              <div className="w-full max-w-xl mx-auto px-4 mt-6">
                <div
                  role="alert"
                  aria-label="Crisis resources"
                  className="p-4 border border-cream/10 rounded-xl"
                >
                  <p className="text-sm text-cream-soft whitespace-pre-line">
                    {moderationResult.crisisResources}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
