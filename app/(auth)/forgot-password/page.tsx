'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.9375rem',
    color: 'var(--ink)',
    outline: 'none',
    width: '100%',
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--parchment)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            La Mise
          </h1>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--ink)', fontWeight: 500, marginBottom: '0.5rem' }}>Check your email</p>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
              We sent a reset link to {email}.
            </p>
            <Link href="/login" style={{ color: 'var(--ink)', fontSize: '0.875rem' }}>Back to sign in</Link>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Enter your email and we'll send a reset link.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
              {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'var(--ink)', color: 'var(--parchment)', border: 'none',
                  borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.9375rem',
                  fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1, marginTop: '0.5rem',
                }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', textAlign: 'center', marginTop: '1.5rem' }}>
              <Link href="/login" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
