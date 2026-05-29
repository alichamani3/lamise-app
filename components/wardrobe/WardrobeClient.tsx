'use client'

import { useState, useMemo } from 'react'
import type { WardrobeItem } from '@/types/database'
import WardrobeGrid from './WardrobeGrid'

const CATEGORY_OPTIONS = ['all', 'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'bags', 'accessories', 'activewear', 'other']
const FORMALITY_OPTIONS = ['all', 'casual', 'smart_casual', 'business_casual', 'business', 'formal', 'black_tie']

export default function WardrobeClient({ items }: { items: WardrobeItem[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [formality, setFormality] = useState('all')

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchSearch = !search || [item.name, item.brand, item.color, item.subcategory, item.retailer]
        .filter(Boolean).some(v => v!.toLowerCase().includes(search.toLowerCase()))
      const matchCat = category === 'all' || item.category === category
      const matchForm = formality === 'all' || item.formality === formality
      return matchSearch && matchCat && matchForm
    })
  }, [items, search, category, formality])

  const chipStyle = (active: boolean): React.CSSProperties => ({
    fontSize: '0.8125rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    border: `1px solid ${active ? 'var(--ink)' : 'var(--border)'}`,
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--parchment)' : 'var(--ink-muted)',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.1s',
  })

  return (
    <div>
      {/* Search + filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, brand, color…"
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px',
            padding: '0.625rem 1rem', fontSize: '0.9375rem', color: 'var(--ink)', outline: 'none',
            width: '100%', maxWidth: '360px',
          }}
        />
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {CATEGORY_OPTIONS.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={chipStyle(category === c)}>
              {c === 'all' ? 'All categories' : c}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {FORMALITY_OPTIONS.map(f => (
            <button key={f} onClick={() => setFormality(f)} style={chipStyle(formality === f)}>
              {f === 'all' ? 'All formality' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem', padding: '2rem 0' }}>
          No items match your filters.
        </p>
      ) : (
        <>
          {filtered.length !== items.length && (
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Showing {filtered.length} of {items.length}
            </p>
          )}
          <WardrobeGrid items={filtered} />
        </>
      )}
    </div>
  )
}
