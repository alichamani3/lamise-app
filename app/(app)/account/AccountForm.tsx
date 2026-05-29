'use client'

import { useState } from 'react'
import type { Profile } from '@/types/database'

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

const labelStyle = {
  fontSize: '0.8125rem',
  color: 'var(--ink-muted)',
  marginBottom: '0.375rem',
  display: 'block',
}

export default function AccountForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [name, setName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } })

    if (error) { setError(error.message); setSaving(false); return }

    await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name }),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const forwardAddress = profile?.forward_slug
    ? `sync+${profile.forward_slug}@inbound.lamise.app`
    : '—'

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label style={labelStyle}>Email</label>
        <input style={{ ...inputStyle, color: 'var(--ink-muted)', cursor: 'not-allowed' }} value={email} readOnly />
      </div>

      <div>
        <label style={labelStyle}>Name</label>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
      </div>

      <div>
        <label style={labelStyle}>Your sync address</label>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--ink)',
          background: 'var(--accent-light)', padding: '0.75rem 1rem', borderRadius: '6px',
          wordBreak: 'break-all',
        }}>
          {forwardAddress}
        </p>
      </div>

      {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>}

      <button
        type="submit"
        disabled={saving}
        style={{
          background: 'var(--ink)', color: 'var(--parchment)', border: 'none',
          borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.9375rem',
          fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1, alignSelf: 'flex-start',
        }}
      >
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
      </button>
    </form>
  )
}
