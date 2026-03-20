'use client'

import { useState, useCallback } from 'react'

interface CustomCoordinateInputProps {
  onSubmit: (raw: string) => void
  onCancel: () => void
}

const MIN_DIGITS = 6
const MAX_DIGITS = 20

export function stripToDigits(input: string): string {
  return input.replace(/[^0-9]/g, '')
}

export function formatCoordinate(digits: string): string {
  if (digits.length <= 4) return digits
  // Split into groups of 4 with dashes
  const groups: string[] = []
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4))
  }
  return groups.join('-')
}

export function CustomCoordinateInput({
  onSubmit,
  onCancel,
}: CustomCoordinateInputProps): React.ReactElement {
  const [input, setInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    setValidationError(null)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const digits = stripToDigits(input)

      if (digits.length < MIN_DIGITS) {
        setValidationError(`Enter at least ${MIN_DIGITS} digits.`)
        return
      }

      if (digits.length > MAX_DIGITS) {
        setValidationError(`Enter no more than ${MAX_DIGITS} digits.`)
        return
      }

      onSubmit(formatCoordinate(digits))
    },
    [input, onSubmit]
  )

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-gradient mb-3">Enter your coordinates</h2>
        <p className="text-cream-muted">
          Enter {MIN_DIGITS} to {MAX_DIGITS} digits. Dashes and spaces are allowed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            value={input}
            onChange={handleChange}
            placeholder="1986-0923-4217"
            maxLength={30}
            aria-label="Your coordinates"
            aria-describedby={validationError ? 'coord-error' : undefined}
            className="input tracking-widest"
            autoFocus
            autoComplete="off"
          />
          {validationError && (
            <p id="coord-error" className="text-sm text-gold mt-2 text-center">
              {validationError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!input.trim()}
          className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Use these coordinates
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onCancel}
          className="text-sm text-cream-muted hover:text-cream transition-colors"
        >
          Answer questions instead
        </button>
      </div>
    </div>
  )
}
