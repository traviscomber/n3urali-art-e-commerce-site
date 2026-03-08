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
    "shows.theatreTitle": "Théâtre",
    "shows.theatreSubtitle": "Experiencias Inmersivas",
    "shows.theatreDescription": "Explora nuestras experiencias teatrales inmersivas",
    "shows.enterTheatre": "Entrar al Théâtre",

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
    "shows.theatreTitle": "Théâtre",
    "shows.theatreSubtitle": "Immersive Experiences",
    "shows.theatreDescription": "Explore our immersive theatrical experiences",
    "shows.enterTheatre": "Enter Théâtre",

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
