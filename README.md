# n3uralia360.art - Production Ready E-Commerce Platform

Premium AI-generated 360° photography marketplace built with Next.js 16, Supabase, and TypeScript.

## 🚀 Production Readiness Status

### ✅ Completed
- All debug console.log statements removed
- Supabase client singleton pattern implemented
- Error boundaries and error handling
- SEO files (sitemap.xml, robots.txt, manifest)
- Environment variables validation
- Performance optimizations for mobile/iPad
- Image compression and caching
- Secure authentication and session management
- Input sanitization and XSS protection

### ⚠️ Critical: Before Going Live

1. **Enable Row Level Security (RLS)**
   \`\`\`bash
   # Run in Supabase SQL Editor
   scripts/enable-rls.sql
   \`\`\`

2. **Set Production Environment Variables**
   - See `.env.example` for required variables
   - Configure in Vercel project settings
   - Ensure no localhost URLs in production

3. **Configure Error Monitoring**
   - Set up Sentry, LogRocket, or similar
   - Update error handlers with monitoring code

4. **Add Rate Limiting**
   - Implement on API routes
   - Protect against abuse and DDoS

5. **Test RLS Policies**
   - Verify users can only access their data
   - Confirm admin access works correctly
   - Test anonymous browsing

## 📋 Documentation

- [Security Policy](./SECURITY.md) - Security measures and policies
- [Deployment Guide](./DEPLOYMENT.md) - Step-by-step deployment instructions
- [Environment Variables](./.env.example) - Required configuration

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Backblaze B2 + Vercel Blob
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Deployment**: Vercel
- **Language**: TypeScript

## 🔒 Security Features

- Row Level Security (RLS) policies ready to enable
- Secure session management
- Input sanitization on all user data
- XSS protection via React
- SQL injection prevention via parameterized queries
- HTTPS enforced
- Secure cookie settings
- Admin route protection

## 🎯 Key Features

- Premium 360° image marketplace
- User authentication and profiles
- Shopping cart and checkout
- Order management
- Download system with tokens
- Admin panel for content management
- Featured collections and galleries
- Tag-based organization
- Mobile-responsive design

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/traviscomber/n3urali-art-e-commerce-site.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
\`\`\`

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:

\`\`\`bash
vercel --prod
\`\`\`

## 🧪 Testing Checklist

- [ ] Authentication (login, signup, logout)
- [ ] Browse and search images
- [ ] Add to cart and checkout
- [ ] Download purchased images
- [ ] Admin panel access
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Performance (Lighthouse score)

## 📊 Performance

- Optimized for Lighthouse score 90+
- Image lazy loading
- Code splitting
- CDN delivery
- Caching strategy with revalidation
- Compressed assets

## 🐛 Known Issues

- Multiple GoTrueClient warnings appear in development mode (harmless, fixed in production)
- iPad performance optimized but may need further tuning for complex animations

## 🤝 Support

For issues or questions:
- Email: travis@nuanu.com
- GitHub: [Create an issue](https://github.com/traviscomber/n3urali-art-e-commerce-site/issues)

## 📝 License

Proprietary - All rights reserved by n3uralia group

---

**Built with ❤️ by n3uralia**
