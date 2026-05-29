import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export default async function SyncsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: syncs } = await service
    .from('email_syncs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '0.25rem' }}>
          Sync history
        </h2>
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem' }}>
          Every order confirmation email received and parsed.
        </p>
      </div>

      {!syncs || syncs.length === 0 ? (
        <div style={{ border: '1px dashed var(--border)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem' }}>No emails synced yet.</p>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Set up email forwarding in the Sync tab to get started.
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {syncs.map((sync, i) => (
            <div key={sync.id} style={{
              padding: '1rem 1.25rem',
              borderBottom: i < syncs.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.9375rem', color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sync.subject || '(no subject)'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', marginTop: '0.125rem' }}>
                  {sync.from_address}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                {sync.parsed_items > 0 ? (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--ink)', background: 'var(--accent-light)', borderRadius: '20px', padding: '0.125rem 0.625rem' }}>
                    {sync.parsed_items} item{sync.parsed_items !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--ink-faint)' }}>not a fashion order</span>
                )}
                <span style={{ fontSize: '0.8125rem', color: 'var(--ink-faint)' }}>
                  {new Date(sync.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
