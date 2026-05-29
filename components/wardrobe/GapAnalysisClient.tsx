'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const FOCUS_OPTIONS = [
  { label: 'Everything', value: '' },
  { label: 'Work & meetings', value: 'work and professional occasions' },
  { label: 'Evening & events', value: 'evening and social events' },
  { label: 'Weekend & casual', value: 'weekend and casual occasions' },
  { label: 'Travel', value: 'travel and packing versatility' },
]

export default function GapAnalysisClient({ empty }: { empty: boolean }) {
  const [focus, setFocus] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function analyze() {
    if (empty || loading) return
    setResult('')
    setLoading(true)

    const res = await fetch('/api/gaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focus }),
    })

    if (!res.ok || !res.body) { setLoading(false); return }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let done = false
    while (!done) {
      const { value, done: d } = await reader.read()
      done = d
      if (value) setResult(prev => prev + decoder.decode(value, { stream: !done }))
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Focus selector */}
      <div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', marginBottom: '0.625rem' }}>Focus on</p>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {FOCUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFocus(opt.value)}
              style={{
                fontSize: '0.875rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '20px',
                border: `1px solid ${focus === opt.value ? 'var(--ink)' : 'var(--border)'}`,
                background: focus === opt.value ? 'var(--ink)' : 'transparent',
                color: focus === opt.value ? 'var(--parchment)' : 'var(--ink-muted)',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={analyze}
        disabled={loading || empty}
        style={{
          background: 'var(--ink)', color: 'var(--parchment)', border: 'none',
          borderRadius: '8px', padding: '0.875rem 1.75rem', fontSize: '0.9375rem',
          fontWeight: 500, cursor: loading || empty ? 'not-allowed' : 'pointer',
          opacity: loading || empty ? 0.5 : 1, alignSelf: 'flex-start',
          transition: 'opacity 0.15s',
        }}
      >
        {loading ? 'Analyzing…' : result ? 'Re-analyze' : 'Analyze my wardrobe'}
      </button>

      {/* Streaming result */}
      {(result || loading) && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '2rem',
        }}>
          {loading && !result && (
            <p style={{ color: 'var(--ink-faint)', fontSize: '0.9375rem' }}>Reviewing your wardrobe…</p>
          )}
          <div style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--ink)' }}>
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 400, color: 'var(--ink)', margin: '1.5rem 0 0.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                    {children}
                  </h2>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: 600, color: 'var(--ink)', display: 'block', marginTop: '1rem' }}>{children}</strong>
                ),
                p: ({ children }) => (
                  <p style={{ margin: '0.375rem 0', color: 'var(--ink-muted)' }}>{children}</p>
                ),
                ul: ({ children }) => (
                  <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }}>{children}</ul>
                ),
                li: ({ children }) => (
                  <li style={{ margin: '0.25rem 0', color: 'var(--ink-muted)' }}>{children}</li>
                ),
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
          {loading && (
            <span style={{ display: 'inline-block', width: '2px', height: '1em', background: 'var(--ink)', marginLeft: '2px', verticalAlign: 'text-bottom', animation: 'blink 1s step-end infinite' }} />
          )}
        </div>
      )}

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  )
}
