import { describe, it, expect } from 'vitest'

import { stripMarkdown, renderMarkdown, renderInlineMarkdown } from '../markdown'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = { props: Record<string, any>; type: string }

/** Normalize React children (single child vs array) to always be an array. */
function childArray(el: AnyElement): unknown[] {
  const c = el.props.children
  return Array.isArray(c) ? c : [c]
}

describe('stripMarkdown', () => {
  it('removes bold markers', () => {
    expect(stripMarkdown('This is **bold** text')).toBe('This is bold text')
  })

  it('removes italic markers (asterisk)', () => {
    expect(stripMarkdown('This is *italic* text')).toBe('This is italic text')
  })

  it('removes italic markers (underscore)', () => {
    expect(stripMarkdown('This is _italic_ text')).toBe('This is italic text')
  })

  it('strips header markers', () => {
    expect(stripMarkdown('## A Header\nSome text')).toBe('A Header\nSome text')
    expect(stripMarkdown('### Sub Header')).toBe('Sub Header')
  })

  it('preserves paragraph breaks', () => {
    expect(stripMarkdown('First paragraph\n\nSecond paragraph')).toBe(
      'First paragraph\n\nSecond paragraph'
    )
  })

  it('handles mixed formatting', () => {
    expect(stripMarkdown('## Title\n\nThis is **bold** and *italic*')).toBe(
      'Title\n\nThis is bold and italic'
    )
  })

  it('passes through plain text unchanged', () => {
    expect(stripMarkdown('Just plain text')).toBe('Just plain text')
  })
})

describe('renderMarkdown', () => {
  it('renders plain text as a single paragraph', () => {
    const result = renderMarkdown('Hello world')
    expect(result).toBeTruthy()
    const div = result as AnyElement
    const children = childArray(div).filter(Boolean)
    expect(children).toHaveLength(1)
  })

  it('splits on double newlines into separate paragraphs', () => {
    const result = renderMarkdown('First paragraph\n\nSecond paragraph')
    const div = result as AnyElement
    const children = childArray(div).filter(Boolean)
    expect(children).toHaveLength(2)
  })

  it('renders bold text as <strong>', () => {
    const result = renderMarkdown('This is **bold** text')
    const div = result as AnyElement
    const p = childArray(div).filter(Boolean)[0] as AnyElement
    const pChildren = childArray(p)
    const strongChild = pChildren.find(
      (c: unknown) => typeof c === 'object' && c !== null && (c as AnyElement).type === 'strong'
    ) as AnyElement
    expect(strongChild).toBeTruthy()
    expect(strongChild.props.children).toBe('bold')
  })

  it('renders italic text as <em>', () => {
    const result = renderMarkdown('This is *italic* text')
    const div = result as AnyElement
    const p = childArray(div).filter(Boolean)[0] as AnyElement
    const pChildren = childArray(p)
    const emChild = pChildren.find(
      (c: unknown) => typeof c === 'object' && c !== null && (c as AnyElement).type === 'em'
    ) as AnyElement
    expect(emChild).toBeTruthy()
    expect(emChild.props.children).toBe('italic')
  })

  it('renders line breaks as <br>', () => {
    const result = renderMarkdown('Line one\nLine two')
    const div = result as AnyElement
    const p = childArray(div).filter(Boolean)[0] as AnyElement
    const pChildren = childArray(p)
    const brChild = pChildren.find(
      (c: unknown) => typeof c === 'object' && c !== null && (c as AnyElement).type === 'br'
    )
    expect(brChild).toBeTruthy()
  })

  it('strips header markers', () => {
    const result = renderMarkdown('## A Header')
    const div = result as AnyElement
    const p = childArray(div).filter(Boolean)[0] as AnyElement
    const pChildren = childArray(p)
    const textContent = pChildren.filter((c: unknown) => typeof c === 'string').join('')
    expect(textContent).toBe('A Header')
    expect(textContent).not.toContain('##')
  })

  it('accepts an optional className', () => {
    const result = renderMarkdown('Hello', 'my-class')
    const div = result as AnyElement
    expect(div.props.className).toBe('my-class')
  })

  it('handles empty string input', () => {
    const result = renderMarkdown('')
    const div = result as AnyElement
    const children = childArray(div).filter(Boolean)
    expect(children).toHaveLength(0)
  })

  it('collapses multiple blank lines into paragraph breaks', () => {
    const result = renderMarkdown('First\n\n\n\nSecond')
    const div = result as AnyElement
    const children = childArray(div).filter(Boolean)
    expect(children).toHaveLength(2)
  })

  it('handles leading whitespace and blank lines', () => {
    const result = renderMarkdown('\n\nHello world')
    const div = result as AnyElement
    const children = childArray(div).filter(Boolean)
    expect(children).toHaveLength(1)
  })
})

describe('renderInlineMarkdown', () => {
  it('renders bold as <strong>', () => {
    const nodes = renderInlineMarkdown('This is **bold** text')
    const strongNode = nodes.find(
      (n: unknown) => typeof n === 'object' && n !== null && (n as AnyElement).type === 'strong'
    ) as AnyElement
    expect(strongNode).toBeTruthy()
    expect(strongNode.props.children).toBe('bold')
  })

  it('strips header markers before rendering', () => {
    const nodes = renderInlineMarkdown('## A Header')
    const text = nodes.filter((n: unknown) => typeof n === 'string').join('')
    expect(text).toBe('A Header')
    expect(text).not.toContain('##')
  })

  it('renders italic as <em>', () => {
    const nodes = renderInlineMarkdown('This is *italic*')
    const emNode = nodes.find(
      (n: unknown) => typeof n === 'object' && n !== null && (n as AnyElement).type === 'em'
    ) as AnyElement
    expect(emNode).toBeTruthy()
    expect(emNode.props.children).toBe('italic')
  })
})
