# N3urali.art - Premium 360° Digital Photography Platform

A professional e-commerce platform for AI-generated equirectangular and fisheye imagery, built for creators, architects, and visualization professionals.

## Overview

N3urali.art is a cutting-edge digital photography platform specializing in high-resolution 360° imagery. Our collection features AI-generated equirectangular and fisheye images perfect for projection mapping, VR experiences, and architectural visualization.

## Features

- **Premium 360° Gallery** - Browse our curated collection of high-resolution images
- **Interactive Previews** - 360° panorama viewer for immersive exploration
- **Flexible Licensing** - Choose from exclusive or non-exclusive license options
- **Instant Downloads** - Get 4K-16K resolution files immediately after purchase
- **Professional Quality** - AI-enhanced imagery with superior clarity and detail
- **Secure Payments** - Integrated checkout with multiple payment options
- **User Accounts** - Track purchases, downloads, and order history

## Technology Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Storage**: Backblaze B2 with CDN integration
- **Authentication**: Supabase Auth
- **Payments**: Integrated payment processing
- **Image Processing**: Custom AI enhancement pipeline

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Backblaze B2 account

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd n3urali-art
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your environment variables in `.env.local`

5. Run the development server
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

See `.env.example` for required environment variables including:

- Supabase configuration
- Backblaze B2 storage credentials
- Authentication secrets
- Payment processing keys

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── account/           # User account pages
│   ├── api/               # API routes
│   ├── gallery/           # Image gallery
│   └── product/           # Product detail pages
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── public/                # Static assets
└── scripts/               # Database scripts and utilities
\`\`\`

## Contributing

This is a proprietary project for N3urali.art. For questions or support, please contact the development team.

## License

© 2025 N3urali.art. All rights reserved.
