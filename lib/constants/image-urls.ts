// Image URLs for landing page and shows teasers
// Extracted to separate file to improve webpack caching performance

export const LANDING_PAGE_IMAGES = {
  shows: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20shows-tToTFsnigeePIK8qmKEjOJdS7qwKLj.png',
  studio: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20studio-t4en9J7r8otlWZKSZHOWp7AeCkbXzF.png',
  environments: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20envs-0r5zGRkPFHcFD2IFOs9lgF3duB8fCF.png',
  theatre: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20theatre-taPB66ftJRpK7d72Tmke6q5EER4OqV.png',
} as const

export const SECTION_BACKGROUND_IMAGES = {
  environments: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsBack.png-0q3topnrVPiOkCWvl8eEQKVmMbu237.jpeg',
} as const

export const ENVIRONMENT_COLLECTIONS = {
  heritage: {
    title: 'Heritage Environments',
    subtitle: 'Travel like never before!',
    images: [
      { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EH1-Dqv4I3pSMeCK9NxLTaFxtb1VANTGwj.png', alt: 'Modern City Dome' },
      { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EH2-4IhImlQqz5kKqrpXG4E82X3st6cOxq.png', alt: 'Heritage Temple' },
      { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EH3-wOIyeBtXJHkwkfy0iotkQWUkSQ5Ibg.png', alt: 'Urban Architecture' },
    ],
    ctaText: 'Choose environment',
    ctaLink: '/environments/heritage',
  },
  mythical: {
    title: 'Mythical Universe',
    subtitle: 'Find yourself inside the legends',
    images: [
      { src: '/images/MH1.png', alt: 'Mythical Dragons' },
      { src: '/images/MH2.png', alt: 'Mythical Beast' },
      { src: '/images/MH3.png', alt: 'Forest Dweller' },
    ],
    ctaText: 'Get Those Loops!',
    ctaLink: '/environments/mythical',
    highlightIndex: 2,
  },
  art: {
    title: 'Art Spaces',
    subtitle: 'Dreams you can choose',
    images: [
      { src: '/images/AH1.png', alt: 'Art 1' },
      { src: '/images/AH2.png', alt: 'Art 2' },
      { src: '/images/AH3.png', alt: 'Art 3' },
    ],
    ctaText: 'Choose environment',
    ctaLink: '/environments/art',
    highlightIndex: 0,
  },
} as const

export const TEASER_BUTTON_IMAGES = {
  Heritage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HeritageButtonShowPage%20%281%29-UTOiJnPQYrWs6eoV58npFHyJGXFzrR.png',
  Education: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EducationButtonShowPage-7Cbh8lnKGVveRFY7gN0mLW8JagRgPS.png',
  Fun: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FunButtonShowPage-JhOWIO4GjW22okIs8IPV2s8JofS8SI.png',
} as const
