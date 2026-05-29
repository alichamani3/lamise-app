export type WardrobeItem = {
  id: string
  user_id: string
  name: string
  brand: string | null
  category: string
  subcategory: string | null
  color: string | null
  color_family: string | null
  occasion_tags: string[]
  formality: 'casual' | 'smart_casual' | 'business_casual' | 'business' | 'formal' | 'black_tie'
  season_tags: string[]
  source: 'email_sync' | 'photo' | 'manual'
  retailer: string | null
  price_paid: number | null
  purchase_date: string | null
  image_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type EmailSync = {
  id: string
  user_id: string
  message_id: string
  from_address: string
  subject: string
  received_at: string
  retailer: string | null
  parsed_items: number
  raw_text: string | null
  created_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  forward_slug: string | null
  onboarding_complete: boolean
  created_at: string
}
