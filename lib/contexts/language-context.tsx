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
