import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseOrderEmail } from '@/lib/ai/parse-email'

// Postmark inbound webhook
// Postmark sends POST to this endpoint when an email arrives at your inbound address
export async function POST(request: NextRequest) {
  const token = request.headers.get('x-postmark-token')
  if (token !== process.env.POSTMARK_INBOUND_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const fromFull = (body.From as string) || ''
  const toFull = (body.To as string) || ''
  const subject = (body.Subject as string) || ''
  const textBody = (body.TextBody as string) || (body.HtmlBody as string) || ''
  const messageId = (body.MessageID as string) || ''
  const dateString = (body.Date as string) || new Date().toISOString()

  // Extract user's forward address from the To field
  // Format: sync+{user_hash}@inbound.lamise.app
  const toMatch = toFull.match(/sync\+([a-z0-9]+)@/i)
  if (!toMatch) {
    return NextResponse.json({ error: 'No user identifier in To address' }, { status: 400 })
  }
  const forwardSlug = toMatch[1]

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('forward_slug', forwardSlug)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const userId = profile.id

  // Log the raw email
  await supabase.from('email_syncs').insert({
    user_id: userId,
    message_id: messageId,
    from_address: fromFull,
    subject,
    received_at: dateString,
    raw_text: textBody.slice(0, 10000),
    parsed_items: 0,
  })

  // Parse with Claude
  const parsed = await parseOrderEmail(subject, textBody, fromFull)
  if (!parsed || parsed.items.length === 0) {
    return NextResponse.json({ ok: true, items_added: 0 })
  }

  // Write items to wardrobe
  const itemsToInsert = parsed.items.map((item) => ({
    user_id: userId,
    name: item.name,
    brand: item.brand,
    category: item.category,
    subcategory: item.subcategory,
    color: item.color,
    color_family: item.color_family,
    occasion_tags: item.occasion_tags,
    formality: item.formality,
    season_tags: item.season_tags,
    source: 'email_sync' as const,
    retailer: parsed.retailer || item.retailer,
    price_paid: item.price_paid,
    purchase_date: item.purchase_date,
  }))

  const { error } = await supabase.from('wardrobe_items').insert(itemsToInsert)
  if (error) {
    console.error('Failed to insert wardrobe items:', error)
    return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
  }

  // Update parsed_items count on the email sync record
  await supabase
    .from('email_syncs')
    .update({ parsed_items: parsed.items.length, retailer: parsed.retailer })
    .eq('message_id', messageId)
    .eq('user_id', userId)

  return NextResponse.json({ ok: true, items_added: parsed.items.length })
}
