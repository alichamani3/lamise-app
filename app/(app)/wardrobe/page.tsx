import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import WardrobeClient from '@/components/wardrobe/WardrobeClient'
import WardrobeStats from '@/components/wardrobe/WardrobeStats'
import OutfitOfDay from '@/components/wardrobe/OutfitOfDay'
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
  const hasItems = wardrobeItems.length > 0

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '0.25rem' }}>
            Wardrobe
          </h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem' }}>
            {wardrobeItems.length === 0 ? 'No items yet' : `${wardrobeItems.length} item${wardrobeItems.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          {hasItems && (
            <Link
              href="/wardrobe/gaps"
              style={{
                fontSize: '0.875rem', color: 'var(--ink-muted)', textDecoration: 'none',
                border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.875rem',
                transition: 'color 0.15s',
              }}
            >
              Gap analysis
            </Link>
          )}
          <Link
            href="/wardrobe/add"
            style={{
              fontSize: '0.875rem', color: 'var(--parchment)', textDecoration: 'none',
              background: 'var(--ink)', borderRadius: '6px', padding: '0.4rem 0.875rem',
            }}
          >
            + Add item
          </Link>
          <Link
            href="/onboarding"
            style={{
              fontSize: '0.875rem', color: 'var(--ink-muted)', textDecoration: 'none',
              border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.875rem',
            }}
          >
            Sync email
          </Link>
        </div>
      </div>

      {!hasItems ? (
        <div style={{ border: '1px dashed var(--border)', borderRadius: '12px', padding: '5rem 2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.625rem', color: 'var(--ink)', marginBottom: '0.75rem', fontWeight: 400 }}>
            Your catalog is empty
          </p>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem', maxWidth: '380px', margin: '0 auto 2rem', lineHeight: 1.65 }}>
            Set up email sync and your wardrobe builds itself from order confirmations, or add the first item manually.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link href="/onboarding" style={{ background: 'var(--ink)', color: 'var(--parchment)', borderRadius: '8px', padding: '0.75rem 1.5rem', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
              Set up email sync
            </Link>
            <Link href="/wardrobe/add" style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem 1.5rem', textDecoration: 'none', fontSize: '0.9375rem' }}>
              Add manually
            </Link>
          </div>
        </div>
      ) : (
        <>
          <WardrobeStats items={wardrobeItems} />
          <OutfitOfDay hasItems={hasItems} />
          <WardrobeClient items={wardrobeItems} />
        </>
      )}
    </div>
  )
}
