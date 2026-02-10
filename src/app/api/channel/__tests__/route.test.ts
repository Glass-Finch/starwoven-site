import { describe, it, expect } from 'vitest'

import { POST } from '../route'

/**
 * Smoke tests for the channel API route.
 *
 * These test the real POST handler's input validation — the logic that runs
 * BEFORE any AI calls happen. No API keys or mocks needed.
 */

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/channel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeMalformedRequest(): Request {
  return new Request('http://localhost:3000/api/channel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not json{{{',
  })
}

describe('POST /api/channel — input validation', () => {
  it('rejects malformed JSON with 400', async () => {
    const response = await POST(makeMalformedRequest())
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.status).toBe('error')
  })

  it('rejects empty body with 400', async () => {
    const response = await POST(makeRequest({}))
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.status).toBe('error')
    expect(data.synthesis).toContain('Missing required fields')
  })

  it('rejects missing messageType with 400', async () => {
    const response = await POST(
      makeRequest({
        coordinates: { raw: '1234-5678' },
        intention: 'test',
        sessionId: 'test-session',
      })
    )
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.status).toBe('error')
    expect(data.synthesis).toContain('Missing required fields')
  })

  it('rejects missing coordinates with 400', async () => {
    const response = await POST(
      makeRequest({
        messageType: 'cosmos',
        intention: 'test',
        sessionId: 'test-session',
      })
    )
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.status).toBe('error')
    expect(data.synthesis).toContain('Missing required fields')
  })

  it('rejects missing intention with 400', async () => {
    const response = await POST(
      makeRequest({
        messageType: 'cosmos',
        coordinates: { raw: '1234-5678' },
        sessionId: 'test-session',
      })
    )
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.status).toBe('error')
    expect(data.synthesis).toContain('Missing required fields')
  })

  it('rejects invalid messageType with 400', async () => {
    const response = await POST(
      makeRequest({
        messageType: 'invalid_type',
        coordinates: { raw: '1234-5678' },
        intention: 'test',
        sessionId: 'test-session',
      })
    )
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.synthesis).toContain('Invalid message type')
  })

  it('rejects intention longer than 250 characters with 400', async () => {
    const response = await POST(
      makeRequest({
        messageType: 'cosmos',
        coordinates: { raw: '1234-5678' },
        intention: 'x'.repeat(251),
        sessionId: 'test-session',
      })
    )
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.synthesis).toContain('250 characters')
  })

  it('rejects invalid coordinates (missing raw) with 400', async () => {
    const response = await POST(
      makeRequest({
        messageType: 'cosmos',
        coordinates: {},
        intention: 'test',
        sessionId: 'test-session',
      })
    )
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.synthesis).toContain('Invalid coordinates')
  })

  it('rejects non-string coordinates.raw with 400', async () => {
    const response = await POST(
      makeRequest({
        messageType: 'cosmos',
        coordinates: { raw: 12345 },
        intention: 'test',
        sessionId: 'test-session',
      })
    )
    expect(response.status).toBe(400)
  })

  it('rejects missing sessionId with 400', async () => {
    const response = await POST(
      makeRequest({
        messageType: 'cosmos',
        coordinates: { raw: '1234-5678' },
        intention: 'test',
      })
    )
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.synthesis).toContain('Missing required fields')
  })

  it('accepts exactly 250 character intention (boundary)', async () => {
    // This should pass validation and proceed to AI calls (which will fail without keys)
    // We just verify it does NOT return 400
    const response = await POST(
      makeRequest({
        messageType: 'cosmos',
        coordinates: { raw: '1234-5678' },
        intention: 'x'.repeat(250),
        sessionId: 'test-session',
      })
    )
    // Should not be a 400 validation error — it either succeeds or fails at AI layer (500)
    expect(response.status).not.toBe(400)
  })
})
