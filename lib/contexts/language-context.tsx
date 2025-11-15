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

    "faq.q1.title": "¿Qué es la fotografía 360° y en qué se diferencia de la fotografía regular?",
    "faq.q1.answer":
      "La fotografía 360° captura una vista esférica completa de un entorno, permitiendo a los espectadores mirar en cualquier dirección. A diferencia de la fotografía regular que captura una sola perspectiva, las imágenes 360° proporcionan una experiencia inmersiva donde puedes explorar toda la escena. Nuestras imágenes 360° generadas por IA se crean en formatos equirectangulares y ojo de pez, haciéndolas perfectas para aplicaciones VR, mapeo de proyección y visualización arquitectónica.",

    "faq.q2.title": "¿Cómo pueden las imágenes generadas por IA igualar la calidad de la fotografía profesional?",
    "faq.q2.answer":
      "Nuestro proceso propietario de generación y mejora por IA crea imágenes que a menudo superan la calidad de la fotografía tradicional. Cada imagen se genera desde cero utilizando herramientas personalizadas, luego se mejora mediante post-procesamiento profesional. Este enfoque nos permite crear escenas únicas con iluminación, composición y detalle perfectos que serían imposibles o extremadamente costosos de capturar con métodos tradicionales. El resultado es una calidad suprema de imágenes en resolución 4K-16K.",

    "faq.q3.title": "¿Qué opciones de licencia están disponibles y cuál debo elegir?",
    "faq.q3.answer":
      "Ofrecemos opciones de licencia tanto exclusivas como no exclusivas. Las licencias no exclusivas son perfectas para la mayoría de los proyectos comerciales y permiten que múltiples compradores usen la misma imagen. Las licencias exclusivas te dan derechos exclusivos para usar la imagen, haciéndolas ideales para campañas de marca o proyectos únicos donde la exclusividad es importante. Todas las licencias incluyen derechos de uso comercial para mapeo de proyección, experiencias VR, visualización arquitectónica y creación de contenido digital.",

    "faq.q4.title": "¿Qué especificaciones técnicas y formatos proporcionan?",
    "faq.q4.answer":
      "Todas las imágenes están disponibles en formatos de alta resolución que van desde 4K hasta 16K. Proporcionamos formatos tanto equirectangulares (360° x 180°) como ojo de pez para garantizar la compatibilidad con varias plataformas VR, sistemas de proyección y aplicaciones de software. Las imágenes se entregan en formatos estándar (JPEG, PNG) con metadatos completos y están optimizadas para uso inmediato en flujos de trabajo profesionales.",

    "faq.q5.title": "¿Cuáles son los mejores casos de uso para imágenes 360°?",
    "faq.q5.answer":
      "Las imágenes 360° son perfectas para experiencias VR, tours virtuales, instalaciones de mapeo de proyección, visualización arquitectónica, desarrollo de juegos, campañas de marketing inmersivas y contenido educativo. Los creadores de contenido usan nuestras imágenes para videos YouTube 360°, campañas en redes sociales y presentaciones interactivas. Los desarrolladores las integran en aplicaciones VR, juegos y software de simulación. La naturaleza inmersiva las hace ideales para cualquier proyecto que requiera narración ambiental o presencia espacial.",

    "faq.q6.title": "¿Cómo funciona el proceso de descarga y compra?",
    "faq.q6.answer":
      "Navega nuestra galería con vistas previas 360° interactivas, selecciona las imágenes deseadas, elige tu opción de licencia y completa la compra. Las descargas están disponibles inmediatamente después de la confirmación del pago. Recibirás archivos de alta resolución junto con documentación de licencia y especificaciones técnicas. Todas las compras incluyen acceso de por vida para volver a descargar tus archivos, y proporcionamos soporte al cliente para cualquier pregunta técnica sobre la implementación.",

    // Final CTA
    "cta.final.title": "¿Listo para Transformar Tu",
    "cta.final.titleHighlight": "Visión Creativa?",
    "cta.final.subtitle":
      "Únete a miles de profesionales que confían en n3uralia360.art y el grupo n3uralia para fotografía digital 360° premium y soluciones de imágenes inmersivas.",
    "cta.final.button": "Comenzar a Explorar",

    // Cart
    "cart.title": "Carrito de Compras",
    "cart.empty": "Tu carrito está vacío",
    "cart.emptySubtext": "Agrega algunas imágenes increíbles a tu carrito",
    "cart.continueShopping": "Continuar Comprando",
    "cart.subtotal": "Subtotal",
    "cart.checkout": "Ir al Pago",
    "cart.remove": "Eliminar",
    "cart.addToCart": "Agregar al Carrito",

    // User Menu
    "user.profile": "Perfil",
    "user.downloads": "Mis Descargas",
    "user.orders": "Mis Pedidos",
    "user.admin": "Panel Admin",
    "user.signOut": "Cerrar Sesión",
    "user.signIn": "Iniciar Sesión",

    // Gallery
    "gallery.title": "Colección Completa",
    "gallery.subtitle": "Explora nuestro catálogo completo de imágenes profesionales",
    "gallery.filterByTags": "Filtrar por Etiquetas",
    "gallery.searchImages": "Buscar imágenes...",
    "gallery.allCategories": "Todas las Categorías",
    "gallery.newestFirst": "Más Recientes",
    "gallery.showing": "Mostrando",
    "gallery.of": "de",
    "gallery.images": "imágenes",

    // Footer
    "footer.description":
      "Imágenes 360° premium generadas por IA para VR, mapeo de proyección y visualización arquitectónica.",
    "footer.rights": "Todos los derechos reservados.",
    "footer.platform": "Parte del grupo n3uralia - Plataforma de imágenes de calidad suprema",
    "footer.quickLinks": "Enlaces Rápidos",
    "footer.legal": "Legal",
    "footer.terms": "Términos de Servicio",
    "footer.privacy": "Política de Privacidad",
    "footer.licensing": "Información de Licencias",
    "footer.contact": "Contacto",
    "footer.support": "Soporte",
    "footer.about": "Acerca de",

    premiumCollection: "Colección Premium",
    curatedImages: "20 Imágenes 360° Seleccionadas",
    viewCompleteCollection: "Ver Colección Completa",
    flashAuction: "Subasta Relámpago",
    catchBestPrices: "Atrapa los Mejores Precios",
    pricesDropEveryMinute: "Los precios bajan cada minuto hasta el próximo reinicio horario",
    pricesResetEveryHour: "Los precios se reinician cada hora",
    imageOfTheDay: "Imagen del Día",
    premium360Imagery: "Imágenes 360° Premium",
    experienceQuality: "Experimenta la calidad y detalle de nuestras imágenes profesionales",
    ultraHighResolution: "Ultra Alta Resolución",
    "20PercentOffToday": "20% DCTO Hoy",
    viewDetailsPrice: "Ver Detalles y Precio",
    "15PercentOff": "15% DCTO",
    collection: "Colección",
    completeBundle: "Paquete Completo",
    viewCollection: "Ver Colección",
    gallery: "Galería",
    browseAllImages: "Explorar Todas las Imágenes",
    premiumImages: "Imágenes Premium",
    browseGallery: "Explorar Galería",
    signIn: "Iniciar Sesión",
    instantDownloadAccess: "Acceso instantáneo a descargas",
    downloadAccess: "Acceso a descargas",
    downloadAfterPurchase: "Descarga después de comprar",
    perfectForImmersive: "Perfecto para experiencias inmersivas",
    featuredGallery: "Galería Destacada",
    exploreOurPremium: "Explora Nuestra Colección Premium",
    browseOurCurated: "Navega nuestra selección curada de imágenes",
    faq: "Preguntas Frecuentes",
    everythingYouNeed: "Todo lo que Necesitas Saber",
    commonQuestions: "Preguntas comunes sobre nuestras imágenes",
    faqQ1: "¿Qué es la fotografía 360°?",
    faqA1:
      "La fotografía 360° captura una vista esférica completa de un entorno, perfecta para VR y mapeo de proyección.",
    faqQ2: "¿Cómo pueden las imágenes IA igualar la calidad profesional?",
    faqA2: "Nuestro proceso propietario de IA crea imágenes que superan la fotografía tradicional con calidad suprema.",
    faqQ3: "¿Qué opciones de licencia están disponibles?",
    faqA3: "Ofrecemos licencias exclusivas y no exclusivas para diferentes necesidades de proyecto.",
    faqQ4: "¿Qué especificaciones técnicas proporcionan?",
    faqA4: "Todas las imágenes están disponibles en formatos de alta resolución de 4K a 16K.",
    faqQ5: "¿Cuáles son los mejores casos de uso?",
    faqA5: "Perfecto para experiencias VR, tours virtuales, mapeo de proyección y visualización arquitectónica.",
    faqQ6: "¿Cómo funciona el proceso de compra?",
    faqA6: "Las descargas están disponibles inmediatamente después de la confirmación del pago.",
    readyToTransform: "¿Listo para Transformar Tu",
    creativeVision: "Visión Creativa?",
    joinThousands: "Únete a miles de profesionales que confían en n3uralia360.art",
    startExploring: "Comenzar a Explorar",
    dailySelection: "Selección Diaria",
    todaysFeaturedImages: "Imágenes Destacadas de Hoy",
    handpickedImages: "Imágenes seleccionadas especialmente para ti",
    noImagesAvailable: "No hay imágenes disponibles",
    checkBackSoon: "Vuelve pronto para nuevas imágenes",
    viewDetails: "Ver Detalles",
    "4Kto16K": "4K a 16K",
    "360Degrees": "360°",
  },
  en: {
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

    "faq.q1.title": "What is 360° photography and how is it different from regular photography?",
    "faq.q1.answer":
      "360° photography captures a complete spherical view of an environment, allowing viewers to look in any direction. Unlike regular photography that captures a single perspective, 360° images provide an immersive experience where you can explore the entire scene. Our AI-generated 360° images are created in equirectangular and fisheye formats, making them perfect for VR applications, projection mapping, and architectural visualization.",

    "faq.q2.title": "How can AI-generated images match professional photography quality?",
    "faq.q2.answer":
      "Our proprietary AI generation and enhancement pipeline creates images that often exceed traditional photography quality. Every image is generated from scratch using custom-built tools, then enhanced through professional post-processing. This approach allows us to create unique scenes with perfect lighting, composition, and detail that would be impossible or extremely expensive to capture with traditional methods. The result is supreme quality 4K-16K resolution imagery.",

    "faq.q3.title": "What licensing options are available and which should I choose?",
    "faq.q3.answer":
      "We offer both exclusive and non-exclusive licensing options. Non-exclusive licenses are perfect for most commercial projects and allow multiple buyers to use the same image. Exclusive licenses give you sole rights to use the image, making it ideal for brand campaigns or unique projects where exclusivity is important. All licenses include commercial usage rights for projection mapping, VR experiences, architectural visualization, and digital content creation.",

    "faq.q4.title": "What technical specifications and formats do you provide?",
    "faq.q4.answer":
      "All images are available in high-resolution formats ranging from 4K to 16K resolution. We provide both equirectangular (360° x 180°) and fisheye formats to ensure compatibility with various VR platforms, projection systems, and software applications. Images are delivered in standard formats (JPEG, PNG) with full metadata and are optimized for immediate use in professional workflows.",

    "faq.q5.title": "What are the best use cases for 360° imagery?",
    "faq.q5.answer":
      "360° imagery is perfect for VR experiences, virtual tours, projection mapping installations, architectural visualization, game development, immersive marketing campaigns, and educational content. Content creators use our images for YouTube 360° videos, social media campaigns, and interactive presentations. Developers integrate them into VR applications, games, and simulation software. The immersive nature makes them ideal for any project requiring environmental storytelling or spatial presence.",

    "faq.q6.title": "How does the download and purchase process work?",
    "faq.q6.answer":
      "Browse our gallery with interactive 360° previews, select your desired images, choose your licensing option, and complete the purchase. Downloads are available immediately after payment confirmation. You'll receive high-resolution files along with licensing documentation and technical specifications. All purchases include lifetime access to re-download your files, and we provide customer support for any technical questions about implementation.",

    // Final CTA
    "cta.final.title": "Ready to Transform Your",
    "cta.final.titleHighlight": "Creative Vision?",
    "cta.final.subtitle":
      "Join thousands of professionals who trust n3uralia360.art and the n3uralia group for premium 360° digital photography and immersive imagery solutions.",
    "cta.final.button": "Start Exploring",

    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.emptySubtext": "Add some amazing images to your cart",
    "cart.continueShopping": "Continue Shopping",
    "cart.subtotal": "Subtotal",
    "cart.checkout": "Checkout",
    "cart.remove": "Remove",
    "cart.addToCart": "Add to Cart",

    // User Menu
    "user.profile": "Profile",
    "user.downloads": "My Downloads",
    "user.orders": "My Orders",
    "user.admin": "Admin Dashboard",
    "user.signOut": "Sign Out",
    "user.signIn": "Sign In",

    // Gallery
    "gallery.title": "Complete Collection",
    "gallery.subtitle": "Browse our entire catalog of professional images",
    "gallery.filterByTags": "Filter by Tags",
    "gallery.searchImages": "Search images...",
    "gallery.allCategories": "All Categories",
    "gallery.newestFirst": "Newest First",
    "gallery.showing": "Showing",
    "gallery.of": "of",
    "gallery.images": "images",

    // Footer
    "footer.description":
      "Premium AI-generated 360° imagery for VR, projection mapping, and architectural visualization.",
    "footer.rights": "All rights reserved.",
    "footer.platform": "Part of the n3uralia group - Supreme quality imagery platform",
    "footer.quickLinks": "Quick Links",
    "footer.legal": "Legal",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.licensing": "Licensing Info",
    "footer.contact": "Contact",
    "footer.support": "Support",
    "footer.about": "About",

    premiumCollection: "Premium Collection",
    curatedImages: "20 Curated 360° Images",
    viewCompleteCollection: "View Complete Collection",
    flashAuction: "Flash Auction",
    catchBestPrices: "Catch the Best Prices",
    pricesDropEveryMinute: "Prices drop every minute until the next hourly reset",
    pricesResetEveryHour: "Prices reset every hour",
    imageOfTheDay: "Image of the Day",
    premium360Imagery: "Premium 360° Imagery",
    experienceQuality: "Experience the quality and detail of our professional images",
    ultraHighResolution: "Ultra High Resolution",
    "20PercentOffToday": "20% OFF Today",
    viewDetailsPrice: "View Details & Price",
    "15PercentOff": "15% OFF",
    collection: "Collection",
    completeBundle: "Complete Bundle",
    viewCollection: "View Collection",
    gallery: "Gallery",
    browseAllImages: "Browse All Images",
    premiumImages: "Premium Images",
    browseGallery: "Browse Gallery",
    signIn: "Sign In",
    instantDownloadAccess: "Instant download access",
    downloadAccess: "Download Access",
    downloadAfterPurchase: "Download after purchase",
    perfectForImmersive: "Perfect for immersive experiences",
    featuredGallery: "Featured Gallery",
    exploreOurPremium: "Explore Our Premium Collection",
    browseOurCurated: "Browse our curated selection of images",
    faq: "FAQ",
    everythingYouNeed: "Everything You Need to Know",
    commonQuestions: "Common questions about our imagery",
    faqQ1: "What is 360° photography?",
    faqA1: "360° photography captures a complete spherical view, perfect for VR and projection mapping.",
    faqQ2: "How can AI images match professional quality?",
    faqA2: "Our proprietary AI pipeline creates images that exceed traditional photography with supreme quality.",
    faqQ3: "What licensing options are available?",
    faqA3: "We offer both exclusive and non-exclusive licenses for different project needs.",
    faqQ4: "What technical specifications do you provide?",
    faqA4: "All images are available in high-resolution formats ranging from 4K to 16K.",
    faqQ5: "What are the best use cases?",
    faqA5: "Perfect for VR experiences, virtual tours, projection mapping, and architectural visualization.",
    faqQ6: "How does the purchase process work?",
    faqA6: "Downloads are available immediately after payment confirmation.",
    readyToTransform: "Ready to Transform Your",
    creativeVision: "Creative Vision?",
    joinThousands: "Join thousands of professionals who trust n3uralia360.art",
    startExploring: "Start Exploring",
    dailySelection: "Daily Selection",
    todaysFeaturedImages: "Today's Featured Images",
    handpickedImages: "Handpicked images just for you",
    noImagesAvailable: "No images available",
    checkBackSoon: "Check back soon for new images",
    viewDetails: "View Details",
    "4Kto16K": "4K to 16K",
    "360Degrees": "360°",
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
