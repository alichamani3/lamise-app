import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import WardrobeGrid from '@/components/wardrobe/WardrobeGrid'
import Link from 'next/link'
import type { WardrobeItem } from '@/types/database'

export default async function WardrobePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: items } = await serviceClient
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const wardrobeItems = (items ?? []) as WardrobeItem[]

  const categoryCounts = wardrobeItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '0.25rem' }}>
            Wardrobe
          </h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem' }}>
            {wardrobeItems.length === 0
              ? 'No items synced yet'
              : `${wardrobeItems.length} item${wardrobeItems.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/onboarding"
          style={{
            fontSize: '0.875rem',
            color: 'var(--ink-muted)',
            textDecoration: 'none',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
          }}
        >
          + Sync email
        </Link>
      </div>

      {wardrobeItems.length === 0 ? (
        <div style={{
          border: '1px dashed var(--border)',
          borderRadius: '12px',
          padding: '5rem 2rem',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.75rem', fontWeight: 400 }}>
            Your catalog is empty
          </p>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem', marginBottom: '2rem', maxWidth: '360px', margin: '0 auto 2rem' }}>
            Set up email sync and your wardrobe builds itself from order confirmations — no manual entry.
          </p>
          <Link
            href="/onboarding"
            style={{
              background: 'var(--ink)',
              color: 'var(--parchment)',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
              fontSize: '0.9375rem',
              fontWeight: 500,
            }}
          >
            Set up email sync
          </Link>
        </div>
      ) : (
        <>
          {Object.keys(categoryCounts).length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <span key={cat} style={{
                  fontSize: '0.8125rem',
                  color: 'var(--ink-muted)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '0.25rem 0.75rem',
                }}>
                  {cat} ({count})
                </span>
              ))}
            </div>
          )}
          <WardrobeGrid items={wardrobeItems} />
        </>
      )}
    </div>
  )
}
