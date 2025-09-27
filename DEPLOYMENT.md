# Production Deployment Guide

## 🚨 CRITICAL SECURITY NOTICE

**IMPORTANT**: The `.env.local` file has been removed from the repository as it contained exposed credentials. You must set up environment variables properly before deploying.

## Environment Variables Setup

### 1. Vercel Dashboard Configuration

Go to your Vercel project settings and add these environment variables:

#### Database (Supabase)
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
\`\`\`

#### Legacy Database Configuration (if still needed)
\`\`\`
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
POSTGRES_URL=postgresql://username:password@host:port/database?sslmode=require
POSTGRES_PRISMA_URL=postgresql://username:password@host:port/database?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://username:password@host:port/database?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:port/database?sslmode=require
PGHOST=your-postgres-host
POSTGRES_USER=your-postgres-user
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DATABASE=your-database-name
PGPASSWORD=your-postgres-password
PGDATABASE=your-database-name
PGHOST_UNPOOLED=your-postgres-host-unpooled
PGUSER=your-postgres-user
POSTGRES_URL_NO_SSL=postgresql://username:password@host:port/database
POSTGRES_HOST=your-postgres-host
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
NODE_ENV=production
\`\`\`

### 2. Security Actions Required

#### IMMEDIATE ACTIONS:
1. **Rotate all exposed credentials:**
   - Generate new Vercel Blob token
   - Create new Backblaze API keys
   - Generate new Supabase service role key

2. **Update Vercel environment variables** with new credentials

3. **Create local `.env.local`** file for development (not committed):
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your development credentials
   \`\`\`

### 3. Supabase Setup

1. **Create a new Supabase project** at https://supabase.com
2. **Run the database migration scripts** in the Supabase SQL editor
3. **Configure Row Level Security (RLS)** policies for your tables
4. **Set up authentication** if using Supabase Auth

### 4. Deployment Configuration

The project includes:
- ✅ `vercel.json` - Production deployment configuration
- ✅ `next.config.mjs` - Optimized for production
- ✅ Environment variable validation in API routes
- ✅ Proper error handling for missing credentials
- ✅ Supabase client configuration for SSR

### 5. Pre-deployment Checklist

- [ ] Supabase project created and configured
- [ ] All environment variables set in Vercel dashboard
- [ ] New credentials generated and rotated
- [ ] Database migration scripts executed
- [ ] Backblaze B2 bucket configured
- [ ] Domain configured (if using custom domain)

### 6. Deployment Commands

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
- Hybrid storage (database + Backblaze B2)
- Compressed image uploads
- Supabase real-time subscriptions for live updates

## Monitoring

Monitor your deployment:
- Vercel Analytics dashboard
- Supabase dashboard for database performance
- Backblaze B2 usage statistics
- Application logs in Vercel Functions tab
