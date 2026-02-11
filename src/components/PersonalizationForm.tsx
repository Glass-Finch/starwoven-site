'use client'

import { useState, useCallback, useEffect } from 'react'

import type { MessageTypeConfig, InputFieldConfig } from '@/lib/types'

interface PersonalizationFormProps {
  messageTypeConfig: MessageTypeConfig
  onSubmit: (data: Record<string, string>) => void
  initialValues?: Record<string, string>
}

export function PersonalizationForm({
  messageTypeConfig,
  onSubmit,
  initialValues = {},
}: PersonalizationFormProps): React.ReactElement {
  const [values, setValues] = useState<Record<string, string>>(initialValues)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const handleChange = useCallback((field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(values)
    },
    [values, onSubmit]
  )

  const isValid = messageTypeConfig.inputFields.every((field) => {
    if (!field.required) return true
    return values[field.name]?.trim()
  })

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-gradient mb-3">{messageTypeConfig.label}</h2>
        <p className="text-cream-muted">{messageTypeConfig.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {messageTypeConfig.inputFields.map((field, index) => (
          <FieldInput
            key={field.name}
            field={field}
            value={values[field.name] || ''}
            onChange={(value) => handleChange(field.name, value)}
            autoFocus={index === 0}
          />
        ))}

        <button
          type="submit"
          disabled={!isValid}
          className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed mt-8"
        >
          Continue
        </button>
      </form>
    </div>
  )
}

interface FieldInputProps {
  field: InputFieldConfig
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

function FieldInput({ field, value, onChange, autoFocus }: FieldInputProps): React.ReactElement {
  const inputClasses = `
    w-full px-4 py-3
    bg-cosmic-deep border border-cream/10 rounded-lg
    text-cream placeholder:text-cream-muted
    focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
    transition-all duration-200
  `

  return (
    <div className="space-y-2">
      <label htmlFor={field.name} className="block text-sm text-cream-soft">
        {field.label}
        {field.required && <span className="text-gold ml-1">*</span>}
      </label>

      {field.type === 'date' ? (
        <input
          id={field.name}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          autoFocus={autoFocus}
          className={inputClasses}
        />
      ) : (
        <input
          id={field.name}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          autoFocus={autoFocus}
          className={inputClasses}
        />
      )}
    </div>
  )
}
