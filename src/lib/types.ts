/**
 * Core TypeScript interfaces for Starwoven
 */

// Message type presets (archetypal names)
export type MessageType = 'beloved' | 'ancestor' | 'sage' | 'cosmos' | 'crossroads' | 'calling'

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
  | 'grok-4-1-fast-reasoning'

export interface ModelResponse {
  model: AIModel
  oracle: string // e.g., "Iris", "Luna"
  prompt: string // The exact prompt sent to this model
  content: string
  status: 'success' | 'error' | 'timeout'
  error?: string
  latencyMs?: number
}

// Validation result from QA layer
export interface ValidationResult {
  model: AIModel
  isValid: boolean
  reason?: string
  confidence: number
  latencyMs: number
}

// Outlier detection for coherence analysis
export interface OutlierInfo {
  model: string
  divergenceType: 'thematic' | 'emotional' | 'temporal' | 'tone'
  severity: 'minor' | 'moderate' | 'major'
  description: string
}

// Per-dimension rubric scores
export interface CoherenceRubric {
  thematicAlignment: number // 0-100: Do responses share underlying themes?
  complementaryPerspectives: number // 0-100: Do they enrich (not contradict)?
  intuitiveResonance: number // 0-100: Similar feelings/imagery?
  contextualRelevance: number // 0-100: Connected to intention/personalization?
  specificity: number // 0-100: Specific vs generic fortune-cookie?
}

// Coherence analysis result
export interface CoherenceResult {
  coherenceScore: number // 0-100 (weighted average of rubric dimensions)
  rubric: CoherenceRubric // Per-dimension scores
  confidence: number // 0.0-1.0
  themeOverlap: string[] // shared themes across 3+ responses
  outliers: OutlierInfo[] // responses that diverge
  isCoherent: boolean // coherenceScore >= 75
  reasoning: string // brief explanation
  genericPhrases: string[] // detected platitudes
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
  validation?: ValidationResult[]
  coherence?: CoherenceResult
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
  sessionId: string
}

export interface ChannelResponse {
  status: 'complete' | 'partial' | 'error'
  threads: ModelResponse[]
  synthesis: string
  synthesisMetadata?: SynthesisMetadata
  validationResults?: ValidationResult[]
  coherenceResult?: CoherenceResult
  failedModels?: AIModel[]
}
