import Anthropic from '@anthropic-ai/sdk'
import type { ParsedItem } from './parse-email'

const client = new Anthropic()

export async function tagPhotoItem(imageBase64: string, mimeType: string): Promise<Partial<ParsedItem> | null> {
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: imageBase64 },
          },
          {
            type: 'text',
            text: `Identify the clothing item or accessory in this photo and return structured JSON.

Return only this JSON shape, no prose:
{
  "name": "string (descriptive name, e.g. 'Wide-leg linen trousers')",
  "brand": "string or null (only if visible on item/tag)",
  "category": "tops|bottoms|dresses|outerwear|shoes|bags|accessories|activewear|swimwear|lingerie|other",
  "subcategory": "string or null (e.g. blazer, straight-leg jeans, loafers)",
  "color": "string (specific color)",
  "color_family": "black|white|grey|navy|blue|green|brown|beige|cream|red|pink|purple|orange|yellow|multi|print",
  "occasion_tags": ["work", "casual", "evening", "weekend", "travel", "gym"],
  "formality": "casual|smart_casual|business_casual|business|formal|black_tie",
  "season_tags": ["spring", "summer", "fall", "winter", "all_season"]
}

If this is not a clothing item or accessory, return null.`
          }
        ]
      }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    if (text.trim() === 'null') return null
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}
