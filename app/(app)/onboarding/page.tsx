import { createClient } from '@/lib/supabase/server'

function generateForwardSlug(userId: string): string {
  return userId.replace(/-/g, '').slice(0, 12).toLowerCase()
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const slug = generateForwardSlug(user.id)
  const forwardAddress = `sync+${slug}@inbound.lamise.app`

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '0.75rem', fontWeight: 400 }}>
        Connect your wardrobe
      </h2>
      <p style={{ color: 'var(--ink-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '3rem' }}>
        La Mise builds your catalog automatically from order confirmation emails. Set up one Gmail filter and your wardrobe populates itself — every Aritzia pickup, every Nordstrom run, every Reformation order.
      </p>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2.5rem',
      }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Your sync address
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9375rem',
          color: 'var(--ink)',
          background: 'var(--accent-light)',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          wordBreak: 'break-all',
        }}>
          {forwardAddress}
        </p>
      </div>

      <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {[
          {
            step: '01',
            title: 'Open Gmail filters',
            body: 'Go to Gmail → Settings → See all settings → Filters and Blocked Addresses → Create a new filter.',
          },
          {
            step: '02',
            title: 'Set the filter criteria',
            body: 'In the "From" field, paste this to catch the major retailers:',
            code: 'from:(@aritzia.com OR @zara.com OR @nordstrom.com OR @thereformation.com OR @alo.com OR @lululemon.com OR @net-a-porter.com OR @matchesfashion.com OR @farfetch.com)',
          },
          {
            step: '03',
            title: 'Forward to La Mise',
            body: 'Choose "Forward it to" and enter your sync address above. Add the address to Gmail\'s allowed forwarders if prompted.',
            code: forwardAddress,
          },
          {
            step: '04',
            title: 'Done',
            body: 'Every order confirmation from those retailers will now sync automatically. New purchases show up in your wardrobe within minutes.',
          },
        ].map(({ step, title, body, code }) => (
          <li key={step} style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              color: 'var(--ink-faint)',
              lineHeight: 1,
              flexShrink: 0,
              paddingTop: '0.125rem',
            }}>
              {step}
            </span>
            <div>
              <p style={{ fontWeight: 500, color: 'var(--ink)', marginBottom: '0.375rem' }}>{title}</p>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem', lineHeight: 1.65 }}>{body}</p>
              {code && (
                <pre style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--ink)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  marginTop: '0.75rem',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {code}
                </pre>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
