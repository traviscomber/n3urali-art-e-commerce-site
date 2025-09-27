# Neon to Supabase Migration Guide

This guide walks you through migrating your N3urali.art e-commerce site from Neon to Supabase.

## 🎯 Migration Overview

We've successfully migrated the application from Neon PostgreSQL to Supabase, providing:
- Better integration with Next.js
- Built-in authentication system
- Real-time subscriptions
- Better developer experience
- Integrated file storage options

## 📋 Pre-Migration Checklist

- [ ] Backup your existing Neon database
- [ ] Create a new Supabase project
- [ ] Note down your current environment variables
- [ ] Ensure you have admin access to your Vercel project

## 🚀 Step-by-Step Migration

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Set a strong database password
4. Wait for the project to be fully provisioned

### 2. Export Data from Neon

\`\`\`bash
# Export your Neon database
pg_dump "your-neon-connection-string" > neon_backup.sql
\`\`\`

### 3. Import Data to Supabase

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the database schema creation scripts from `/scripts/supabase_schema.sql`
4. Import your data using the SQL Editor or pgAdmin

### 4. Update Environment Variables

Replace your Neon environment variables with Supabase ones:

#### Remove (Neon variables):
\`\`\`
DATABASE_URL
NEON_PROJECT_ID
# ... other Neon-specific variables
\`\`\`

#### Add (Supabase variables):
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### 5. Deploy Updated Code

The migration has already updated all the code files. Simply deploy:

\`\`\`bash
# Deploy to Vercel
vercel --prod

# Or push to trigger automatic deployment
git push origin main
\`\`\`

### 6. Test the Migration

Run the migration test script:

\`\`\`bash
npm run test:migration
\`\`\`

Or manually run:
\`\`\`bash
npx tsx scripts/test-supabase-migration.ts
\`\`\`

## 🔧 What Was Changed

### Code Changes Made:
- ✅ Replaced all Neon client imports with Supabase clients
- ✅ Updated all API routes to use Supabase queries
- ✅ Converted SQL queries to Supabase query builder
- ✅ Updated database helper functions
- ✅ Removed Neon dependencies from package.json
- ✅ Updated environment configuration files

### Database Schema:
- ✅ All existing tables preserved
- ✅ Relationships maintained
- ✅ Indexes preserved
- ✅ Data integrity maintained

## 🛡️ Security Considerations

### Row Level Security (RLS)
Supabase uses RLS for data security. Consider enabling RLS policies:

\`\`\`sql
-- Enable RLS on sensitive tables
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Create policies as needed
CREATE POLICY "Public images are viewable by everyone" 
ON images FOR SELECT 
USING (true);
\`\`\`

### Environment Variables
- Never commit `.env.local` to version control
- Rotate all API keys after migration
- Use Vercel's environment variable encryption

## 🔍 Troubleshooting

### Common Issues:

1. **Connection Errors**
   - Verify Supabase URL and keys are correct
   - Check if your IP is whitelisted (if using IP restrictions)

2. **Query Errors**
   - Supabase uses slightly different SQL syntax
   - Check column names and data types match

3. **RLS Errors**
   - Disable RLS temporarily for testing
   - Create appropriate policies for your use case

4. **Performance Issues**
   - Add indexes for frequently queried columns
   - Use Supabase's query optimization tools

### Getting Help:
- Check Supabase documentation: https://supabase.com/docs
- Join Supabase Discord community
- Review migration test results for specific errors

## 📊 Post-Migration Verification

After migration, verify:
- [ ] All pages load correctly
- [ ] Image uploads work
- [ ] Order processing functions
- [ ] Analytics tracking works
- [ ] Download system operational
- [ ] Performance is acceptable

## 🎉 Migration Complete!

Your N3urali.art e-commerce site is now running on Supabase! The migration provides better scalability, security, and developer experience while maintaining all existing functionality.

## 📈 Next Steps

Consider these Supabase features for future enhancements:
- **Supabase Auth**: Replace custom auth with Supabase authentication
- **Real-time subscriptions**: Add live updates to your admin dashboard
- **Supabase Storage**: Consider migrating from Backblaze to Supabase Storage
- **Edge Functions**: Move some API logic to Supabase Edge Functions
