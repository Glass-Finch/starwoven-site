'use client'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Catches errors in layout.tsx itself (rare).
 * Must include its own <html> and <body> tags since the layout may have failed.
 * Uses inline styles only — CSS/Tailwind may not load in global error boundary.
 * Colors match globals.css design tokens: #0a0a1a=cosmic-black, #e8e4dc=cream,
 * #c8a84e=gold, #9a9488=cream-muted, #a08030=gold-dim.
 */
export default function GlobalError({ reset }: GlobalErrorProps): React.ReactElement {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a1a',
          color: '#e8e4dc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 400,
              marginBottom: '12px',
              color: '#e8e4dc',
            }}
          >
            Something slipped between the stars
          </h1>
          <p style={{ color: '#9a9488', marginBottom: '32px', fontSize: '0.875rem' }}>
            The connection was interrupted.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #c8a84e 0%, #a08030 100%)',
                color: '#0a0a1a',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#e8e4dc',
                border: '1px solid rgba(232, 228, 220, 0.2)',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              Begin anew
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
