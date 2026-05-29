import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const supabaseAuth = await createSupabaseClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { occasion, date } = await request.json().catch(() => ({ occasion: null, date: null }))

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: items } = await supabase
    .from('wardrobe_items')
    .select('id, name, brand, category, subcategory, color, color_family, formality, season_tags, occasion_tags, image_url')
    .eq('user_id', user.id)

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No wardrobe items' }, { status: 400 })
  }

  const today = date || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are a personal stylist. Build one complete outfit from this wardrobe for ${occasion || 'today'} (${today}).

Wardrobe:
${JSON.stringify(items, null, 2)}

Return JSON only, this exact shape:
{
  "headline": "string (5-8 words, e.g. 'Sharp enough for a board meeting')",
  "occasion": "string (what this works for)",
  "items": [
    {
      "id": "uuid from wardrobe",
      "name": "item name",
      "role": "string (e.g. 'Foundation', 'Layer', 'Footwear', 'Bag', 'Accessory')"
    }
  ],
  "styling_note": "string (1-2 sentences on how to wear it, any key details)",
  "why_it_works": "string (1 sentence)"
}`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return NextResponse.json({ error: 'Failed to generate outfit' }, { status: 500 })

  const outfit = JSON.parse(jsonMatch[0])
  // Attach image_urls from matched items
  outfit.items = outfit.items.map((oi: { id: string; name: string; role: string }) => {
    const match = items.find(i => i.id === oi.id)
    return { ...oi, image_url: match?.image_url ?? null, color_family: match?.color_family ?? null }
  })

  return NextResponse.json(outfit)
}
