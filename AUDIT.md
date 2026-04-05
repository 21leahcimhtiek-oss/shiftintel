# Security Audit — ShiftIntel

## Authentication & Authorization
- [x] All dashboard routes protected by Supabase Auth middleware
- [x] API routes validate user session on every request
- [x] Row Level Security (RLS) enforced at database layer — users can only access their org's data
- [x] Service role key never exposed to client
- [x] JWT tokens validated server-side

## Data Security
- [x] All database queries use parameterized inputs via Supabase client
- [x] Input validation with Zod schemas on all API routes
- [x] PII (employee names, emails) stored in Supabase with encryption at rest
- [x] Hourly rates and cost data access restricted to admin/owner roles
- [x] HTTPS enforced in production via Vercel

## API Security
- [x] Rate limiting on all API routes via Upstash Redis
- [x] CORS headers restricted to app domain
- [x] Stripe webhook signature verification
- [x] API keys stored in environment variables, never in code

## Compliance
- [x] Stripe PCI compliance for payment processing
- [x] Supabase SOC 2 Type II infrastructure
- [x] Audit trail for shift status changes
- [x] Time-off approval audit log (who approved, when)

## Dependencies
- [x] npm audit run — 0 high severity vulnerabilities
- [x] Dependencies pinned with lockfile
- [x] Sentry error monitoring for security anomalies

## Pending (Enterprise)
- [ ] SSO / SAML integration
- [ ] HIPAA BAA for healthcare customers
- [ ] SOC 2 Type II audit for ShiftIntel product
- [ ] Pen test scheduled Q2 2024