'use client'

import { useState } from 'react'

type OutfitItem = {
  id: string
  name: string
  role: string
  image_url: string | null
  color_family: string | null
}

type Outfit = {
  headline: string
  occasion: string
  items: OutfitItem[]
  styling_note: string
  why_it_works: string
}

const colorMap: Record<string, string> = {
  black: '#1A1814', white: '#F0EDE6', grey: '#9B9490', navy: '#1E2D4F',
  blue: '#4A6FA5', green: '#4A6741', brown: '#7C5C3E', beige: '#C4A882',
  cream: '#F0E8DC', red: '#B5382A', pink: '#D4849A', purple: '#7C5C9B',
  orange: '#C96B35', yellow: '#C9A835',
}

const OCCASION_OPTIONS = [
  'today — whatever comes up',
  'board meeting or investor pitch',
  'client dinner',
  'first day at a new job',
  'weekend in the city',
  'long travel day',
]

export default function OutfitOfDay({ hasItems }: { hasItems: boolean }) {
  const [outfit, setOutfit] = useState<Outfit | null>(null)
  const [loading, setLoading] = useState(false)
  const [occasion, setOccasion] = useState(OCCASION_OPTIONS[0])
  const [showOptions, setShowOptions] = useState(false)

  async function generate() {
    if (!hasItems || loading) return
    setLoading(true)
    setOutfit(null)

    const res = await fetch('/api/outfit-of-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ occasion }),
    })

    if (res.ok) {
      const data = await res.json()
      setOutfit(data)
    }
    setLoading(false)
  }

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: '12px',
      overflow: 'hidden', marginBottom: '2rem',
    }}>
      <div style={{
        padding: '1.25rem 1.5rem',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: outfit ? '1px solid var(--border)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--ink)' }}>
            Outfit suggestion
          </p>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowOptions(!showOptions)}
              style={{
                fontSize: '0.8125rem', color: 'var(--ink-muted)',
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: '20px', padding: '0.2rem 0.625rem', cursor: 'pointer',
              }}
            >
              {occasion} ▾
            </button>
            {showOptions && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: '0.25rem',
                background: 'var(--parchment)', border: '1px solid var(--border)',
                borderRadius: '8px', overflow: 'hidden', minWidth: '220px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}>
                {OCCASION_OPTIONS.map(o => (
                  <button
                    key={o}
                    onClick={() => { setOccasion(o); setShowOptions(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '0.625rem 1rem', fontSize: '0.875rem',
                      color: o === occasion ? 'var(--ink)' : 'var(--ink-muted)',
                      background: o === occasion ? 'var(--accent-light)' : 'transparent',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || !hasItems}
          style={{
            background: outfit ? 'transparent' : 'var(--ink)',
            color: outfit ? 'var(--ink-muted)' : 'var(--parchment)',
            border: outfit ? '1px solid var(--border)' : 'none',
            borderRadius: '6px', padding: '0.4rem 0.875rem',
            fontSize: '0.8125rem', fontWeight: 500,
            cursor: loading || !hasItems ? 'not-allowed' : 'pointer',
            opacity: loading || !hasItems ? 0.5 : 1,
          }}
        >
          {loading ? 'Building…' : outfit ? 'Regenerate' : 'Build outfit'}
        </button>
      </div>

      {loading && !outfit && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.875rem' }}>Pulling from your wardrobe…</p>
        </div>
      )}

      {outfit && (
        <div style={{ padding: '1.5rem' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', color: 'var(--ink)', marginBottom: '0.25rem', fontWeight: 400 }}>
            {outfit.headline}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
            {outfit.occasion}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {outfit.items.map(item => (
              <div key={item.id} style={{
                background: 'var(--parchment)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '0.75rem 1rem',
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                minWidth: '160px',
              }}>
                <span style={{
                  width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                  background: item.color_family && colorMap[item.color_family] ? colorMap[item.color_family] : 'var(--border)',
                  border: '1px solid var(--border)',
                }} />
                <div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2 }}>{item.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>{item.role}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: '0.5rem' }}>
            {outfit.styling_note}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
            {outfit.why_it_works}
          </p>
        </div>
      )}
    </div>
  )
}
