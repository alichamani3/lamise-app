'use client'

import type { WardrobeItem } from '@/types/database'

const colorDotMap: Record<string, string> = {
  black: '#1A1814',
  white: '#F7F5F0',
  grey: '#9B9490',
  navy: '#1E2D4F',
  blue: '#4A6FA5',
  green: '#4A6741',
  brown: '#7C5C3E',
  beige: '#C4A882',
  cream: '#F0E8DC',
  red: '#B5382A',
  pink: '#D4849A',
  purple: '#7C5C9B',
  orange: '#C96B35',
  yellow: '#C9A835',
  multi: 'linear-gradient(135deg, #C4A882 0%, #4A6741 50%, #1A1814 100%)',
  print: 'repeating-linear-gradient(45deg, #C4A882, #C4A882 3px, #F0E8DC 3px, #F0E8DC 8px)',
}

const formalityLabel: Record<WardrobeItem['formality'], string> = {
  casual: 'Casual',
  smart_casual: 'Smart casual',
  business_casual: 'Business casual',
  business: 'Business',
  formal: 'Formal',
  black_tie: 'Black tie',
}

export default function WardrobeCard({ item }: { item: WardrobeItem }) {
  const colorStyle = item.color_family
    ? colorDotMap[item.color_family] || 'var(--border)'
    : 'var(--border)'

  const isGradient = colorStyle.includes('gradient')

  return (
    <div style={{
      background: 'var(--surface)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      cursor: 'default',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <p style={{
          fontWeight: 500,
          fontSize: '0.9375rem',
          color: 'var(--ink)',
          lineHeight: 1.3,
          flex: 1,
        }}>
          {item.name}
        </p>
        {item.color_family && (
          <span style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: isGradient ? colorStyle : colorStyle,
            border: '1px solid var(--border)',
            flexShrink: 0,
            marginTop: '2px',
          }} />
        )}
      </div>

      {item.brand && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>
          {item.brand}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--ink-muted)',
          background: 'var(--accent-light)',
          borderRadius: '4px',
          padding: '0.125rem 0.375rem',
        }}>
          {item.subcategory || item.category}
        </span>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--ink-faint)',
        }}>
          {formalityLabel[item.formality]}
        </span>
      </div>

      {item.retailer && (
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: 'auto', paddingTop: '0.25rem' }}>
          {item.retailer}{item.purchase_date ? ` · ${new Date(item.purchase_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}
        </p>
      )}
    </div>
  )
}
