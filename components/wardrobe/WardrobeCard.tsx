'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WardrobeItem } from '@/types/database'
import Image from 'next/image'

const colorDotMap: Record<string, string> = {
  black: '#1A1814', white: '#F7F5F0', grey: '#9B9490', navy: '#1E2D4F',
  blue: '#4A6FA5', green: '#4A6741', brown: '#7C5C3E', beige: '#C4A882',
  cream: '#F0E8DC', red: '#B5382A', pink: '#D4849A', purple: '#7C5C9B',
  orange: '#C96B35', yellow: '#C9A835',
}

const formalityLabel: Record<WardrobeItem['formality'], string> = {
  casual: 'Casual', smart_casual: 'Smart casual', business_casual: 'Business casual',
  business: 'Business', formal: 'Formal', black_tie: 'Black tie',
}

export default function WardrobeCard({ item }: { item: WardrobeItem }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const colorStyle = item.color_family && colorDotMap[item.color_family]
    ? colorDotMap[item.color_family]
    : 'var(--border)'

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/wardrobe/${item.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div
      style={{ background: 'var(--surface)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}
      onMouseEnter={e => (e.currentTarget.querySelector('.delete-btn') as HTMLElement | null)?.style && ((e.currentTarget.querySelector('.delete-btn') as HTMLElement).style.opacity = '1')}
      onMouseLeave={() => { setShowConfirm(false) }}
    >
      {item.image_url && (
        <div style={{ marginBottom: '0.5rem', borderRadius: '4px', overflow: 'hidden', height: '140px', position: 'relative' }}>
          <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <p style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--ink)', lineHeight: 1.3, flex: 1 }}>
          {item.name}
        </p>
        <span style={{
          width: '12px', height: '12px', borderRadius: '50%',
          background: colorStyle, border: '1px solid var(--border)', flexShrink: 0, marginTop: '2px',
        }} />
      </div>

      {item.brand && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>{item.brand}</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', background: 'var(--accent-light)', borderRadius: '4px', padding: '0.125rem 0.375rem' }}>
          {item.subcategory || item.category}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>
          {formalityLabel[item.formality]}
        </span>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: 'auto', paddingTop: '0.25rem' }}>
        {item.retailer}{item.purchase_date ? ` · ${new Date(item.purchase_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}
        {item.source === 'manual' && !item.retailer ? 'Added manually' : ''}
      </p>

      {/* Delete */}
      {!showConfirm ? (
        <button
          className="delete-btn"
          onClick={() => setShowConfirm(true)}
          style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '4px', padding: '0.125rem 0.375rem',
            fontSize: '0.75rem', color: 'var(--ink-faint)', cursor: 'pointer',
            opacity: 0, transition: 'opacity 0.15s',
          }}
        >
          ×
        </button>
      ) : (
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: 'var(--error)', color: '#fff', border: 'none',
              borderRadius: '4px', padding: '0.125rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer',
            }}
          >
            {deleting ? '…' : 'Delete'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '4px', padding: '0.125rem 0.375rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--ink-muted)',
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
