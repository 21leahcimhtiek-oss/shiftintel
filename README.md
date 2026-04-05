# ShiftIntel 🧠📅

> AI-driven workforce scheduling and shift intelligence for modern enterprises.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/21leahcimhtiek-oss/shiftintel)

## Overview

ShiftIntel eliminates the guesswork from workforce scheduling with GPT-4o-powered optimization, real-time coverage scoring, and predictive labor cost forecasting. Built for retail, healthcare, hospitality, and any shift-based operation.

**Pricing**: Starter $59/mo · Pro $149/mo · Enterprise $349/mo

## Features

- 🤖 **AI Schedule Generation** — GPT-4o optimizes shifts to minimize overtime while meeting coverage requirements
- 📊 **Labor Cost Forecasting** — 4-week projections with confidence intervals
- ✅ **Coverage Intelligence** — Real-time gap detection and coverage scoring (0-100%)
- 🗓️ **Time-Off Management** — Request, approve, and sync time-off with scheduling
- 🏢 **Multi-Department** — Separate rules, staffing levels, and reporting per department
- 📋 **Compliance Tracking** — Overtime alerts, break requirements, max hours enforcement
- 💳 **Stripe Billing** — Self-serve plans with usage-based limits

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Supabase Edge Functions |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4o |
| Payments | Stripe |
| Rate Limiting | Upstash Redis |
| Monitoring | Sentry |
| Deployment | Vercel |

## Quick Start

```bash
git clone https://github.com/21leahcimhtiek-oss/shiftintel
cd shiftintel
npm install
cp .env.example .env.local
# Fill in .env.local values
npm run dev
```

## Database Setup

```bash
# Run migration in Supabase SQL editor
supabase/migrations/001_initial_schema.sql
```

## Deployment

See [deploy/vercel-deploy.md](deploy/vercel-deploy.md) for full Vercel deployment guide.

## API Documentation

See [docs/api.md](docs/api.md) for full REST API reference.

## License

MIT — see [LICENSE](LICENSE)