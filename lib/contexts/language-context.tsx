"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoaded: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  es: {
    // Language reference for conditional rendering
    language: "es",

    // Navigation
    "nav.collection": "Colección",
    "nav.gallery": "Galería",
    "nav.theatre": "Teatro",
    "nav.myOrders": "Mis Pedidos",
    "nav.shows": "Shows",
    "nav.environments": "Ambientes",
    "nav.studio": "Studio",
    "nav.contact": "Contacto",
    "nav.orders": "Pedidos",
    "nav.tools": "Herramientas",

    // Hero Section
    "hero.studioTitle": "Studio",
    "hero.studioSubtitle": "Construido para Ejecutar",
    "hero.studioDesc1": "Historias de domo cinemático, loops inmersivos sin costuras, y ambientes listos para VR, elaborados para operadores de domo, eventos inmersivos y performance en vivo.",
    "hero.studioDesc2": "Listo para proyección. Domo-correcto. Instantáneamente desplegable.",
    "hero.exploreStudio": "Explorar Studio",
    "hero.videoNotAvailable": "Video no disponible",

    // Shows Section
    "shows.title": "Espectáculos",
    "shows.subtitle": "Narrativas Envolventes",
    "shows.description": "Historias cautivadoras diseñadas para domo, loops inmersivos sin fin, y experiencias de performance en vivo.",
    "shows.useCase1": "Instalaciones de domo cinemático",
    "shows.useCase2": "Loops inmersivos sin costuras",
    "shows.useCase3": "Experiencias VR envolventes",
    "shows.useCase4": "Narrativas de performance en vivo",
    "shows.exploreShows": "Explorar Espectáculos",
    "shows.theatreTitle": "Théâtre",
    "shows.theatreSubtitle": "Experiencias Inmersivas",
    "shows.theatreDescription": "Explora nuestras experiencias teatrales inmersivas",
    "shows.enterTheatre": "Entrar al Théâtre",
    "shows.mythicLabel1": "Mítico",
    "shows.mythicLabel2": "Épico",
    "shows.mythicLabel3": "Narrativo",
    "shows.mythicLabel4": "Envolvente",
    "shows.mythicLabel5": "Cautivador",
    "shows.caseStudy1": "Caso de Estudio 1",
    "shows.caseStudy2": "Caso de Estudio 2",
    "shows.caseStudy3": "Caso de Estudio 3",
    "shows.caseStudy4": "Caso de Estudio 4",
    "shows.categoryAsian": "Asiático",
    "shows.categoryMesoamerican": "Mesoamericano",
    "shows.categoryGreek": "Greco",
    "shows.categoryEgyptian": "Egipcio",
    "shows.teaserTitle1": "Teaser 1",
    "shows.teaserTitle2": "Teaser 2",
    "shows.teaserTitle3": "Teaser 3",
    "shows.sampleShowTitle": "Espectáculo de Ejemplo",
    "shows.sampleShowDescription": "Descripción del espectáculo de ejemplo",
    "shows.description.chile": "Explora los extraordinarios paisajes y sitios sagrados de Chile, la nación geográficamente más diversa de América del Sur. Desde el Desierto de Atacama hasta los glaciares de la Patagonia, desde antiguos caminos incas hasta los místicos bosques de Pumalín, descubre Chile a través de múltiples colecciones inmersivas de 360°.",

    // Shows Page Specific
    "showsPage.pageTitle": "Espectáculos Inmersivos",
    "showsPage.pageSubtitle": "Narrativas Cinematográficas para Domo",
    "showsPage.descriptionDefault": "Explora nuestros espectáculos curados diseñados para instalaciones de domo y experiencias inmersivas.",
    "showsPage.perfectFor": "Perfecto para:",
    "showsPage.perfectFor1": "Instalaciones de domo cinemático",
    "showsPage.perfectFor2": "Eventos inmersivos y festivales",
    "showsPage.perfectFor3": "Performance artístico en vivo",
    "showsPage.characterDesign": "Diseño de personajes inmersivos",
    "showsPage.narrativeBuilding": "Construcción narrativa envolvente",
    "showsPage.effectsEditing": "Edición de efectos visuales de 8K",
    "showsPage.teasersTitle": "Teasers",
    "showsPage.teasersDesc1": "Explora adelantos de nuestros espectáculos más aclamados.",
    "showsPage.teasersDesc2": "Cada teaser está optimizado para proyección en domo de alta resolución.",
    "showsPage.sendEmail": "Enviar Email",
    "showsPage.whatsapp": "WhatsApp",

    // Environments Section
    "environments.landingTitle": "Ambientes Inmersivos",
    "environments.landingSubtitle": "Espacios 360° Curados",
    "environments.landingDesc1": "Sumérgete en ambientes cuidadosamente seleccionados, desde naturaleza virgen hasta arquitectura urbana.",
    "environments.landingDesc2": "Cada ambiente está optimizado para instalaciones de domo, entornos VR y experiencias inmersivas.",
    "environments.freeDemo": "Demostración Gratuita",
    "environments.viewCatalogue": "Ver Catálogo",
    "environments.oceans": "Océanos",
    "environments.volcanoes": "Volcanes",
    "environments.iceSnow": "Hielo y Nieve",
    "environments.forest": "Bosque",
    "environments.northAmerica": "América del Norte",
    "environments.southAmerica": "América del Sur",
    "environments.asia": "Asia",
    "environments.more": "Más",
    "environments.architecture": "Arquitectura",
    "environments.landscapes": "Paisajes",
    "environments.geometry": "Geometría",
    "environments.cosmic": "Cósmico",
    "environments.abstract": "Abstracto",
    "environments.mythicAsian": "Asiático",
    "environments.mythicMesoamerican": "Mesoamericano",
    "environments.mythicGreek": "Greco",
    "environments.mythicEgyptian": "Egipcio",
    "environments.natureTitle": "Naturaleza",
    "environments.natureDescription": "Explora los ambientes naturales más espectaculares de la Tierra",
    "environments.heritageTitle": "Patrimonio",
    "environments.heritageDescription": "Descubre sitios de patrimonio cultural y arquitectura icónica",
    "environments.mythicTitle": "Mítico",
    "environments.mythicDescription": "Entra en reinos de mitología e imaginación",
    "environments.artTitle": "Arte",
    "environments.artDescription": "Explora instalaciones y expresiones artísticas innovadoras",
    "environmentsPage.title": "Ambientes 360°",
    "environmentsPage.subtitle": "Espacios Inmersivos Curados",
    "environmentsPage.benefit1": "Ambientes de 8K",
    "environmentsPage.benefit2": "Listo para Domo",
    "environmentsPage.benefit3": "VR Compatible",
    "environmentsPage.back": "Atrás",
    "environmentsPage.loadMore": "Cargar Más",

    // Collections Section
    "collections.title": "Colecciones",
    "collections.titleHighlight": "360° Curadas",
    "collections.subtitle": "Explora nuestras colecciones temáticas de fotografía 360°",
    "collections.stats.collections": "Colecciones",
    "collections.stats.resolution": "Resolución 8K",
    "collections.stats.format": "Formato 360°",
    "collections.coming.soon": "Próximamente",
    "collections.coming.desc": "Nuevas colecciones están siendo curadas",
    "collections.coming.exploreImages": "Explorar Imágenes",
    "collections.subcollections": "Subcolecciones",
    "collections.format": "Formato",
    "collections.format.360": "360° Esférico",
    "collections.license": "Licencia",
    "collections.license.commercial": "Uso Comercial",
    "collections.exploreCollection": "Explorar Colección",
    "collections.individualPurchase": "Compra Individual",
    "collections.buyingSeparately": "Comprando por separado cuesta",
    "collections.bundlePrice": "Precio del Paquete",
    "collections.completeCollection": "Colección Completa",
    "collections.youSave": "Ahorras",
    "collections.viewFull": "Ver Colección Completa",
    "collections.preferIndividual": "¿Prefieres Comprar por Separado?",
    "collections.browseGallery": "Explora nuestra galería completa de imágenes",
    "collections.browseButton": "Explorar Galería",

    // Elementals Section
    "elementals.nature": "Naturaleza",
    "elementals.natureSubtitle": "ELEMENTALS.NATURESUBTITLE",
    "elementals.culture": "Cultura",
    "elementals.cultureSubtitle": "ELEMENTALS.CULTURESUBTITLE",
    "elementals.mythic": "Mítico",
    "elementals.mythicSubtitle": "ELEMENTALS.MYTHICSUBTITLE",
    "elementals.art": "Arte",
    "elementals.artSubtitle": "ELEMENTALS.ARTSUBTITLE",

    // Theatre
    "theatre.panoramicExperience": "Experiencia Panorámica",
    "theatre.defaultDescription": "Sumérgete en una experiencia inmersiva 360°",
    "theatre.noImages": "Sin imágenes disponibles",
    "theatre.checkBack": "Por favor, revisa más tarde",
    "theatre.title": "Théâtre 360°",
    "theatre.tagline1": "Experiencias Inmersivas",
    "theatre.tagline2": "Viajes Visuales",
    "theatre.tagline3": "Medios Espaciales",
    "theatre.tagline4": "Narrativas Envolventes",
    "theatre.goButton": "Entrar",

    // Header
    "header.shoppingCart": "Carrito de Compras",
    "header.cartEmpty": "Tu carrito está vacío",
    "header.checkout": "Proceder al Pago",

    // Contact Page
    "contact.back": "Atrás",
    "contact.formTitle": "Formulario de Contacto",
    "contact.sectionTitle": "Enviar Consulta Rápida",
    "contact.whatsappTitle": "WhatsApp",
    "contact.whatsappDescription": "Contáctanos y responderemos en pocas horas",
    "contact.contactNow": "Contacta Ahora",
    "contact.emailTitle": "Email",
    "contact.emailLabel": "Tu Email",
    "contact.emailPlaceholder": "tu@email.com",
    "contact.chooseOptions": "Elige una o más:",
    "contact.option1": "Me gustaría ver una demo en mi domo",
    "contact.option2": "Estoy interesado en ver un episodio completo",
    "contact.option3": "Envíame el catálogo completo",
    "contact.option4": "Quiero encargar un show personalizado",
    "contact.messageLabel": "Cuéntanos qué necesitas (Opcional)",
    "contact.messagePlaceholder": "Comparte detalles sobre tu proyecto o requisitos...",
    "contact.submitButton": "Enviar",
    "contact.submitting": "Enviando...",
    "contact.successTitle": "¡Tu visión está en camino!",
    "contact.successMessage": "Gracias por comunicarte. Estamos emocionados de explorar qué es posible para tu experiencia inmersiva. Nuestro equipo se conectará contigo pronto para dar vida a tus ideas.",
    "contact.close": "Cerrar",
  },
  en: {
    // Language reference for conditional rendering
    language: "en",

    // Navigation
    "nav.collection": "Collection",
    "nav.gallery": "Gallery",
    "nav.theatre": "Theatre",
    "nav.myOrders": "My Orders",
    "nav.shows": "Shows",
    "nav.environments": "Environments",
    "nav.studio": "Studio",
    "nav.contact": "Contact",
    "nav.orders": "Orders",
    "nav.tools": "Tools",

    // Hero Section
    "hero.studioTitle": "Studio",
    "hero.studioSubtitle": "Built for Execution",
    "hero.studioDesc1": "Cinematic dome stories, seamless immersive loops, and VR-ready environments—crafted for dome operators, immersive events, and live performance.",
    "hero.studioDesc2": "Ready for projection. Dome-correct. Instantly deployable.",
    "hero.exploreStudio": "Explore Studio",
    "hero.videoNotAvailable": "Video not available",

    // Shows Section
    "shows.title": "Shows",
    "shows.subtitle": "Enveloping Narratives",
    "shows.description": "Captivating stories designed for dome, seamless immersive loops, and live performance experiences.",
    "shows.useCase1": "Cinematic dome installations",
    "shows.useCase2": "Seamless immersive loops",
    "shows.useCase3": "Enveloping VR experiences",
    "shows.useCase4": "Live performance narratives",
    "shows.exploreShows": "Explore Shows",
    "shows.theatreTitle": "Théâtre",
    "shows.theatreSubtitle": "Immersive Experiences",
    "shows.theatreDescription": "Explore our immersive theatrical experiences",
    "shows.enterTheatre": "Enter Théâtre",
    "shows.mythicLabel1": "Mythic",
    "shows.mythicLabel2": "Epic",
    "shows.mythicLabel3": "Narrative",
    "shows.mythicLabel4": "Enveloping",
    "shows.mythicLabel5": "Captivating",
    "shows.caseStudy1": "Case Study 1",
    "shows.caseStudy2": "Case Study 2",
    "shows.caseStudy3": "Case Study 3",
    "shows.caseStudy4": "Case Study 4",
    "shows.categoryAsian": "Asian",
    "shows.categoryMesoamerican": "Mesoamerican",
    "shows.categoryGreek": "Greek",
    "shows.categoryEgyptian": "Egyptian",
    "shows.teaserTitle1": "Teaser 1",
    "shows.teaserTitle2": "Teaser 2",
    "shows.teaserTitle3": "Teaser 3",
    "shows.sampleShowTitle": "Sample Show",
    "shows.sampleShowDescription": "Sample show description",
    "shows.description.chile": "Explore the extraordinary landscapes and sacred sites of Chile, South America's most geographically diverse nation. From the Atacama Desert to Patagonian glaciers, from ancient Inca roads to mystical Pumalín forests, discover Chile through multiple immersive 360° collections.",

    // Shows Page Specific
    "showsPage.pageTitle": "Immersive Shows",
    "showsPage.pageSubtitle": "Cinematic Narratives for Dome",
    "showsPage.descriptionDefault": "Explore our curated shows designed for dome installations and immersive experiences.",
    "showsPage.perfectFor": "Perfect for:",
    "showsPage.perfectFor1": "Cinematic dome installations",
    "showsPage.perfectFor2": "Immersive events and festivals",
    "showsPage.perfectFor3": "Live artistic performance",
    "showsPage.characterDesign": "Immersive character design",
    "showsPage.narrativeBuilding": "Enveloping narrative building",
    "showsPage.effectsEditing": "8K visual effects editing",
    "showsPage.teasersTitle": "Teasers",
    "showsPage.teasersDesc1": "Explore previews of our most acclaimed shows.",
    "showsPage.teasersDesc2": "Each teaser is optimized for high-resolution dome projection.",
    "showsPage.sendEmail": "Send Email",
    "showsPage.whatsapp": "WhatsApp",

    // Environments Section
    "environments.landingTitle": "Immersive Environments",
    "environments.landingSubtitle": "Curated 360° Spaces",
    "environments.landingDesc1": "Immerse yourself in carefully curated environments, from pristine nature to urban architecture.",
    "environments.landingDesc2": "Each environment is optimized for dome installations, VR environments, and immersive experiences.",
    "environments.freeDemo": "Free Demo",
    "environments.viewCatalogue": "View Catalogue",
    "environments.oceans": "Oceans",
    "environments.volcanoes": "Volcanoes",
    "environments.iceSnow": "Ice & Snow",
    "environments.forest": "Forest",
    "environments.northAmerica": "North America",
    "environments.southAmerica": "South America",
    "environments.asia": "Asia",
    "environments.more": "More",
    "environments.architecture": "Architecture",
    "environments.landscapes": "Landscapes",
    "environments.geometry": "Geometry",
    "environments.cosmic": "Cosmic",
    "environments.abstract": "Abstract",
    "environments.mythicAsian": "Asian",
    "environments.mythicMesoamerican": "Mesoamerican",
    "environments.mythicGreek": "Greek",
    "environments.mythicEgyptian": "Egyptian",
    "environments.natureTitle": "Nature",
    "environments.natureDescription": "Explore the most spectacular natural environments on Earth",
    "environments.heritageTitle": "Heritage",
    "environments.heritageDescription": "Discover cultural heritage sites and iconic architecture",
    "environments.mythicTitle": "Mythic",
    "environments.mythicDescription": "Enter realms of mythology and imagination",
    "environments.artTitle": "Art",
    "environments.artDescription": "Explore innovative art installations and expressions",
    "environmentsPage.title": "360° Environments",
    "environmentsPage.subtitle": "Curated Immersive Spaces",
    "environmentsPage.benefit1": "8K Environments",
    "environmentsPage.benefit2": "Dome Ready",
    "environmentsPage.benefit3": "VR Compatible",
    "environmentsPage.back": "Back",
    "environmentsPage.loadMore": "Load More",

    // Collections Section
    "collections.title": "Collections",
    "collections.titleHighlight": "360° Curated",
    "collections.subtitle": "Explore our curated collections of 360° photography",
    "collections.stats.collections": "Collections",
    "collections.stats.resolution": "8K Resolution",
    "collections.stats.format": "360° Format",
    "collections.coming.soon": "Coming Soon",
    "collections.coming.desc": "New collections are being curated",
    "collections.coming.exploreImages": "Explore Images",
    "collections.subcollections": "Subcollections",
    "collections.format": "Format",
    "collections.format.360": "Spherical 360°",
    "collections.license": "License",
    "collections.license.commercial": "Commercial Use",
    "collections.exploreCollection": "Explore Collection",
    "collections.individualPurchase": "Individual Purchase",
    "collections.buyingSeparately": "Buying separately costs",
    "collections.bundlePrice": "Bundle Price",
    "collections.completeCollection": "Complete Collection",
    "collections.youSave": "You save",
    "collections.viewFull": "View Complete Collection",
    "collections.preferIndividual": "Prefer to Buy Individually?",
    "collections.browseGallery": "Browse our complete image gallery",
    "collections.browseButton": "Browse Gallery",

    // Elementals Section
    "elementals.nature": "Nature",
    "elementals.natureSubtitle": "ELEMENTALS.NATURESUBTITLE",
    "elementals.culture": "Culture",
    "elementals.cultureSubtitle": "ELEMENTALS.CULTURESUBTITLE",
    "elementals.mythic": "Mythic",
    "elementals.mythicSubtitle": "ELEMENTALS.MYTHICSUBTITLE",
    "elementals.art": "Art",
    "elementals.artSubtitle": "ELEMENTALS.ARTSUBTITLE",

    // Theatre
    "theatre.panoramicExperience": "Panoramic Experience",
    "theatre.defaultDescription": "Immerse yourself in a 360° immersive experience",
    "theatre.noImages": "No images available",
    "theatre.checkBack": "Please check back later",
    "theatre.title": "360° Théâtre",
    "theatre.tagline1": "Immersive Experiences",
    "theatre.tagline2": "Visual Journeys",
    "theatre.tagline3": "Spatial Media",
    "theatre.tagline4": "Enveloping Narratives",
    "theatre.goButton": "Enter",

    // Header
    "header.shoppingCart": "Shopping Cart",
    "header.cartEmpty": "Your cart is empty",
    "header.checkout": "Proceed to Checkout",

    // Contact Page
    "contact.back": "Back",
    "contact.formTitle": "Contact Form",
    "contact.sectionTitle": "Submit Fast Inquiry",
    "contact.whatsappTitle": "WhatsApp",
    "contact.whatsappDescription": "Contact us and we will reply within few hours",
    "contact.contactNow": "Contact Now",
    "contact.emailTitle": "Email",
    "contact.emailLabel": "Your Email",
    "contact.emailPlaceholder": "your@email.com",
    "contact.chooseOptions": "Choose one or more:",
    "contact.option1": "I would like to see a demo in my dome",
    "contact.option2": "I am interested in watching a full episode",
    "contact.option3": "Send me the complete catalogue",
    "contact.option4": "I want to commission a custom show",
    "contact.messageLabel": "Tell us what you need (Optional)",
    "contact.messagePlaceholder": "Share any details about your project or requirements...",
    "contact.submitButton": "Submit",
    "contact.submitting": "Submitting...",
    "contact.successTitle": "Your vision is on its way!",
    "contact.successMessage": "Thank you for reaching out. We're excited to explore what's possible for your immersive experience. Our team will connect with you shortly to bring your ideas to life.",
    "contact.close": "Close",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isLoaded, setIsLoaded] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const langParam = searchParams?.get("lang") as Language | null
    if (langParam && (langParam === "es" || langParam === "en")) {
      setLanguageState(langParam)
      localStorage.setItem("language", langParam)
    } else {
      const savedLang = localStorage.getItem("language") as Language | null
      if (savedLang && (savedLang === "es" || savedLang === "en")) {
        setLanguageState(savedLang)
      }
    }
    setIsLoaded(true)
  }, [searchParams])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    // Default to English if language is undefined or invalid
    const validLanguage = (language === "es" || language === "en") ? language : "en"
    const translationObj = translations[validLanguage as keyof typeof translations]
    if (!translationObj) {
      // Fallback to English if even that fails
      const enObj = translations.en
      return enObj?.[key as keyof typeof enObj] || key
    }
    return translationObj[key as keyof typeof translationObj] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
