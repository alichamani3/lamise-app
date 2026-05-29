'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    const supabase = createClient()
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/wardrobe')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--parchment)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            La Mise
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Your wardrobe, figured out.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              color: 'var(--ink)',
              outline: 'none',
              width: '100%',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              color: 'var(--ink)',
              outline: 'none',
              width: '100%',
            }}
          />

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--ink)',
              color: 'var(--parchment)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: '0.5rem',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', textAlign: 'center', marginTop: '1.5rem' }}>
          No account?{' '}
          <Link href="/signup" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
