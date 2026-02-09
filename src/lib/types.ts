/**
 * Core TypeScript interfaces for Starwoven
 */

// Message type presets (archetypal names)
export type MessageType =
  | 'beloved'
  | 'ancestor'
  | 'sage'
  | 'cosmos'
  | 'crossroads'
  | 'calling'

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CosmosInputs {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CrossroadsInputs {}

export interface CallingInputs {
  yourName: string
  birthday: string // ISO date string
}

export type PersonalizationInputs =
  | { type: 'beloved'; data: BelovedInputs }
  | { type: 'ancestor'; data: AncestorInputs }
  | { type: 'sage'; data: SageInputs }
  | { type: 'cosmos'; data: CosmosInputs }
  | { type: 'crossroads'; data: CrossroadsInputs }
  | { type: 'calling'; data: CallingInputs }

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
  oracle: string // e.g., "Iris", "Luna"
  prompt: string // The exact prompt sent to this model
  content: string
  status: 'success' | 'error' | 'timeout'
  error?: string
  latencyMs?: number
}

// Metadata for synthesis logging
export interface SynthesisMetadata {
  prompt: string
  threadsUsed: AIModel[]
  latencyMs: number
}

// Reading metadata structure
export interface ReadingMetadata {
  personalization?: Record<string, string>
  synthesis?: SynthesisMetadata
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
  metadata?: ReadingMetadata
}

// Journey state
export type JourneyStep =
  | 'select'
  | 'personalization'
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
  synthesisMetadata?: SynthesisMetadata
  failedModels?: AIModel[]
}
