# Security Policy

## Production Readiness Checklist

### ✅ Completed Security Measures

#### 1. Database Security
- **Row Level Security (RLS)**: Currently **DISABLED** on all tables
  - ⚠️ **CRITICAL**: Enable RLS policies before production deployment
  - See `scripts/enable-rls.sql` for implementation
  - All tables (images, orders, profiles, etc.) need policies

#### 2. Authentication & Authorization
- Supabase Auth integration configured
- Middleware protecting admin routes
- Email verification required for signups
- Session management via secure cookies
- Admin access restricted to verified emails

#### 3. Environment Variables
**Required Production Variables:**
\`\`\`
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (auto-configured by Supabase)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Backblaze B2 Storage
BACKBLAZE_BUCKET_NAME=
B2_REGION=
B2_ENDPOINT=
BACKBLAZE_API_KEY=
BACKBLAZE_APPLICATION_KEY=

# Payment (if using Stripe)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App Configuration
NEXT_PUBLIC_APP_URL=https://n3uralia360.art
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL= (for development)
NEXT_PUBLIC_USDT_WALLET_ADDRESS= (if accepting crypto)
\`\`\`

#### 4. Input Sanitization
- All user inputs sanitized via `sanitizeString()` function
- XSS protection through React's built-in escaping
- SQL injection prevented by Supabase parameterized queries
- File upload size limits enforced (10MB max for serverless)

#### 5. API Security
- Rate limiting: **NOT IMPLEMENTED** ⚠️
- CORS configured via Next.js defaults
- API routes protected by middleware
- Download tokens with expiration
- Secure file serving with authentication checks

#### 6. Performance & Monitoring
- All debug console.log() statements removed from production code
- Error boundaries implemented for graceful error handling
- Supabase client singleton pattern to prevent memory leaks
- Caching strategy with revalidation tags
- Image compression for optimal loading

### ⚠️ Critical Actions Required Before Production

1. **Enable Row Level Security (RLS)**
   \`\`\`sql
   -- Run the script: scripts/enable-rls.sql
   -- This MUST be done before going live
   \`\`\`

2. **Add Rate Limiting**
   - Implement rate limiting on API routes
   - Consider using Vercel's rate limiting or Upstash Redis
   - Protect against DDoS and abuse

3. **Configure Error Monitoring**
   - Set up Sentry, LogRocket, or similar service
   - Update error.tsx and error-boundary.tsx with monitoring
   - Track production errors for quick response

4. **Set Up Backup Strategy**
   - Configure Supabase automatic backups
   - Set up Backblaze B2 bucket versioning
   - Document recovery procedures

5. **Security Headers**
   - Already configured via Next.js defaults
   - Consider additional CSP headers if needed

6. **Environment Variables Validation**
   - Verify all required variables are set in Vercel
   - Remove any development/test credentials
   - Use Vercel's environment variable encryption

### 🔐 Best Practices Implemented

- HTTPS enforced via Vercel deployment
- Secure cookie settings (httpOnly, secure, sameSite)
- No sensitive data in client-side code
- Server-side validation for all mutations
- Prepared statements for database queries
- File type validation on uploads
- Session timeout and refresh handling

### 📊 Monitoring Recommendations

1. **Application Monitoring**
   - Vercel Analytics (already integrated)
   - Speed Insights (already integrated)
   - Add custom error tracking

2. **Database Monitoring**
   - Supabase dashboard for query performance
   - Monitor connection pool usage
   - Set up alerts for slow queries

3. **Security Monitoring**
   - Monitor failed login attempts
   - Track unusual API usage patterns
   - Set up alerts for security events

## Reporting Security Issues

If you discover a security vulnerability, please email:
- travis@nuanu.com
- Include detailed steps to reproduce
- Allow 48 hours for initial response

## Incident Response

In case of security incident:
1. Disable affected features immediately
2. Rotate compromised credentials
3. Notify affected users if data breach
4. Document and analyze root cause
5. Implement fixes and additional safeguards
