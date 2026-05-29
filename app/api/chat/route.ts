import { streamText, convertToModelMessages, createUIMessageStreamResponse, UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  const supabaseAuth = await createSupabaseClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: wardrobeItems } = await supabase
    .from('wardrobe_items')
    .select('name, brand, category, subcategory, color, color_family, occasion_tags, formality, season_tags, retailer')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  const wardrobeSummary = wardrobeItems && wardrobeItems.length > 0
    ? `The user's wardrobe contains ${wardrobeItems.length} items:\n${JSON.stringify(wardrobeItems, null, 2)}`
    : 'The user has not synced any wardrobe items yet.'

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `You are a personal stylist assistant for La Mise, an AI styling app for women who navigate wide formality ranges — board meetings and dinner at Nobu in the same day.

Your tone: direct, warm, precise. You know fashion. You don't explain basic things. You speak like a trusted stylist who knows this woman's wardrobe better than she does.

${wardrobeSummary}

When giving outfit recommendations:
- Reference specific items from the wardrobe by name
- Account for the occasion's formality, setting, and weather if given
- Offer one primary look and one alternative if relevant
- Keep it brief — this is a conversation, not a report

If the wardrobe is empty, suggest they set up email sync to build their catalog.`,
    messages: await convertToModelMessages(messages),
  })

  return createUIMessageStreamResponse({
    stream: result.toUIMessageStream(),
  })
}
