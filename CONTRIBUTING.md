# Contributing to ShiftIntel

## Development Setup

```bash
git clone https://github.com/21leahcimhtiek-oss/shiftintel
cd shiftintel
npm install
cp .env.example .env.local
# Configure your local Supabase and other env vars
npm run dev
```

## Code Standards
- TypeScript strict mode — no `any` types
- All API routes must include Zod input validation
- New DB queries must respect RLS (use org_id filter)
- Components: functional, typed props, no inline styles

## Testing
```bash
npm test          # unit tests
npm run test:e2e  # Playwright E2E
npm run type-check
npm run lint
```

## Pull Request Process
1. Branch from `main` with descriptive name (`feat/coverage-alerts`, `fix/shift-overlap`)
2. Write tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from a maintainer