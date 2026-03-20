/**
 * Zustand store for journey state management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  JourneyStep,
  MessageType,
  Question,
  CoordinateSet,
  ModelResponse,
  ModerationResult,
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
  coordinates: CoordinateSet | null
  intention: string
  isChanneling: boolean
  modelResponses: ModelResponse[]
  synthesis: string | null
  error: string | null
  moderationResult: ModerationResult | null
  useCustomCoordinates: boolean

  // Actions
  initSession: () => void
  setMessageType: (type: MessageType) => void
  setPersonalization: (data: Record<string, string>) => void
  setQuestions: (questions: Question[]) => void
  setCoordinates: (coordinates: CoordinateSet) => void
  setIntention: (intention: string) => void
  startChanneling: () => void
  addModelResponse: (response: ModelResponse) => void
  setSynthesis: (synthesis: string) => void
  setError: (error: string | null) => void
  setModerationResult: (result: ModerationResult | null) => void
  setUseCustomCoordinates: (use: boolean) => void
  reset: () => void
}

const initialState = {
  sessionId: null,
  currentStep: 'select' as JourneyStep,
  messageType: null,
  personalization: {},
  questions: [],
  coordinates: null,
  intention: '',
  isChanneling: false,
  modelResponses: [],
  synthesis: null,
  error: null,
  moderationResult: null,
  useCustomCoordinates: false,
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

      setQuestions: (questions) => {
        set({ questions })
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
          moderationResult: null,
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

      setModerationResult: (result) => {
        set({ moderationResult: result })
      },

      setUseCustomCoordinates: (use) => {
        set({ useCustomCoordinates: use })
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
