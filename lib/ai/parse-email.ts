import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export type ParsedItem = {
  name: string
  brand: string | null
  category: string
  subcategory: string | null
  color: string | null
  color_family: string | null
  occasion_tags: string[]
  formality: 'casual' | 'smart_casual' | 'business_casual' | 'business' | 'formal' | 'black_tie'
  season_tags: string[]
  retailer: string
  price_paid: number | null
  purchase_date: string | null
}

export type ParsedEmail = {
  retailer: string
  order_date: string | null
  items: ParsedItem[]
}

export async function parseOrderEmail(
  subject: string,
  body: string,
  fromAddress: string
): Promise<ParsedEmail | null> {
  const prompt = `You are parsing a retail order confirmation email to extract clothing and accessory items for a personal wardrobe catalog.

Email subject: ${subject}
From: ${fromAddress}
Body:
${body.slice(0, 8000)}

Extract every clothing item, shoe, bag, or accessory ordered. For each item return structured data.

Respond with a JSON object matching this exact shape:
{
  "retailer": "string (brand/store name)",
  "order_date": "YYYY-MM-DD or null",
  "items": [
    {
      "name": "string (descriptive product name)",
      "brand": "string or null",
      "category": "tops|bottoms|dresses|outerwear|shoes|bags|accessories|activewear|swimwear|lingerie|other",
      "subcategory": "string or null (e.g. blazer, straight-leg jeans, loafers)",
      "color": "string or null (specific color from listing)",
      "color_family": "black|white|grey|navy|blue|green|brown|beige|cream|red|pink|purple|orange|yellow|multi|print",
      "occasion_tags": ["work", "casual", "evening", "weekend", "travel", "gym"],
      "formality": "casual|smart_casual|business_casual|business|formal|black_tie",
      "season_tags": ["spring", "summer", "fall", "winter", "all_season"],
      "retailer": "string",
      "price_paid": number or null,
      "purchase_date": "YYYY-MM-DD or null"
    }
  ]
}

If this is not a clothing/fashion order confirmation, return { "retailer": "", "order_date": null, "items": [] }.
Return only valid JSON, no prose.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0]) as ParsedEmail
    if (!parsed.items || parsed.items.length === 0) return null

    return parsed
  } catch {
    return null
  }
}
