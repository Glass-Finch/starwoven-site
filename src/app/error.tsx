'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps): React.ReactElement {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cosmic-black">
      <div className="w-full max-w-xl mx-auto text-center">
        <div className="card p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-8 h-8 text-gold"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>

          <h3 className="font-serif text-xl text-cream mb-3">
            Something slipped between the stars
          </h3>
          <p className="text-cream-muted mb-2">The connection was interrupted.</p>
          <p className="text-cream-muted text-sm mb-8">Your intention still holds.</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={reset} className="btn-primary">
              Try again
            </button>
            <a href="/" className="btn-secondary inline-flex items-center justify-center">
              Begin anew
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
