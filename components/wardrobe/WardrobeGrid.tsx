'use client'

import type { WardrobeItem } from '@/types/database'
import WardrobeCard from './WardrobeCard'

export default function WardrobeGrid({ items }: { items: WardrobeItem[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '1px',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {items.map(item => (
        <WardrobeCard key={item.id} item={item} />
      ))}
    </div>
  )
}
