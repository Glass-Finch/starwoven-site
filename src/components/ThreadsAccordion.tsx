'use client'

import { useState } from 'react'

import type { ModelResponse, AIModel } from '@/lib/types'
import { ORACLE_INFO } from '@/lib/ai'
import { renderMarkdown } from '@/lib/markdown'

interface ThreadsAccordionProps {
  threads: ModelResponse[]
}

export function ThreadsAccordion({ threads }: ThreadsAccordionProps): React.ReactElement {
  const [expandedThread, setExpandedThread] = useState<AIModel | null>(null)

  const successfulThreads = threads.filter((t) => t.status === 'success')
  const failedThreads = threads.filter((t) => t.status !== 'success')

  return (
    <div>
      <p className="text-xs text-cream-muted uppercase tracking-widest px-1 mb-2">
        Oracle impressions
      </p>

      <div className="border border-cream/10 rounded-xl overflow-hidden">
        {successfulThreads.map((thread) => {
          const isExpanded = expandedThread === thread.model
          const oracle = ORACLE_INFO[thread.model] ?? {
            name: thread.model,
            shortModel: thread.model,
            color: '#9a9488',
            archetype: '',
          }

          return (
            <div key={thread.model} className="border-b border-cream/5 last:border-b-0">
              <button
                onClick={() => setExpandedThread(isExpanded ? null : thread.model)}
                aria-expanded={isExpanded}
                aria-label={`Toggle ${oracle.name} impression`}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-cream/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: oracle.color }} />
                  <span className="text-sm text-cream">
                    {oracle.name}
                    <span className="text-xs text-cream-muted ml-1">({oracle.shortModel})</span>
                  </span>
                </div>
                <svg
                  aria-hidden="true"
                  className={`w-3 h-3 text-cream-muted transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="p-3 bg-cosmic-deep/50 rounded-lg">
                    {renderMarkdown(thread.content, 'text-sm text-cream-soft leading-relaxed')}
                    {thread.latencyMs && (
                      <p className="mt-2 text-xs text-cream-muted">
                        {(thread.latencyMs / 1000).toFixed(1)}s
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {failedThreads.length > 0 && (
          <div className="px-4 py-3 border-t border-cream/10">
            <p className="text-xs text-cream-muted">
              Did not respond:{' '}
              {failedThreads.map((t) => ORACLE_INFO[t.model]?.name ?? t.model).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
