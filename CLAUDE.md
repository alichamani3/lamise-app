# La Mise — Platform

AI personal stylist app. Next.js 16 + Supabase + Claude API. Deployed on Vercel from `alichamani3/lamise-app`. The landing page is a separate repo (`alichamani3/lamise`) on Railway — leave it alone.

## Stack

```
Next.js 16 (App Router, Turbopack)
Supabase — auth, Postgres, storage
Claude API (Anthropic SDK + AI SDK v6)
Vercel — deployment
Postmark Inbound — email sync webhook
```

## Running locally

```bash
npm run dev
```

Requires `.env.local` with all five keys (see below). Copy from Vercel after wiring up Supabase:

```bash
vercel env pull .env.local
```

## ⚠️ Pickup checklist — do this before anything works

### 1. Supabase project

Create a new project at supabase.com. Then run `supabase-schema.sql` in the SQL editor (Supabase dashboard → SQL Editor → New query → paste → run). This creates:
- `profiles` — auto-created on signup via trigger, includes `forward_slug`
- `wardrobe_items` — the catalog
- `email_syncs` — inbound email log
- `chat_messages` — persisted chat history
- `wardrobe-photos` storage bucket + policies

### 2. Env vars in Vercel

Go to Vercel dashboard → lamise-app → Settings → Environment Variables. Replace all five placeholder values:

| Key | Where to find it |
|-----|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (secret) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `POSTMARK_INBOUND_TOKEN` | Set to any secret string for now; wire Postmark later |

After updating, redeploy:
```bash
vercel --prod
```

Or push to main — Vercel auto-deploys from GitHub.

### 3. Supabase auth settings

In Supabase dashboard → Authentication → URL Configuration:
- Site URL: your Vercel production URL
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

Turn off email confirmation for early testing (Authentication → Providers → Email → disable "Confirm email").

### 4. Postmark (email sync) — do this last

Email sync uses forward-to-inbox via Postmark Inbound:
1. Create a Postmark account, create an inbound server
2. Set the inbound webhook URL to: `https://your-app.vercel.app/api/email`
3. Add an `x-postmark-token` header with the value you set as `POSTMARK_INBOUND_TOKEN`
4. Use the Postmark inbound address as the forward target in Gmail filters

Users set up a Gmail filter forwarding retail order confirmations to `sync+{their_slug}@inbound.lamise.app`. Their slug is shown on `/onboarding` and `/account`, generated from their user ID via the DB trigger.

## Project structure

```
app/
  (auth)/           login, signup, forgot-password
  (app)/            auth-gated app routes
    wardrobe/       catalog + add + gap analysis
    chat/           stylist chat
    onboarding/     email sync setup
    syncs/          email sync history
    account/        profile settings
  api/
    chat/           streaming Claude stylist (AI SDK v6)
    email/          Postmark inbound webhook → parse → wardrobe
    gaps/           streaming gap analysis
    outfit-of-day/  single outfit recommendation
    upload/         photo upload → Supabase storage → Claude vision tag
    wardrobe/       CRUD (GET, POST, PATCH, DELETE)
    messages/       chat history persistence
    account/        profile update
  auth/callback/    Supabase session exchange
lib/
  supabase/         client, server, middleware helpers
  ai/               parse-email.ts, tag-photo.ts
components/
  chat/             ChatInterface (persistence, markdown)
  wardrobe/         WardrobeGrid, WardrobeCard, WardrobeClient (search/filter),
                    WardrobeStats, OutfitOfDay, GapAnalysisClient
  ui/               Nav
types/database.ts   WardrobeItem, EmailSync, Profile
proxy.ts            Route protection (Next.js 16 proxy convention)
supabase-schema.sql Run this in Supabase SQL editor on first setup
```

## AI SDK v6 notes

This project uses `ai@6.x` (not v3). Key differences:
- `useChat` is in `@ai-sdk/react`, not `ai`
- Messages use `parts` array, not `content` string
- Use `convertToModelMessages(messages)` (async) in route handlers
- Route handlers return `createUIMessageStreamResponse({ stream: result.toUIMessageStream() })`
- Use `isTextUIPart` to extract text from message parts
- `useChat` returns `sendMessage`, `status` — no `handleSubmit`/`input`

## Key decisions

- **Forward-to-inbox** (not Gmail OAuth) for email sync v1. Avoids Google's OAuth review process. User sets up one Gmail filter. Full OAuth is phase 2.
- **Supabase service role key** used server-side for all DB writes that bypass RLS (email webhook, chat). Auth-gated routes use the anon key via SSR client.
- **Chat history**: messages stored in `chat_messages` table, loaded on mount, saved after each completed response. Clear button in chat UI.
- **Forward slug**: generated from user UUID in the DB trigger (`lower(substring(replace(id::text, '-', ''), 1, 12))`). The onboarding page reads from DB — do not regenerate client-side.
