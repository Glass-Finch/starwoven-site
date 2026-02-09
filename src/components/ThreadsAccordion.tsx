'use client'

import { useState } from 'react'
import type { ModelResponse, AIModel } from '@/lib/types'
import { ORACLE_INFO } from '@/lib/ai'

interface ThreadsAccordionProps {
  threads: ModelResponse[]
}

export function ThreadsAccordion({ threads }: ThreadsAccordionProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedThread, setExpandedThread] = useState<AIModel | null>(null)

  const successfulThreads = threads.filter(t => t.status === 'success')

  return (
    <div className="border border-cream/10 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-cream/5 transition-colors"
      >
        <span className="text-sm text-cream">
          View threads ({successfulThreads.length})
        </span>
        <svg
          className={`w-4 h-4 text-gray-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-cream/10">
          {successfulThreads.map((thread) => (
            <div key={thread.model} className="border-b border-cream/5 last:border-b-0">
              <button
                onClick={() =>
                  setExpandedThread(expandedThread === thread.model ? null : thread.model)
                }
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-cream/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold/60" />
                  <span className="text-sm text-cream">{ORACLE_INFO[thread.model].name}</span>
                </div>
                <svg
                  className={`w-3 h-3 text-gray-muted transition-transform duration-200 ${
                    expandedThread === thread.model ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedThread === thread.model && (
                <div className="px-4 pb-4">
                  <div className="p-3 bg-cosmic-deep/50 rounded-lg">
                    <p className="text-sm text-cream/80 leading-relaxed whitespace-pre-wrap">
                      {thread.content}
                    </p>
                    {thread.latencyMs && (
                      <p className="mt-2 text-xs text-gray-muted">
                        Response time: {(thread.latencyMs / 1000).toFixed(1)}s
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Failed threads */}
          {threads.filter(t => t.status !== 'success').length > 0 && (
            <div className="px-4 py-3 border-t border-cream/10">
              <p className="text-xs text-gray-muted">
                Some channels did not respond:{' '}
                {threads
                  .filter(t => t.status !== 'success')
                  .map(t => ORACLE_INFO[t.model].name)
                  .join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
