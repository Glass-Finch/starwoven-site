/**
 * Core TypeScript interfaces for Starwoven
 */

// Message type presets
export type MessageType =
  | 'love_interest'
  | 'deceased_loved_one'
  | 'future_self'
  | 'universe_general'
  | 'life_decision'
  | 'purpose_world'

// Message type configuration
export interface MessageTypeConfig {
  id: MessageType
  label: string
  description: string
  voice: string
  icon: string
}

// Question types
export interface Question {
  id: string
  messageType: MessageType | null
  category: 'themed' | 'grounding' | 'weird'
  text: string
  answerType: 'multiple_choice' | 'short_text'
  options?: string[]
}

export interface Answer {
  questionId: string
  answer: string
  timestamp: number
}

// Coordinate system
export interface CoordinateSet {
  raw: string
  questions: Question[]
  answers: Answer[]
}

// AI Model responses
export type AIModel =
  | 'gpt-4.1'
  | 'claude-sonnet-4.5'
  | 'gemini-3.0-pro'
  | 'deepseek-reasoner'
  | 'grok-4'

export interface ModelResponse {
  model: AIModel
  content: string
  status: 'success' | 'error' | 'timeout'
  error?: string
  latencyMs?: number
}

// Reading (saved to Supabase)
export interface Reading {
  id: string
  createdAt: string
  sessionId: string
  messageType: MessageType
  intention: string
  coordinates: CoordinateSet
  synthesis: string
  threads: ModelResponse[]
  metadata?: Record<string, unknown>
}

// Journey state
export type JourneyStep =
  | 'select'
  | 'coordinates'
  | 'intention'
  | 'channeling'
  | 'message'

export interface JourneyState {
  currentStep: JourneyStep
  messageType: MessageType | null
  questions: Question[]
  answers: Answer[]
  coordinates: CoordinateSet | null
  intention: string
  isChanneling: boolean
  modelResponses: ModelResponse[]
  synthesis: string | null
  error: string | null
}

// API types
export interface ChannelRequest {
  messageType: MessageType
  coordinates: CoordinateSet
  intention: string
}

export interface ChannelResponse {
  status: 'complete' | 'partial'
  threads: ModelResponse[]
  synthesis: string
  failedModels?: AIModel[]
}
