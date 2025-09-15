# Production Deployment Guide

## 🚨 CRITICAL SECURITY NOTICE

**IMPORTANT**: The `.env.local` file has been removed from the repository as it contained exposed credentials. You must set up environment variables properly before deploying.

## Environment Variables Setup

### 1. Vercel Dashboard Configuration

Go to your Vercel project settings and add these environment variables:

#### Database (Supabase)
\`\`\`
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
\`\`\`

#### Storage Configuration
\`\`\`
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
NODE_ENV=production
\`\`\`

### 2. Security Actions Required

#### IMMEDIATE ACTIONS:
1. **Rotate all exposed credentials:**
   - Generate new Backblaze API keys
   - Rotate Supabase service role key if needed

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

### 4. Pre-deployment Checklist

- [ ] All environment variables set in Vercel dashboard
- [ ] New credentials generated and rotated
- [ ] Supabase database connection tested
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
- Database query caching with revalidation
- Pagination for large datasets
- Hybrid storage (Supabase + Backblaze B2)
- Compressed image uploads

## Monitoring

Monitor your deployment:
- Vercel Analytics dashboard
- Supabase dashboard for database performance
- Backblaze B2 usage statistics
- Application logs in Vercel Functions tab
