"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  es: {
    // Language reference for conditional rendering
    language: "es",
    
    // Navigation
    "nav.collection": "Colección",
    "nav.gallery": "Galería",
    "nav.myOrders": "Mis Pedidos",

    // Hero Section
    "hero.badge": "Preservación Cultural",
    "hero.title": "Documentación Inmersiva",
    "hero.subtitle": "de Patrimonio Cultural",
    "hero.description": "Creamos experiencias visuales 360° para preservar y compartir el legado de pueblos originarios. Nuestro trabajo en Asia combina tecnología de IA con respeto profundo por las tradiciones ancestrales, generando archivos inmersivos de ultra alta resolución para educación y conservación cultural.",
    "hero.cta.explore": "Ver Proyectos",
    "hero.cta.demo": "Conocer Nuestro Trabajo",
    "hero.videoPlaceholder": "[ Video Placeholder - 21:9 ]",
    
    "hero.imageOfDay": "Imagen del Día",
    "hero.viewDetails": "Ver Detalles y Precio",
    "hero.offToday": "% DCTO Hoy",

    // Collection Section
    "collection.badge": "Colección Premium",
    "collection.title": "20 Imágenes 360°",
    "collection.titleHighlight": "Curadas",
    "collection.viewComplete": "Ver Colección Completa",
    "collection.off": "% DCTO",

    // Auction Section
    "auction.badge": "⚡ Subasta Rápida",
    "auction.title": "Atrapa los",
    "auction.titleHighlight": "Mejores Precios",
    "auction.subtitle": "¡Los precios bajan cada minuto! Consigue imágenes premium a precios inmejorables antes de que se reinicien",
    "auction.tip": "💡 Los precios se reinician cada hora • Mientras más descuento, mejor el trato",
    "auction.hotDeal": "¡OFERTA CALIENTE!",
    "auction.endsIn": "Termina en",
    "auction.buyNow": "Comprar Ahora",
    left: "restante", // Adding "left" translation for auction countdown timer
    minutes: "Minutos",
    seconds: "Segundos",
    untilPricesReset: "Hasta que se reinicien los precios",
    instant: "Instantáneo",

    // CTA Cards
    "cta.collection.title": "Colección",
    "cta.collection.subtitle": "20 imágenes premium curadas",
    "cta.collection.price": "$999",
    "cta.collection.priceNote": "Paquete completo",
    "cta.collection.button": "Ver Colección",
    "cta.gallery.title": "Galería",
    "cta.gallery.subtitle": "Explora todas las imágenes individuales",
    "cta.gallery.count": "130+",
    "cta.gallery.countNote": "Imágenes premium",
    "cta.gallery.button": "Explorar Galería",
    "cta.signIn.title": "Iniciar Sesión",
    "cta.signIn.subtitle": "Accede a tu cuenta y pedidos",
    "cta.signIn.access": "Acceso",
    "cta.signIn.accessNote": "Descarga instantánea",
    "cta.signIn.button": "Iniciar Sesión",

    // Stats Section
    "stats.resolution": "4K-16K",
    "stats.resolutionNote": "Ultra alta resolución",
    "stats.instant": "Instantáneo",
    "stats.instantNote": "Descarga después de comprar",
    "stats.vr": "Listo para VR",
    "stats.vrNote": "Perfecto para experiencias inmersivas",

    // Featured Gallery
    "featured.badge": "Galería Destacada",
    "featured.title": "Explora Nuestra",
    "featured.titleHighlight": "Colección 360° Premium",
    "featured.subtitle": "Navega nuestra selección curada de imágenes domo, equirectangulares y de colección destacada",

    // FAQ Section
    "faq.badge": "Nuestro Trabajo",
    "faq.title": "Preservación Cultural a Través de",
    "faq.titleHighlight": "Tecnología Inmersiva",
    "faq.subtitle": "Cómo combinamos inteligencia artificial con respeto cultural para documentar y preservar el patrimonio de pueblos originarios.",

    "faq.q1.title": "¿Qué es la documentación inmersiva 360° y por qué es importante para el patrimonio cultural?",
    "faq.q1.answer": "La documentación inmersiva 360° captura espacios y ambientes culturales completos, permitiendo que las futuras generaciones experimenten estos lugares como si estuvieran presentes físicamente. A diferencia de la fotografía tradicional que solo muestra fragmentos, nuestras capturas esféricas preservan la totalidad del contexto espacial, los detalles arquitectónicos, y la atmósfera de sitios culturales.\n\nEsto es especialmente crítico para sitios de pueblos originarios en Asia que enfrentan amenazas de urbanización, cambio climático, o simplemente el paso del tiempo. Nuestras imágenes equirectangulares permiten crear archivos digitales permanentes que pueden usarse para educación, investigación académica, y experiencias de realidad virtual que acercan estas culturas a personas de todo el mundo sin el impacto del turismo masivo.",

    "faq.q2.title": "¿Cómo utilizan la inteligencia artificial en sus proyectos de preservación cultural?",
    "faq.q2.answer": "Nuestro enfoque combina captura fotográfica real con técnicas de IA para restauración, reconstrucción y mejora de calidad. Utilizamos algoritmos de difusión de ruido para generar reconstrucciones de alta fidelidad de espacios dañados o parcialmente perdidos, guiados siempre por documentación histórica auténtica y consulta con las comunidades locales.\n\nPara sitios bien preservados, empleamos upscaling neuronal y corrección de color algorítmica para crear archivos de hasta 16K de resolución desde capturas originales, revelando detalles imperceptibles a simple vista. En proyectos con pueblos originarios en Asia, hemos trabajado documentando templos ancestrales, sitios ceremoniales, y espacios comunitarios, siempre con pleno consentimiento y participación de las comunidades.\n\nNuestra tecnología también permite crear reconstrucciones de sitios históricos basadas en descripciones orales y memorias comunitarias, dando forma visual a patrimonio intangible que de otra forma se perdería.",

    "faq.q3.title": "¿Cómo garantizan el respeto cultural en su trabajo con pueblos originarios?",
    "faq.q3.answer": "El respeto cultural es nuestro principio fundamental. Cada proyecto comienza con diálogo extenso con las comunidades, obteniendo permisos explícitos no solo para la captura, sino también para el uso y distribución de las imágenes. Reconocemos que muchos espacios tienen significado sagrado o restricciones culturales sobre quién puede acceder a ellos.\n\nEn nuestro trabajo en Asia, hemos establecido protocolos que incluyen: consulta con líderes comunitarios y autoridades culturales, capacitación de miembros locales en las técnicas de captura para que sean ellos quienes documenten sus propios espacios cuando sea apropiado, acuerdos de propiedad intelectual que reconocen los derechos de las comunidades sobre su patrimonio, y retorno de beneficios económicos a las comunidades cuando el material se comercializa.\n\nNuestras imágenes nunca se publican sin aprobación explícita, y respetamos restricciones sobre acceso a espacios sagrados o ceremoniales. La tecnología es solo una herramienta; el conocimiento y la decisión siempre permanecen en manos de las comunidades.",

    "faq.q4.title": "¿Qué especificaciones técnicas manejan para archivos de preservación cultural?",
    "faq.q4.answer": "Para trabajos de preservación cultural, utilizamos los más altos estándares técnicos para garantizar longevidad y fidelidad de los archivos:\n\n• Resoluciones desde 8K (7680×4320) hasta 16K (15360×8640) en formato equirectangular\n• Archivos RAW sin compresión para máxima fidelidad\n• Profundidad de color de 16-bit para capturar rangos dinámicos completos\n• Metadatos exhaustivos incluyendo coordenadas GPS, fecha, condiciones de captura, y contexto cultural\n• Múltiples copias en formatos de archivo abiertos (TIFF, PNG) para evitar obsolescencia tecnológica\n• Documentación complementaria con información contextual, histórica y cultural\n\nTodos los archivos cumplen con estándares internacionales de preservación digital establecidos por UNESCO y bibliotecas nacionales. Trabajamos con instituciones académicas para asegurar que estos archivos puedan ser accedidos por investigadores durante décadas.",

    "faq.q5.title": "¿Qué proyectos han desarrollado con pueblos originarios en Asia?",
    "faq.q5.answer": "Hemos colaborado con diversas comunidades en proyectos de documentación y preservación:\n\n• Templos ancestrales: Documentación 360° de arquitectura religiosa tradicional en riesgo, incluyendo detalles de tallado en madera, murales, y espacios ceremoniales\n• Sitios ceremoniales naturales: Captura de espacios sagrados en bosques y montañas, preservando tanto el entorno natural como el significado cultural\n• Reconstrucciones digitales: Recreación de espacios históricos perdidos basados en memoria oral y documentos ancestrales, trabajando estrechamente con ancianos de las comunidades\n• Educación cultural: Desarrollo de experiencias VR para escuelas locales que enseñan a las nuevas generaciones sobre sus propias tradiciones en formatos accesibles y atractivos\n\nCada proyecto es único y adaptado a las necesidades específicas de cada comunidad. Nuestro objetivo no es solo crear archivos estáticos, sino herramientas vivas que las comunidades puedan usar para educación, turismo cultural sostenible, y fortalecimiento de identidad.",

    "faq.q6.title": "¿Cómo pueden las instituciones culturales y educativas acceder a este material?",
    "faq.q6.answer": "Trabajamos con múltiples modelos según el proyecto:\n\n**Instituciones educativas y académicas:** Acceso gratuito o de bajo costo para investigación, educación y preservación. Buscamos maximizar el impacto educativo mientras respetamos los acuerdos con las comunidades.\n\n**Museos y centros culturales:** Licencias especiales para exhibiciones, tanto físicas (proyecciones dome, instalaciones inmersivas) como virtuales. Estos proyectos incluyen material contextual y colaboración con las comunidades originarias.\n\n**Proyectos comerciales éticos:** Para documentales, producciones educativas o experiencias turísticas virtuales, ofrecemos licencias que incluyen porcentaje de beneficios que retorna directamente a las comunidades.\n\nCada caso se evalúa individualmente, priorizando siempre el respeto cultural y el beneficio para las comunidades originarias. Contacta con nosotros para discutir proyectos específicos. Las comunidades siempre tienen derecho de veto sobre el uso de imágenes de su patrimonio.",
  },
  en: {
    // Language reference for conditional rendering
    language: "en",
    
    // Navigation
    "nav.collection": "Collection",
    "nav.gallery": "Gallery",
    "nav.myOrders": "My Orders",

    // Hero Section
    "hero.badge": "Cultural Preservation",
    "hero.title": "Immersive Documentation",
    "hero.subtitle": "of Cultural Heritage",
    "hero.description": "We create 360° visual experiences to preserve and share the legacy of indigenous peoples. Our work in Asia combines AI technology with deep respect for ancestral traditions, generating ultra-high resolution immersive archives for education and cultural conservation.",
    "hero.cta.explore": "View Projects",
    "hero.cta.demo": "Learn About Our Work",
    "hero.videoPlaceholder": "[ Video Placeholder - 21:9 ]",
    
    "hero.imageOfDay": "Image of the Day",
    "hero.viewDetails": "View Details & Price",
    "hero.offToday": "% OFF Today",

    // Collection Section
    "collection.badge": "Premium Collection",
    "collection.title": "20 Curated",
    "collection.titleHighlight": "360° Images",
    "collection.viewComplete": "View Complete Collection",
    "collection.off": "% OFF",

    // Auction Section
    "auction.badge": "⚡ Flash Auction",
    "auction.title": "Catch the",
    "auction.titleHighlight": "Best Prices",
    "auction.subtitle": "Prices drop every minute! Grab premium images at unbeatable prices before they reset",
    "auction.tip": "💡 Prices reset every hour • The deeper the discount, the better the deal",
    "auction.hotDeal": "HOT DEAL!",
    "auction.endsIn": "Ends in",
    "auction.buyNow": "Buy Now",
    left: "left", // Adding "left" translation for auction countdown timer
    minutes: "Minutes",
    seconds: "Seconds",
    untilPricesReset: "Until prices reset",
    instant: "Instant",

    // CTA Cards
    "cta.collection.title": "Collection",
    "cta.collection.subtitle": "20 curated premium images",
    "cta.collection.price": "$999",
    "cta.collection.priceNote": "Complete bundle",
    "cta.collection.button": "View Collection",
    "cta.gallery.title": "Gallery",
    "cta.gallery.subtitle": "Browse all individual images",
    "cta.gallery.count": "130+",
    "cta.gallery.countNote": "Premium images",
    "cta.gallery.button": "Browse Gallery",
    "cta.signIn.title": "Sign In",
    "cta.signIn.subtitle": "Access your account and orders",
    "cta.signIn.access": "Instant",
    "cta.signIn.accessNote": "Download access",
    "cta.signIn.button": "Sign In",

    // Stats Section
    "stats.resolution": "4K-16K",
    "stats.resolutionNote": "Ultra high resolution",
    "stats.instant": "Instant",
    "stats.instantNote": "Download after purchase",
    "stats.vr": "VR Ready",
    "stats.vrNote": "Perfect for immersive experiences",

    // Featured Gallery
    "featured.badge": "Featured Gallery",
    "featured.title": "Explore Our",
    "featured.titleHighlight": "Premium 360° Collection",
    "featured.subtitle": "Browse our curated selection of dome, equirectangular, and featured collection images",

    // FAQ Section
    "faq.badge": "Our Work",
    "faq.title": "Cultural Preservation Through",
    "faq.titleHighlight": "Immersive Technology",
    "faq.subtitle": "How we combine artificial intelligence with cultural respect to document and preserve the heritage of indigenous peoples.",

    "faq.q1.title": "What is 360° immersive documentation and why is it important for cultural heritage?",
    "faq.q1.answer": "360° immersive documentation captures complete cultural spaces and environments, allowing future generations to experience these places as if physically present. Unlike traditional photography that only shows fragments, our spherical captures preserve the totality of spatial context, architectural details, and atmosphere of cultural sites.\n\nThis is especially critical for indigenous sites in Asia facing threats from urbanization, climate change, or simply the passage of time. Our equirectangular images allow creating permanent digital archives that can be used for education, academic research, and virtual reality experiences that bring these cultures closer to people worldwide without the impact of mass tourism.",

    "faq.q2.title": "How do you use artificial intelligence in your cultural preservation projects?",
    "faq.q2.answer": "Our approach combines real photographic capture with AI techniques for restoration, reconstruction, and quality enhancement. We use noise diffusion algorithms to generate high-fidelity reconstructions of damaged or partially lost spaces, always guided by authentic historical documentation and consultation with local communities.\n\nFor well-preserved sites, we employ neural upscaling and algorithmic color correction to create files up to 16K resolution from original captures, revealing details imperceptible to the naked eye. In projects with indigenous peoples in Asia, we have documented ancestral temples, ceremonial sites, and community spaces, always with full consent and participation from the communities.\n\nOur technology also enables creating reconstructions of historical sites based on oral descriptions and community memories, giving visual form to intangible heritage that would otherwise be lost.",

    "faq.q3.title": "How do you ensure cultural respect in your work with indigenous peoples?",
    "faq.q3.answer": "Cultural respect is our fundamental principle. Each project begins with extensive dialogue with communities, obtaining explicit permissions not only for capture, but also for use and distribution of images. We recognize that many spaces have sacred meaning or cultural restrictions on who can access them.\n\nIn our work in Asia, we have established protocols including: consultation with community leaders and cultural authorities, training of local members in capture techniques so they can document their own spaces when appropriate, intellectual property agreements recognizing communities' rights over their heritage, and return of economic benefits to communities when material is commercialized.\n\nOur images are never published without explicit approval, and we respect restrictions on access to sacred or ceremonial spaces. Technology is just a tool; knowledge and decision-making always remain in the hands of the communities.",

    "faq.q4.title": "What technical specifications do you handle for cultural preservation files?",
    "faq.q4.answer": "For cultural preservation work, we use the highest technical standards to ensure longevity and fidelity of files:\n\n• Resolutions from 8K (7680×4320) up to 16K (15360×8640) in equirectangular format\n• Uncompressed RAW files for maximum fidelity\n• 16-bit color depth to capture complete dynamic ranges\n• Exhaustive metadata including GPS coordinates, date, capture conditions, and cultural context\n• Multiple copies in open file formats (TIFF, PNG) to avoid technological obsolescence\n• Complementary documentation with contextual, historical, and cultural information\n\nAll files comply with international digital preservation standards established by UNESCO and national libraries. We work with academic institutions to ensure these files can be accessed by researchers for decades.",

    "faq.q5.title": "What projects have you developed with indigenous peoples in Asia?",
    "faq.q5.answer": "We have collaborated with various communities on documentation and preservation projects:\n\n• Ancestral temples: 360° documentation of traditional religious architecture at risk, including details of wood carvings, murals, and ceremonial spaces\n• Natural ceremonial sites: Capture of sacred spaces in forests and mountains, preserving both the natural environment and cultural significance\n• Digital reconstructions: Recreation of lost historical spaces based on oral memory and ancestral documents, working closely with community elders\n• Cultural education: Development of VR experiences for local schools that teach new generations about their own traditions in accessible and engaging formats\n\nEach project is unique and adapted to the specific needs of each community. Our goal is not just to create static archives, but living tools that communities can use for education, sustainable cultural tourism, and identity strengthening.",

    "faq.q6.title": "How can cultural and educational institutions access this material?",
    "faq.q6.answer": "We work with multiple models depending on the project:\n\n**Educational and academic institutions:** Free or low-cost access for research, education, and preservation. We seek to maximize educational impact while respecting agreements with communities.\n\n**Museums and cultural centers:** Special licenses for exhibitions, both physical (dome projections, immersive installations) and virtual. These projects include contextual material and collaboration with indigenous communities.\n\n**Ethical commercial projects:** For documentaries, educational productions, or virtual tourism experiences, we offer licenses that include percentage of benefits returning directly to communities.\n\nEach case is evaluated individually, always prioritizing cultural respect and benefit for indigenous communities. Contact us to discuss specific projects. Communities always have veto rights over the use of images of their heritage.",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es")

  useEffect(() => {
    // Load saved language preference or default to Spanish
    const saved = localStorage.getItem("language") as Language
    if (saved && (saved === "es" || saved === "en")) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
