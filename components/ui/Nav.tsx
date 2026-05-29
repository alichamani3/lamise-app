'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/wardrobe', label: 'Wardrobe' },
  { href: '/chat', label: 'Stylist' },
  { href: '/onboarding', label: 'Sync' },
  { href: '/syncs', label: 'History' },
  { href: '/account', label: 'Account' },
]

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/wardrobe'
      ? pathname === '/wardrobe' || pathname.startsWith('/wardrobe/')
      : pathname.startsWith(href)

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      padding: '0 2.5rem',
      height: '54px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(236,234,224,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link
        href="/wardrobe"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.1875rem',
          color: 'var(--ink)',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        La Mise
      </Link>

      <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontSize: '0.8125rem',
              color: isActive(href) ? 'var(--ink)' : 'var(--ink-faint)',
              textDecoration: 'none',
              fontWeight: isActive(href) ? 500 : 400,
              padding: '0.375rem 0.625rem',
              borderRadius: '6px',
              background: isActive(href) ? 'var(--surface)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.8125rem', color: 'var(--ink-faint)', padding: '0.375rem 0.625rem',
            borderRadius: '6px', transition: 'color 0.15s', marginLeft: '0.25rem',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-faint)')}
        >
          Sign out
        </button>
      </nav>
    </header>
  )
}
