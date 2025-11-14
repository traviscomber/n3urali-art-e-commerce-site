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
    "hero.imageOfDay": "Imagen del Día",
    "hero.title": "Imágenes 360°",
    "hero.titleHighlight": "Premium",
    "hero.subtitle": "Experimenta la calidad y detalle de nuestras imágenes profesionales generadas por IA",
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
    "auction.subtitle":
      "¡Los precios bajan cada minuto! Consigue imágenes premium a precios inmejorables antes de que se reinicien",
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
    "faq.badge": "Preguntas Frecuentes",
    "faq.title": "Todo lo que Necesitas Saber Sobre",
    "faq.titleHighlight": "Fotografía Digital 360°",
    "faq.subtitle":
      "Preguntas comunes sobre nuestras imágenes generadas por IA, licencias y especificaciones técnicas.",

    "faq.q1.title": "¿Qué es la fotografía 360° y cómo se diferencia de las imágenes tradicionales?",
    "faq.q1.answer":
      "La fotografía 360° captura una vista esférica completa que permite explorar un entorno en todas las direcciones. Ofrecemos formatos equirectangulares (360° x 180°) y ojo de pez, perfectos para experiencias VR, mapeo de proyección dome, y visualización arquitectónica inmersiva. A diferencia de las fotografías planas, nuestras imágenes 360° te permiten sumergirte completamente en mundos digitales con perspectiva espacial total.",

    "faq.q2.title": "¿Cómo crean sus imágenes con Inteligencia Artificial? Explíquenme el proceso técnico.",
    "faq.q2.answer":
      "Nuestro proceso propietario combina múltiples técnicas avanzadas de IA desarrolladas internamente. Comenzamos con modelos de difusión de ruido (noise diffusion) que generan imágenes desde la aleatoriedad pura, guiadas por prompts especializados y parámetros técnicos precisos. El proceso de difusión trabaja iterativamente: parte de ruido gaussiano puro y gradualmente lo 'limpia' para revelar estructuras coherentes, similar a cómo una fotografía aparece en un revelado químico tradicional. \n\nNuestros algoritmos propietarios controlan cada paso de este proceso: ajustamos la velocidad de difusión, los niveles de coherencia espacial, y la fidelidad de color para lograr resultados imposibles con métodos tradicionales. Luego aplicamos técnicas de upscaling neuronal para alcanzar resoluciones de hasta 16K, manteniendo detalles fractales perfectos. \n\nFinalmente, cada imagen pasa por post-procesamiento algorítmico: corrección de color procedural, optimización de proyección esférica, y validación de compatibilidad VR. Este pipeline completo toma horas de cómputo por imagen, resultando en calidad suprema que supera fotografía capturada tradicionalmente. Todo el sistema ha sido desarrollado desde cero por el equipo técnico de n3uralia.",

    "faq.q3.title": "¿Qué hace únicos sus algoritmos de generación de imágenes?",
    "faq.q3.answer":
      "Hemos desarrollado desde cero algoritmos propietarios que optimizan específicamente para geometría 360° y proyección esférica. Mientras que los modelos de difusión estándar pueden crear distorsiones en los polos de imágenes equirectangulares, nuestros algoritmos compensan matemáticamente estas distorsiones durante la generación. \n\nImplementamos técnicas de coherencia espacial adaptativa que aseguran continuidad perfecta en el horizonte 360°, eliminando costuras visibles. Además, nuestros modelos están entrenados con datasets especializados de geometría fractal y patrones arquitectónicos complejos, permitiendo generar estructuras imposibles de fotografiar en el mundo real. \n\nCada imagen es única: nunca generamos dos veces la misma composición gracias a nuestro sistema de semillas aleatorias controladas y variaciones paramétricas infinitas. Tecnología desarrollada íntegramente por n3uralia.",

    "faq.q4.title": "¿Qué especificaciones técnicas y formatos ofrecen?",
    "faq.q4.answer":
      "Entregamos imágenes en resoluciones desde 4K (3840×2160) hasta 16K (15360×8640) en formatos equirectangular y fisheye/dome. Todos los archivos incluyen:\n\n• Formatos: JPEG (alta calidad), PNG (sin pérdida), y TIFF bajo pedido\n• Espacios de color: sRGB (estándar) y ProPhoto RGB (profesional)\n• Profundidad: 8-bit estándar, 16-bit para workflows HDR\n• Metadatos XMP completos con información de proyección\n• Compatibilidad verificada con Unity, Unreal Engine, y principales software VR\n\nCada imagen está optimizada para streaming eficiente en experiencias web y rendimiento máximo en headsets VR.",

    "faq.q5.title": "¿Para qué proyectos son ideales estas imágenes 360°?",
    "faq.q5.answer":
      "Nuestras imágenes son perfectas para:\n\n• Experiencias VR y metaverso: Ambientes completos para Oculus, HTC Vive, PlayStation VR\n• Mapping de proyección: Shows visuales en domos planetarios, eventos inmersivos, instalaciones artísticas\n• Arquitectura y real estate: Tours virtuales, visualización de espacios, presentaciones de proyectos\n• Producción audiovisual: Backgrounds para videos 360°, YouTube VR, contenido social inmersivo\n• Gaming y simulación: Skyboxes para juegos, entornos de entrenamiento VR, simuladores profesionales\n• Arte digital: NFTs 360°, galerías virtuales, instalaciones interactivas\n\nLa naturaleza procedural de nuestras imágenes garantiza escenas únicas que no existen en el mundo físico, perfectas para proyectos que buscan diferenciación visual absoluta.",

    "faq.q6.title": "¿Cómo funciona el licenciamiento y proceso de compra?",
    "faq.q6.answer":
      "Ofrecemos dos tipos de licencia:\n\n**No Exclusiva:** Múltiples compradores pueden usar la imagen. Ideal para proyectos comerciales estándar, contenido digital, y la mayoría de casos de uso. Incluye derechos perpetuos de uso comercial sin límites de impresiones o visualizaciones.\n\n**Exclusiva:** Derechos únicos para tu proyecto. La imagen se retira permanentemente del mercado. Perfecta para campañas de marca, proyectos flagship, o cuando necesitas garantía de exclusividad visual.\n\nTodas las licencias incluyen uso comercial ilimitado, modificación permitida, y acceso de por vida para re-descargas. Tras la compra, recibes descarga inmediata de archivos full-resolution más documentación técnica y licencia legal. Soporte técnico incluido para implementación en tu proyecto.",

    // CTA Final Section
    "cta.readyToTransform": "¿Listo para Transformar tu",
    "cta.creativeVision": "Visión Creativa?",
    "cta.joinThousands": "Únete a miles de creadores que ya usan nuestras imágenes premium",
    "cta.startExploring": "Comenzar a Explorar",
  },
  en: {
    // Language reference for conditional rendering
    language: "en",
    
    // Navigation
    "nav.collection": "Collection",
    "nav.gallery": "Gallery",
    "nav.myOrders": "My Orders",

    // Hero Section
    "hero.imageOfDay": "Image of the Day",
    "hero.title": "Premium 360°",
    "hero.titleHighlight": "Imagery",
    "hero.subtitle": "Experience the quality and detail of our professional AI-generated imagery",
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
    "faq.badge": "Frequently Asked Questions",
    "faq.title": "Everything You Need to Know About",
    "faq.titleHighlight": "360° Digital Photography",
    "faq.subtitle": "Common questions about our AI-generated imagery, licensing, and technical specifications.",

    "faq.q1.title": "What is 360° photography and how does it differ from traditional images?",
    "faq.q1.answer":
      "360° photography captures a complete spherical view that allows exploring an environment in all directions. We offer equirectangular (360° x 180°) and fisheye formats, perfect for VR experiences, dome projection mapping, and immersive architectural visualization. Unlike flat photos, our 360° images let you fully immerse in digital worlds with complete spatial perspective.",

    "faq.q2.title": "How do you create your images with Artificial Intelligence? Explain the technical process.",
    "faq.q2.answer":
      "Our proprietary pipeline combines multiple advanced AI techniques developed in-house. We start with noise diffusion models that generate images from pure randomness, guided by specialized prompts and precise technical parameters. The diffusion process works iteratively: starting from pure Gaussian noise and gradually 'denoising' it to reveal coherent structures, similar to how a photograph appears in traditional chemical development.\n\nOur proprietary algorithms control every step of this process: we adjust diffusion speed, spatial coherence levels, and color fidelity to achieve results impossible with traditional methods. Then we apply neural upscaling techniques to reach up to 16K resolutions, maintaining perfect fractal details.\n\nFinally, each image undergoes algorithmic post-processing: procedural color correction, spherical projection optimization, and VR compatibility validation. This complete pipeline takes hours of computation per image, resulting in supreme quality that exceeds traditionally captured photography. The entire system has been developed from scratch by the n3uralia technical team.",

    "faq.q3.title": "What makes your image generation algorithms unique?",
    "faq.q3.answer":
      "We have developed proprietary algorithms from scratch that specifically optimize for 360° geometry and spherical projection. While standard diffusion models can create distortions at equirectangular image poles, our algorithms mathematically compensate for these distortions during generation.\n\nWe implement adaptive spatial coherence techniques that ensure perfect continuity across the 360° horizon, eliminating visible seams. Additionally, our models are trained on specialized datasets of fractal geometry and complex architectural patterns, enabling generation of structures impossible to photograph in the real world.\n\nEach image is unique: we never generate the same composition twice thanks to our controlled random seed system and infinite parametric variations. Technology developed entirely by n3uralia.",

    "faq.q4.title": "What technical specifications and formats do you offer?",
    "faq.q4.answer":
      "We deliver images in resolutions from 4K (3840×2160) up to 16K (15360×8640) in equirectangular and fisheye/dome formats. All files include:\n\n• Formats: JPEG (high quality), PNG (lossless), and TIFF on request\n• Color spaces: sRGB (standard) and ProPhoto RGB (professional)\n• Bit depth: 8-bit standard, 16-bit for HDR workflows\n• Complete XMP metadata with projection information\n• Verified compatibility with Unity, Unreal Engine, and major VR software\n\nEach image is optimized for efficient streaming in web experiences and maximum performance on VR headsets.",

    "faq.q5.title": "What projects are these 360° images ideal for?",
    "faq.q5.answer":
      "Our images are perfect for:\n\n• VR experiences and metaverse: Complete environments for Oculus, HTC Vive, PlayStation VR\n• Projection mapping: Visual shows in planetarium domes, immersive events, artistic installations\n• Architecture and real estate: Virtual tours, space visualization, project presentations\n• Audiovisual production: Backgrounds for 360° videos, YouTube VR, immersive social content\n• Gaming and simulation: Skyboxes for games, VR training environments, professional simulators\n• Digital art: 360° NFTs, virtual galleries, interactive installations\n\nThe procedural nature of our images guarantees unique scenes that don't exist in the physical world, perfect for projects seeking absolute visual differentiation.",

    "faq.q6.title": "How does licensing and the purchase process work?",
    "faq.q6.answer":
      "We offer two types of licenses:\n\n**Non-Exclusive:** Multiple buyers can use the image. Ideal for standard commercial projects, digital content, and most use cases. Includes perpetual commercial use rights with no limits on prints or views.\n\n**Exclusive:** Unique rights for your project. The image is permanently removed from the market. Perfect for brand campaigns, flagship projects, or when you need guaranteed visual exclusivity.\n\nAll licenses include unlimited commercial use, modification permitted, and lifetime access for re-downloads. After purchase, you receive immediate download of full-resolution files plus technical documentation and legal license. Technical support included for implementation in your project.",

    // CTA Final Section
    "cta.readyToTransform": "Ready to Transform Your",
    "cta.creativeVision": "Creative Vision?",
    "cta.joinThousands": "Join thousands of creators already using our premium imagery",
    "cta.startExploring": "Start Exploring",
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
