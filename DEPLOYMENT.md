# Production Deployment Guide

## 🚨 CRITICAL SECURITY NOTICE

**IMPORTANT**: The `.env.local` file has been removed from the repository as it contained exposed credentials. You must set up environment variables properly before deploying.

## Environment Variables Setup

### 1. Vercel Dashboard Configuration

Go to your Vercel project settings and add these environment variables:

#### Supabase Configuration
\`\`\`
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
\`\`\`

#### Supabase Database Connection
\`\`\`
POSTGRES_URL=postgresql://postgres:[password]@[host]:5432/postgres
POSTGRES_PRISMA_URL=postgresql://postgres:[password]@[host]:5432/postgres?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://postgres:[password]@[host]:5432/postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DATABASE=postgres
POSTGRES_HOST=your-supabase-host.supabase.co
\`\`\`

#### Storage Configuration
\`\`\`
BLOB_READ_WRITE_TOKEN=your-new-vercel-blob-token
BACKBLAZE_API_KEY=your-new-backblaze-api-key
BACKBLAZE_APPLICATION_KEY=your-new-backblaze-application-key
BACKBLAZE_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME=your-bucket-name
B2_REGION=your-b2-region
B2_ENDPOINT=https://s3.your-region.backblazeb2.com
\`\`\`

#### Application Settings
\`\`\`
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
NODE_ENV=production
\`\`\`

### 2. Security Actions Required

#### IMMEDIATE ACTIONS:
1. **Rotate all exposed credentials:**
   - Generate new Vercel Blob token
   - Create new Backblaze API keys
   - Consider rotating database credentials

2. **Update Vercel environment variables** with new credentials

3. **Create local `.env.local`** file for development (not committed):
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your development credentials
   \`\`\`

### 3. Deployment Configuration

The project includes:
- ✅ `vercel.json` - Production deployment configuration
- ✅ `next.config.mjs` - Optimized for production
- ✅ Environment variable validation in API routes
- ✅ Proper error handling for missing credentials
- ✅ Supabase integration for database and authentication

### 4. Pre-deployment Checklist

- [ ] All environment variables set in Vercel dashboard
- [ ] New credentials generated and rotated
- [ ] Supabase project configured and connected
- [ ] Database migrations run successfully
- [ ] Backblaze B2 bucket configured
- [ ] Domain configured (if using custom domain)

### 5. Deployment Commands

\`\`\`bash
# Deploy to Vercel
vercel --prod

# Or push to main branch for automatic deployment
git push origin main
\`\`\`

## Performance Optimizations

The application includes:
- Image optimization and lazy loading
- Database query caching with revalidation (ISR)
- Pagination for large datasets
- Hybrid storage (Supabase + Backblaze B2)
- Compressed image uploads
- Server-side rendering with caching

## Monitoring

Monitor your deployment:
- Vercel Analytics dashboard
- Supabase database dashboard
- Backblaze B2 usage statistics
- Application logs in Vercel Functions tab
\`\`\`
