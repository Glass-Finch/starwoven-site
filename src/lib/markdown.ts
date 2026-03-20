/**
 * Lightweight markdown-to-React parser
 *
 * Handles paragraph breaks, bold, italic, and header stripping.
 * No external dependencies. Used for rendering synthesis and oracle thread text.
 */

import { createElement, type ReactNode } from 'react'

/**
 * Strip markdown to plain text (for word-by-word reveal in WovenMessage).
 * Removes formatting symbols but preserves paragraph breaks as \n\n.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '') // headers -> plain text
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic with *
    .replace(/_(.+?)_/g, '$1') // italic with _
}

/**
 * Render a markdown string as React elements.
 * Handles: paragraphs (\n\n), bold (**), italic (* or _), header stripping, line breaks (\n).
 */
export function renderMarkdown(text: string, className?: string): ReactNode {
  const paragraphs = text.split(/\n\n+/)

  return createElement(
    'div',
    { className },
    ...paragraphs.map((para, i) => {
      const trimmed = para.trim()
      if (!trimmed) return null

      // Strip header markers (## text -> text)
      const cleaned = trimmed.replace(/^#{1,6}\s+/gm, '')

      // Parse inline formatting within the paragraph
      const children = parseInline(cleaned)

      return createElement('p', { key: i, className: 'mb-4 last:mb-0' }, ...children)
    })
  )
}

/**
 * Render inline markdown for a single paragraph (bold, italic, line breaks).
 * Strips header markers. Used by WovenMessage to render completed paragraphs
 * during the word-by-word reveal without waiting for the full text.
 */
export function renderInlineMarkdown(text: string): ReactNode[] {
  const cleaned = text.replace(/^#{1,6}\s+/gm, '')
  return parseInline(cleaned)
}

/**
 * Parse inline markdown (bold, italic, line breaks) into React elements.
 */
function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // Match bold (**text**), italic (*text* or _text_), or line breaks
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|\n/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[1] !== undefined) {
      // Bold: **text**
      nodes.push(createElement('strong', { key: key++ }, match[1]))
    } else if (match[2] !== undefined) {
      // Italic: *text*
      nodes.push(createElement('em', { key: key++ }, match[2]))
    } else if (match[3] !== undefined) {
      // Italic: _text_
      nodes.push(createElement('em', { key: key++ }, match[3]))
    } else if (match[0] === '\n') {
      // Line break
      nodes.push(createElement('br', { key: key++ }))
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}
