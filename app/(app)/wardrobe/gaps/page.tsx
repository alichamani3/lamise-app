import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import GapAnalysisClient from '@/components/wardrobe/GapAnalysisClient'
import type { WardrobeItem } from '@/types/database'

export default async function GapsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: items } = await service.from('wardrobe_items').select('*').eq('user_id', user.id)
  const wardrobeItems = (items ?? []) as WardrobeItem[]

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '0.5rem' }}>
          Gap analysis
        </h2>
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
          {wardrobeItems.length === 0
            ? 'Add items to your wardrobe first.'
            : `Based on ${wardrobeItems.length} items. What you're missing, what to prioritize, what to retire.`}
        </p>
      </div>
      <GapAnalysisClient empty={wardrobeItems.length === 0} />
    </div>
  )
}
