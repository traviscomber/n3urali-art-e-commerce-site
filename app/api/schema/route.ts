import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Store'],
    name: 'N3uralia360',
    description: 'Ultra high-resolution AI-generated 360° photography marketplace',
    url: 'https://n3uralia360.art',
    telephone: '+62 823 4013 7013',
    email: 'info@n3uralia360.art',
    sameAs: [
      'https://instagram.com/n3uralia360',
      'https://twitter.com/n3uralia360',
    ],
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '29',
      highPrice: '499',
      offerCount: '5000+',
    },
    priceRange: '$$',
  }

  return NextResponse.json(schemaData, {
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
