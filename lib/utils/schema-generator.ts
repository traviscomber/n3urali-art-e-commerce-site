// Google Structured Data Schema for Products
// Add this to product pages for SEO

export interface ProductSchemaData {
  name: string
  image: string
  description: string
  price: string
  priceCurrency?: string
  availability?: string
  url: string
  sku?: string
  brand?: string
}

export const generateProductSchema = (product: ProductSchemaData): string => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'N3uralia360',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.priceCurrency || 'USD',
      price: product.price.replace('$', ''),
      availability: product.availability || 'https://schema.org/InStock',
      url: product.url,
    },
    sku: product.sku,
  })
}

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  })
}

export const generateOrganizationSchema = () => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'N3uralia360',
    url: 'https://n3uralia360.art',
    logo: 'https://n3uralia360.art/logo.png',
    description: 'Global marketplace for immersive fulldome environments designed for planetariums and immersive installations.',
    sameAs: [
      'https://twitter.com/n3uralia360',
      'https://instagram.com/n3uralia360',
    ],
  })
}
