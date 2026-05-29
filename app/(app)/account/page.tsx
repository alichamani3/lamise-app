import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import AccountForm from './AccountForm'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: profile } = await service.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '2rem' }}>
        Account
      </h2>
      <AccountForm profile={profile} email={user.email ?? ''} />
    </div>
  )
}
