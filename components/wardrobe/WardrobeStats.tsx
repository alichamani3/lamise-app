import type { WardrobeItem } from '@/types/database'

function topN<T extends string>(arr: T[], n: number): { value: T; count: number }[] {
  const counts = arr.reduce<Record<string, number>>((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc }, {})
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([value, count]) => ({ value: value as T, count }))
}

export default function WardrobeStats({ items }: { items: WardrobeItem[] }) {
  if (items.length < 3) return null

  const totalValue = items.reduce((sum, i) => sum + (i.price_paid ?? 0), 0)
  const itemsWithPrice = items.filter(i => i.price_paid)
  const avgPrice = itemsWithPrice.length ? totalValue / itemsWithPrice.length : 0

  const topCategories = topN(items.map(i => i.category), 3)
  const topBrands = topN(items.filter(i => i.brand).map(i => i.brand!), 3)

  const formalityDist = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.formality] = (acc[i.formality] || 0) + 1
    return acc
  }, {})
  const workReady = ((formalityDist['business'] || 0) + (formalityDist['business_casual'] || 0) + (formalityDist['formal'] || 0)) / items.length

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '1px',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '2rem',
    }}>
      {[
        {
          label: 'Items',
          value: items.length.toString(),
          sub: `${topCategories[0]?.value ?? '—'} is most`,
        },
        ...(totalValue > 0 ? [{
          label: 'Catalog value',
          value: `$${Math.round(totalValue).toLocaleString()}`,
          sub: `~$${Math.round(avgPrice)} avg`,
        }] : []),
        {
          label: 'Work-ready',
          value: `${Math.round(workReady * 100)}%`,
          sub: 'business or formal',
        },
        ...(topBrands.length > 0 ? [{
          label: 'Top brand',
          value: topBrands[0].value,
          sub: `${topBrands[0].count} items`,
        }] : []),
        {
          label: 'Top category',
          value: topCategories[0]?.value ?? '—',
          sub: `${topCategories[0]?.count ?? 0} of ${items.length}`,
        },
      ].map(stat => (
        <div key={stat.label} style={{ padding: '1.25rem 1.5rem', background: 'var(--surface)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>
            {stat.label}
          </p>
          <p style={{ fontSize: '1.375rem', fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            {stat.value}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{stat.sub}</p>
        </div>
      ))}
    </div>
  )
}
