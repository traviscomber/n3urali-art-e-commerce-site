// Environment Marketplace Products
// Safe parallel data structure - doesn't affect existing code

export interface EnvironmentProduct {
  id: string
  title: string
  category: 'elemental' | 'culture' | 'mythic' | 'abstract' | 'seasonal'
  price: string
  image: string
  description: string
  resolution: string
  format: string
  duration: string
  link: string
  sku?: string
  availability?: 'in-stock' | 'pre-order' | 'out-of-stock'
}

export const environmentProducts: EnvironmentProduct[] = [
  {
    id: 'ocean-elemental',
    title: 'Elemental Ocean Dome Loop',
    category: 'elemental',
    price: '$59',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatOceans1-jbOpQIT9umn9y7vmiWYSkJd1wAVeZL.png',
    description: 'Immersive fulldome ocean environment designed for planetariums, domes and immersive installations.',
    resolution: '4K / 8K',
    format: 'Fulldome fisheye',
    duration: 'Seamless loop',
    link: '/environments/ocean-elemental',
    sku: 'ENV-OCEAN-001',
    availability: 'in-stock',
  },
  {
    id: 'volcano-elemental',
    title: 'Volcanic Landscapes Dome Loop',
    category: 'elemental',
    price: '$59',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatVolcano-XxxYyyZzz.png',
    description: 'Dramatic volcanic environment with lava flows and geological formations.',
    resolution: '4K / 8K',
    format: 'Fulldome fisheye',
    duration: 'Seamless loop',
    link: '/environments/volcano-elemental',
    sku: 'ENV-VOLCANO-001',
    availability: 'in-stock',
  },
  {
    id: 'mythic-cosmos',
    title: 'Mythic Cosmos Environment',
    category: 'mythic',
    price: '$69',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMythBackg-TyglO2M7f4cLxT7fpr7RoIU1ZHwKtq.png',
    description: 'Celestial immersive dome environment with mythical creatures and cosmic patterns.',
    resolution: '4K / 8K',
    format: 'Fulldome fisheye',
    duration: 'Seamless loop',
    link: '/environments/mythic-cosmos',
    sku: 'ENV-MYTHIC-001',
    availability: 'in-stock',
  },
  {
    id: 'culture-temple',
    title: 'Cultural Heritage Temple Dome',
    category: 'culture',
    price: '$59',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultBackg-XbBPuSBSiwRQaM2g09DVzXHzBbTfJF.png',
    description: 'Immersive cultural environment featuring historic temples and heritage sites.',
    resolution: '4K',
    format: 'Fulldome fisheye',
    duration: 'Seamless loop',
    link: '/environments/culture-temple',
    sku: 'ENV-CULTURE-001',
    availability: 'in-stock',
  },
  {
    id: 'art-abstract',
    title: 'Abstract Dreamscape Pack',
    category: 'abstract',
    price: '$49',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArtBackg-i2tI6hLUgCcC5qOAEPBzz1g91177C7.png',
    description: 'Surreal immersive visuals designed for dome events and artistic installations.',
    resolution: '4K',
    format: 'Fulldome fisheye',
    duration: 'Seamless loop',
    link: '/environments/art-abstract',
    sku: 'ENV-ART-001',
    availability: 'in-stock',
  },
]

// Group products by category
export const getProductsByCategory = (category: string): EnvironmentProduct[] => {
  return environmentProducts.filter((product) => product.category === category)
}

// Get all categories
export const getCategories = (): string[] => {
  return Array.from(new Set(environmentProducts.map((product) => product.category)))
}
