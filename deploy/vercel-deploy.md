# Deploy ShiftIntel to Vercel

## Prerequisites
- Vercel account
- Supabase project
- Stripe account
- OpenAI API key
- Upstash Redis database

## Step 1: Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/migrations/001_initial_schema.sql`
3. Enable Email auth in Authentication → Providers
4. Copy: Project URL, Anon Key, Service Role Key

## Step 2: Stripe Setup

1. Create products in Stripe Dashboard:
   - Starter: $59/month recurring
   - Pro: $149/month recurring
   - Enterprise: $349/month recurring
2. Copy the Price IDs for each plan
3. Set up webhook: `https://your-app.vercel.app/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret

## Step 3: Upstash Redis

1. Create database at [upstash.com](https://upstash.com)
2. Copy REST URL and REST Token

## Step 4: Deploy to Vercel

```bash
npx vercel
```

Or click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/21leahcimhtiek-oss/shiftintel)

## Step 5: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
OPENAI_API_KEY=sk-...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
SENTRY_DSN=https://...@sentry.io/...
```

## Step 6: Verify Deployment

1. Visit `https://your-app.vercel.app` — landing page should load
2. Sign up → check email confirmation
3. Login → dashboard should show
4. Test Stripe: create checkout session

## Custom Domain

1. Vercel → Settings → Domains → Add domain
2. Update `NEXT_PUBLIC_APP_URL` env var
3. Update Stripe webhook URL