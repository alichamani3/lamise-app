'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isTextUIPart } from 'ai'
import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  'What do I wear to a board presentation today?',
  'Put together a Nobu dinner look.',
  'I need a travel outfit — meetings in the morning, dinner at night.',
  'What\'s the most versatile piece in my wardrobe?',
]

export default function ChatInterface() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function submit() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage({ role: 'user', parts: [{ type: 'text', text }] })
  }

  function handleSuggestion(text: string) {
    setInput(text)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '0 2rem',
      height: 'calc(100vh - 56px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {messages.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '0.5rem' }}>
              What are you dressing for?
            </h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem' }}>
              Tell me the occasion and I'll pull from your wardrobe.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.875rem 1.25rem',
                  textAlign: 'left',
                  fontSize: '0.9375rem',
                  color: 'var(--ink-muted)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget).style.borderColor = 'var(--ink-faint)'
                  ;(e.currentTarget).style.color = 'var(--ink)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget).style.borderColor = 'var(--border)'
                  ;(e.currentTarget).style.color = 'var(--ink-muted)'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map(m => {
            const textContent = m.parts
              .filter(isTextUIPart)
              .map(p => p.text)
              .join('')

            if (!textContent && m.role !== 'user') return null

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  background: m.role === 'user' ? 'var(--ink)' : 'var(--surface)',
                  color: m.role === 'user' ? 'var(--parchment)' : 'var(--ink)',
                  border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  padding: '0.875rem 1.25rem',
                  fontSize: '0.9375rem',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}>
                  {textContent}
                </div>
              </div>
            )
          })}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px 16px 16px 16px',
                padding: '0.875rem 1.25rem',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--ink-faint)',
                    animation: 'pulse 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div style={{
        padding: '1rem 0 1.5rem',
        borderTop: messages.length > 0 ? '1px solid var(--border)' : 'none',
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your schedule today?"
            rows={1}
            style={{
              flex: 1,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              color: 'var(--ink)',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.5,
              maxHeight: '120px',
              overflowY: 'auto',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={submit}
            disabled={isLoading || !input.trim()}
            style={{
              background: 'var(--ink)',
              color: 'var(--parchment)',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !input.trim() ? 0.4 : 1,
              transition: 'opacity 0.15s',
              flexShrink: 0,
            }}
          >
            Send
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: '0.5rem', textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
