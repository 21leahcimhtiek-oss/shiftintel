# ShiftIntel Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 14 App Router                    │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  App Shell   │  │  API Routes  │  │  Server Components│  │
│  │  (Client)    │  │  (REST API)  │  │  (Dashboard UI)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────┐  ┌──────────────┐  ┌───────────────────┐
│  Supabase Auth  │  │  OpenAI API  │  │   Upstash Redis   │
│  (JWT Sessions) │  │  (GPT-4o)    │  │  (Rate Limiting)  │
└────────┬────────┘  └──────────────┘  └───────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase PostgreSQL                          │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │  orgs    │  │employees │  │  shifts   │  │schedules  │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │time_off  │  │coverage_ │  │labor_costs│  │org_members│  │
│  │_requests │  │rules     │  │           │  │           │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Row Level Security (RLS)
All tables enforce org isolation at the database layer. Even if API security fails, users can never read another org's data.

### Server Components + API Routes
Dashboard pages use Server Components for initial data fetch (no loading spinners). API Routes handle mutations with full validation.

### AI Schedule Generation
GPT-4o receives a structured prompt with employees, coverage rules, and time-off in a single request. Response is validated and persisted to the DB. Rate-limited per user (10/min AI, 60/min API).

### Caching Strategy
- Server Components: Next.js cache with revalidation on mutation
- Client-side: SWR not used — prefer server components for simplicity
- Redis: Rate limiting only (not response caching)

## Data Flow: AI Schedule Generation

1. Manager selects period + departments + constraints
2. Frontend POSTs to `/api/schedules` → creates schedule record
3. Frontend POSTs to `/api/schedules/[id]/generate`
4. API fetches employees, coverage rules, approved time-off
5. Calls `generateSchedule()` → OpenAI GPT-4o
6. AI returns shift assignments + coverage score + warnings
7. Shifts inserted to DB, linked to schedule via schedule_shifts
8. Schedule stats (hours, cost, score) updated
9. Manager reviews + publishes