# Security Fixes Implementation

## 1. ENABLE RLS POLICIES (Critical)

Run this SQL in Supabase SQL Editor:
```bash
cat lib/db/rls-policies.sql | pbcopy
```
Then paste in Supabase Console > SQL Editor > Run

**What it does:** Enables Row Level Security on 12 tables and creates proper access policies.

## 2. ADD RATE LIMITING

Update your API routes:

```typescript
// example: app/api/images/route.ts
import { withRateLimit } from '@/app/api/middleware/rate-limit-route';

export const GET = (req: NextRequest) => withRateLimit(async (req) => {
  // your handler
  return NextResponse.json({ data });
}, req);
```

## 3. INITIALIZE ERROR MONITORING

Update `app/layout.tsx`:
```typescript
import { initErrorMonitoring } from '@/lib/services/error-monitoring';

// Call once on app startup
if (typeof window === 'undefined') {
  initErrorMonitoring();
}
```

## Environment Variables Required

Add to `.env`:
```
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
SENTRY_DSN=your_dsn
```

## Verification

- RLS: Check Supabase console - each table shows "RLS Enabled: true"
- Rate Limiting: Hit API 101+ times from same IP - should get 429
- Error Monitoring: Errors automatically sent to Sentry dashboard
