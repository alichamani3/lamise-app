'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'bags', 'accessories', 'activewear', 'swimwear', 'lingerie', 'other']
const FORMALITYS = ['casual', 'smart_casual', 'business_casual', 'business', 'formal', 'black_tie']
const COLOR_FAMILIES = ['black', 'white', 'grey', 'navy', 'blue', 'green', 'brown', 'beige', 'cream', 'red', 'pink', 'purple', 'orange', 'yellow', 'multi', 'print']
const SEASONS = ['spring', 'summer', 'fall', 'winter', 'all_season']
const OCCASIONS = ['work', 'casual', 'evening', 'weekend', 'travel', 'gym']

const inputStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.625rem 0.875rem',
  fontSize: '0.9375rem',
  color: 'var(--ink)',
  outline: 'none',
  width: '100%',
}

const labelStyle = {
  fontSize: '0.8125rem',
  color: 'var(--ink-muted)',
  marginBottom: '0.375rem',
  display: 'block',
}

export default function AddItemPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '', brand: '', category: 'tops', subcategory: '',
    color: '', color_family: 'black', formality: 'casual',
    retailer: '', price_paid: '', purchase_date: '', notes: '',
    occasion_tags: [] as string[], season_tags: [] as string[],
    image_url: '',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function toggle(field: 'occasion_tags' | 'season_tags', val: string) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val],
    }))
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)

    if (json.url) {
      setForm(f => ({ ...f, image_url: json.url }))
    }
    if (json.tags) {
      setForm(f => ({
        ...f,
        name: json.tags.name || f.name,
        brand: json.tags.brand || f.brand,
        category: json.tags.category || f.category,
        subcategory: json.tags.subcategory || f.subcategory,
        color: json.tags.color || f.color,
        color_family: json.tags.color_family || f.color_family,
        formality: json.tags.formality || f.formality,
        occasion_tags: json.tags.occasion_tags?.length ? json.tags.occasion_tags : f.occasion_tags,
        season_tags: json.tags.season_tags?.length ? json.tags.season_tags : f.season_tags,
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)

    const body = {
      ...form,
      price_paid: form.price_paid ? parseFloat(form.price_paid) : null,
      purchase_date: form.purchase_date || null,
      subcategory: form.subcategory || null,
      brand: form.brand || null,
      color: form.color || null,
      retailer: form.retailer || null,
      notes: form.notes || null,
      image_url: form.image_url || null,
    }

    const res = await fetch('/api/wardrobe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (!res.ok) { setError('Failed to save item'); return }
    router.push('/wardrobe')
    router.refresh()
  }

  const chipStyle = (active: boolean) => ({
    fontSize: '0.8125rem',
    padding: '0.25rem 0.625rem',
    borderRadius: '20px',
    border: `1px solid ${active ? 'var(--ink)' : 'var(--border)'}`,
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--parchment)' : 'var(--ink-muted)',
    cursor: 'pointer',
    transition: 'all 0.1s',
  })

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '2rem' }}>
        Add item
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Photo upload */}
        <div>
          <label style={labelStyle}>Photo (optional — auto-tags the item)</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '1px dashed var(--border)', borderRadius: '8px', padding: '1.5rem',
              textAlign: 'center', cursor: 'pointer', position: 'relative', minHeight: '100px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {preview ? (
              <Image src={preview} alt="preview" width={120} height={120} style={{ objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
              <p style={{ color: 'var(--ink-faint)', fontSize: '0.875rem' }}>
                {uploading ? 'Uploading and tagging…' : 'Click to upload a photo'}
              </p>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        {/* Name */}
        <div>
          <label style={labelStyle}>Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Wide-leg trousers" required />
        </div>

        {/* Brand + Retailer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Brand</label>
            <input style={inputStyle} value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Aritzia" />
          </div>
          <div>
            <label style={labelStyle}>Retailer</label>
            <input style={inputStyle} value={form.retailer} onChange={e => setForm(f => ({ ...f, retailer: e.target.value }))} placeholder="Aritzia" />
          </div>
        </div>

        {/* Category + Subcategory */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={{ ...inputStyle, appearance: 'none' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Subcategory</label>
            <input style={inputStyle} value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} placeholder="Blazer" />
          </div>
        </div>

        {/* Color */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Color</label>
            <input style={inputStyle} value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="Camel" />
          </div>
          <div>
            <label style={labelStyle}>Color family</label>
            <select style={{ ...inputStyle, appearance: 'none' }} value={form.color_family} onChange={e => setForm(f => ({ ...f, color_family: e.target.value }))}>
              {COLOR_FAMILIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Formality */}
        <div>
          <label style={labelStyle}>Formality</label>
          <select style={{ ...inputStyle, appearance: 'none' }} value={form.formality} onChange={e => setForm(f => ({ ...f, formality: e.target.value }))}>
            {FORMALITYS.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
          </select>
        </div>

        {/* Occasions */}
        <div>
          <label style={labelStyle}>Occasions</label>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {OCCASIONS.map(o => (
              <button key={o} type="button" onClick={() => toggle('occasion_tags', o)} style={chipStyle(form.occasion_tags.includes(o))}>
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Seasons */}
        <div>
          <label style={labelStyle}>Seasons</label>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {SEASONS.map(s => (
              <button key={s} type="button" onClick={() => toggle('season_tags', s)} style={chipStyle(form.season_tags.includes(s))}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Price + Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Price paid</label>
            <input style={inputStyle} type="number" step="0.01" value={form.price_paid} onChange={e => setForm(f => ({ ...f, price_paid: e.target.value }))} placeholder="0.00" />
          </div>
          <div>
            <label style={labelStyle}>Purchase date</label>
            <input style={inputStyle} type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px', fontFamily: 'inherit', lineHeight: 1.5 }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Runs small, size up" />
        </div>

        {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={saving || uploading}
            style={{
              background: 'var(--ink)', color: 'var(--parchment)', border: 'none',
              borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '0.9375rem',
              fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save item'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '0.9375rem', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
