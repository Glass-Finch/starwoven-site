'use client'

import { useState, useCallback } from 'react'

const MAX_INTENTION_LENGTH = 250

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_INTENTION_LENGTH) {
      setIntention(value)
    }
  }, [])

  const placeholder = messageTypeLabel
    ? `What would you ask ${messageTypeLabel.toLowerCase()}?`
    : 'What question calls to be answered?'

  const charsRemaining = MAX_INTENTION_LENGTH - intention.length

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-gradient mb-3">Set your intention</h2>
        <p className="text-gray-muted">
          The more open-ended, the better
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <textarea
            value={intention}
            onChange={handleChange}
            placeholder={placeholder}
            rows={3}
            maxLength={MAX_INTENTION_LENGTH}
            className="textarea text-center"
            autoFocus
          />
          <div className={`absolute bottom-3 right-3 text-xs ${charsRemaining < 50 ? 'text-gold' : 'text-gray-muted'}`}>
            {charsRemaining}
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
        Less detail invites more discovery.
        <br />
        Let the question breathe.
      </p>
    </div>
  )
}
