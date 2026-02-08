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

// Personalization inputs per message type
export interface BelovedInputs {
  yourName: string
  theirName: string
}

export interface AncestorInputs {
  yourName: string
  theirName: string
  relationship: string // e.g., "grandmother", "father", "friend"
}

export interface SageInputs {
  yourName: string
  birthday: string // ISO date string
}

export interface CosmosInputs {
  // No additional inputs - just intention
}

export interface CrossroadsInputs {
  // No additional inputs - intention must be yes/no question
}

export interface CallingInputs {
  yourName: string
  birthday: string // ISO date string
}

export type PersonalizationInputs =
  | { type: 'love_interest'; data: BelovedInputs }
  | { type: 'deceased_loved_one'; data: AncestorInputs }
  | { type: 'future_self'; data: SageInputs }
  | { type: 'universe_general'; data: CosmosInputs }
  | { type: 'life_decision'; data: CrossroadsInputs }
  | { type: 'purpose_world'; data: CallingInputs }

// Input field configuration
export interface InputFieldConfig {
  name: string
  label: string
  placeholder: string
  type: 'text' | 'date'
  required: boolean
}

// Message type configuration
export interface MessageTypeConfig {
  id: MessageType
  label: string
  description: string
  voice: string
  icon: string
  intentionPrompt: string
  intentionPlaceholder: string
  inputFields: InputFieldConfig[] // Additional fields beyond intention
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
  personalization: PersonalizationInputs
}

export interface ChannelResponse {
  status: 'complete' | 'partial'
  threads: ModelResponse[]
  synthesis: string
  failedModels?: AIModel[]
}
