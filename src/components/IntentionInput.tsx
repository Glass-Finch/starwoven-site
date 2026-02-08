'use client'

import { useState, useCallback } from 'react'

interface IntentionInputProps {
  onSubmit: (intention: string) => void
  messageTypeLabel?: string
}

export function IntentionInput({ onSubmit, messageTypeLabel }: IntentionInputProps): React.ReactElement {
  const [intention, setIntention] = useState('')

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (intention.trim()) {
      onSubmit(intention.trim())
    }
  }, [intention, onSubmit])

  const placeholder = messageTypeLabel
    ? `What would you ask ${messageTypeLabel.toLowerCase()}?`
    : 'What question calls to be answered?'

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-gradient mb-3">Set your intention</h2>
        <p className="text-gray-muted">
          Speak your question into the weave
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="textarea text-center"
            autoFocus
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-muted">
            {intention.length}/500
          </div>
        </div>

        <button
          type="submit"
          disabled={!intention.trim()}
          className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Open the channel
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-muted">
        Your question shapes the message you receive.
        <br />
        Speak from the heart.
      </p>
    </div>
  )
}
