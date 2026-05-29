'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isTextUIPart, type UIMessage } from 'ai'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const SUGGESTIONS = [
  'What do I wear to a board presentation today?',
  'Put together a Nobu dinner look.',
  'I need a travel outfit — meetings in the morning, dinner at night.',
  'What\'s the most versatile piece in my wardrobe?',
]

function getTextContent(m: UIMessage): string {
  return m.parts.filter(isTextUIPart).map(p => p.text).join('')
}

export default function ChatInterface() {
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const [input, setInput] = useState('')
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isLoading = status === 'streaming' || status === 'submitted'
  const prevStatusRef = useRef(status)

  // Load persisted messages on mount
  useEffect(() => {
    fetch('/api/messages')
      .then(r => r.json())
      .then((rows: { id: string; role: string; content: string }[]) => {
        if (!rows?.length) { setHistoryLoaded(true); return }
        const uiMessages: UIMessage[] = rows.map(r => ({
          id: r.id,
          role: r.role as 'user' | 'assistant',
          parts: [{ type: 'text' as const, text: r.content }],
        }))
        setMessages(uiMessages)
        setHistoryLoaded(true)
      })
      .catch(() => setHistoryLoaded(true))
  }, [setMessages])

  // Save messages after each completed response
  useEffect(() => {
    if (prevStatusRef.current !== 'ready' && status === 'ready' && messages.length > 0) {
      const rows = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ id: m.id, role: m.role, content: getTextContent(m) }))
        .filter(m => m.content)
      if (rows.length) {
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: rows }),
        }).catch(() => {})
      }
    }
    prevStatusRef.current = status
  }, [status, messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function submit() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage({ role: 'user', parts: [{ type: 'text', text }] })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  async function clearHistory() {
    await fetch('/api/messages', { method: 'DELETE' })
    setMessages([])
  }

  if (!historyLoaded) {
    return (
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.875rem' }}>Loading…</p>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '720px', margin: '0 auto', padding: '0 2rem',
      height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column',
    }}>
      {messages.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '0.5rem' }}>
              What are you dressing for?
            </h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem' }}>
              Tell me the occasion and I'll pull from your wardrobe.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setInput(s); inputRef.current?.focus() }}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '0.875rem 1.25rem', textAlign: 'left',
                  fontSize: '0.9375rem', color: 'var(--ink-muted)', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink-faint)'; e.currentTarget.style.color = 'var(--ink)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink-muted)' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={clearHistory}
              style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Clear conversation
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map(m => {
              const text = getTextContent(m)
              if (!text && m.role !== 'user') return null
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%',
                    background: m.role === 'user' ? 'var(--ink)' : 'var(--surface)',
                    color: m.role === 'user' ? 'var(--parchment)' : 'var(--ink)',
                    border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                    padding: '0.875rem 1.125rem',
                    fontSize: '0.9375rem',
                    lineHeight: 1.65,
                  }}>
                    {m.role === 'user' ? (
                      <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p style={{ margin: '0.25rem 0' }}>{children}</p>,
                          strong: ({ children }) => <strong style={{ fontWeight: 600, color: 'var(--ink)' }}>{children}</strong>,
                          ul: ({ children }) => <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }}>{children}</ol>,
                          li: ({ children }) => <li style={{ margin: '0.2rem 0' }}>{children}</li>,
                          h3: ({ children }) => <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1rem', margin: '0.75rem 0 0.25rem' }}>{children}</h3>,
                        }}
                      >
                        {text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              )
            })}
            {isLoading && (
              <div style={{ display: 'flex' }}>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '4px 18px 18px 18px', padding: '0.875rem 1.125rem',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: 'var(--ink-faint)', animation: 'pulse 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </>
      )}

      <div style={{ padding: '0.875rem 0 1.5rem', borderTop: messages.length > 0 ? '1px solid var(--border)' : 'none' }}>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your schedule today?"
            rows={1}
            style={{
              flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.9375rem',
              color: 'var(--ink)', outline: 'none', resize: 'none', lineHeight: 1.5,
              maxHeight: '120px', overflowY: 'auto', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--ink-faint)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
          <button
            onClick={submit}
            disabled={isLoading || !input.trim()}
            style={{
              background: 'var(--ink)', color: 'var(--parchment)', border: 'none',
              borderRadius: '12px', padding: '0.75rem 1.25rem', fontSize: '0.875rem',
              fontWeight: 500, cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !input.trim() ? 0.35 : 1, transition: 'opacity 0.15s', flexShrink: 0,
            }}
          >
            Send
          </button>
        </div>
        <p style={{ fontSize: '0.6875rem', color: 'var(--ink-faint)', marginTop: '0.4rem', textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}
