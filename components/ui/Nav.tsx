'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const linkStyle = (path: string) => ({
    fontSize: '0.875rem',
    color: pathname === path ? 'var(--ink)' : 'var(--ink-muted)',
    textDecoration: 'none',
    fontWeight: pathname === path ? 500 : 400,
    transition: 'color 0.15s',
  })

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--parchment)',
    }}>
      <Link href="/wardrobe" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
        La Mise
      </Link>

      <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link href="/wardrobe" style={linkStyle('/wardrobe')}>Wardrobe</Link>
        <Link href="/chat" style={linkStyle('/chat')}>Stylist</Link>
        <Link href="/onboarding" style={linkStyle('/onboarding')}>Sync</Link>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: 'var(--ink-muted)',
            padding: 0,
          }}
        >
          Sign out
        </button>
      </nav>
    </header>
  )
}
