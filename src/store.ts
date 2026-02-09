/**
 * Zustand store for journey state management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  JourneyStep,
  MessageType,
  Question,
  Answer,
  CoordinateSet,
  ModelResponse,
} from '@/lib/types'
import { getMessageTypeConfig } from '@/lib/message-types'

interface JourneyStore {
  // Session
  sessionId: string | null

  // Journey state
  currentStep: JourneyStep
  messageType: MessageType | null
  personalization: Record<string, string>
  questions: Question[]
  answers: Answer[]
  coordinates: CoordinateSet | null
  intention: string
  isChanneling: boolean
  modelResponses: ModelResponse[]
  synthesis: string | null
  error: string | null

  // Actions
  initSession: () => void
  setMessageType: (type: MessageType) => void
  setPersonalization: (data: Record<string, string>) => void
  setPersonalizationField: (field: string, value: string) => void
  setQuestions: (questions: Question[]) => void
  addAnswer: (answer: Answer) => void
  setCoordinates: (coordinates: CoordinateSet) => void
  setIntention: (intention: string) => void
  startChanneling: () => void
  addModelResponse: (response: ModelResponse) => void
  setSynthesis: (synthesis: string) => void
  setError: (error: string | null) => void
  setStep: (step: JourneyStep) => void
  reset: () => void
}

const initialState = {
  sessionId: null,
  currentStep: 'select' as JourneyStep,
  messageType: null,
  personalization: {},
  questions: [],
  answers: [],
  coordinates: null,
  intention: '',
  isChanneling: false,
  modelResponses: [],
  synthesis: null,
  error: null,
}

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initSession: () => {
        if (!get().sessionId) {
          set({ sessionId: crypto.randomUUID() })
        }
      },

      setMessageType: (type) => {
        const config = getMessageTypeConfig(type)
        const hasInputFields = config?.inputFields && config.inputFields.length > 0

        set({
          messageType: type,
          currentStep: hasInputFields ? 'personalization' : 'coordinates',
          personalization: {},
          answers: [],
          coordinates: null,
          intention: '',
          modelResponses: [],
          synthesis: null,
          error: null,
        })
      },

      setPersonalization: (data) => {
        set({
          personalization: data,
          currentStep: 'coordinates',
        })
      },

      setPersonalizationField: (field, value) => {
        set((state) => ({
          personalization: {
            ...state.personalization,
            [field]: value,
          },
        }))
      },

      setQuestions: (questions) => {
        set({ questions })
      },

      addAnswer: (answer) => {
        set((state) => ({
          answers: [...state.answers, answer],
        }))
      },

      setCoordinates: (coordinates) => {
        set({
          coordinates,
          currentStep: 'intention',
        })
      },

      setIntention: (intention) => {
        set({ intention })
      },

      startChanneling: () => {
        set({
          isChanneling: true,
          currentStep: 'channeling',
          modelResponses: [],
          synthesis: null,
          error: null,
        })
      },

      addModelResponse: (response) => {
        set((state) => ({
          modelResponses: [...state.modelResponses, response],
        }))
      },

      setSynthesis: (synthesis) => {
        set({
          synthesis,
          isChanneling: false,
          currentStep: 'message',
        })
      },

      setError: (error) => {
        set({
          error,
          isChanneling: false,
        })
      },

      setStep: (step) => {
        set({ currentStep: step })
      },

      reset: () => {
        const sessionId = get().sessionId
        set({
          ...initialState,
          sessionId,
        })
      },
    }),
    {
      name: 'starwoven-journey',
      partialize: (state) => ({
        sessionId: state.sessionId,
      }),
    }
  )
)
