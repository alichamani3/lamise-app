import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabaseAuth = await createSupabaseClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { focus } = await request.json().catch(() => ({ focus: null }))

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: items } = await supabase
    .from('wardrobe_items')
    .select('name, brand, category, subcategory, color, color_family, formality, season_tags, occasion_tags, retailer, price_paid')
    .eq('user_id', user.id)

  if (!items || items.length === 0) {
    return new Response('No wardrobe items found', { status: 400 })
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `You are an expert personal stylist performing a wardrobe gap analysis for a professional woman. Your audience is discerning and busy. Be specific, confident, and direct. No filler.`,
    prompt: `Analyze this wardrobe and identify the gaps. The woman this belongs to navigates a wide formality range — board meetings, client dinners, weekend travel, casual days. She is likely in tech, finance, healthcare, or creative industries in a major city.

Wardrobe (${items.length} items):
${JSON.stringify(items, null, 2)}

${focus ? `She specifically asked about: ${focus}` : ''}

Provide a gap analysis structured as:

## What's well covered
2-3 sentences on what's strong in this wardrobe.

## Critical gaps
For each gap: name it, explain why it matters for her life, and give 1-2 specific product suggestions (brand + item name). Prioritize gaps that affect multiple occasions. Format each as:

**[Gap name]**
Why it matters: [one sentence]
Recommendation: [specific item, e.g. "Totême straight-leg trouser in camel or navy"]

## Quick wins under $200
2-3 specific, affordable items that would have outsized impact on wardrobe versatility.

## What to consider retiring
Any items that seem redundant, dated, or poorly integrated based on what else is in the wardrobe.`,
  })

  return result.toTextStreamResponse()
}
