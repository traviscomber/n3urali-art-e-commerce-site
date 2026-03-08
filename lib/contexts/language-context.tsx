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

    // Footer
    "footer.brandDescription": "Estudio de medios inmersivos culturales que crea experiencias en instalaciones de domo, entornos de VR y medios espaciales.",
    "footer.available247": "Disponible 24/7",
    "footer.exploreTitle": "Explorar",
    "footer.gallery": "Galería",
    "footer.collections": "Colecciones",
    "footer.allWorks": "Todas las Obras",
    "footer.theatreMode": "Modo Teatro",
    "footer.aboutTitle": "Acerca de",
    "footer.aboutN3uralia": "Acerca de N3uralia360",
    "footer.studioProcess": "Proceso del Estudio",
    "footer.commission": "Comisión",
    "footer.contact": "Contacto",
    "footer.legalTitle": "Legal",
    "footer.licensingTerms": "Términos de Licencia",
    "footer.licensingContract": "Contrato de Licencia",
    "footer.accountTitle": "Cuenta",
    "footer.profile": "Perfil",
    "footer.orders": "Pedidos",
    "footer.downloads": "Descargas",
    "footer.settings": "Configuración",
    "footer.copyright": "© {year} N3uralia360. Todos los derechos reservados.",
    "footer.poweredBy": "Impulsado por N3uralia360 Studios",

    // Hero Section
    "hero.badge": "Inmersivo. Cultural. Autoral.",
    "hero.title": "Mundos Inmersivos.",
    "hero.titleHighlight": "Historias Culturales.",
    "hero.subtitle":
      "N3uralia360 es un estudio de medios inmersivos culturales. Autorizamos experiencias a través de instalaciones domo, ambientes VR, loops de performance y medios espaciales. Cada trabajo comienza con investigación cultural profunda y se desarrolla a través de visión artística colaborativa.",
    "hero.description":
      "Desde preservación de patrimonio hasta futuros especulativos, desde comisiones institucionales hasta colecciones públicas curadas—creamos narrativas inmersivas que trascienden fronteras y comprometen audiencias en la intersección de cultura, arte y tecnología.",
    "hero.cta.explore": "Explorar Obras",
    "hero.cta.demo": "Ver Nuestro Estudio",
    "hero.videoPlaceholder": "[ Trasfondo de Ambiente Inmersivo ]",

    "hero.imageOfDay": "Obra Destacada",
    "hero.viewDetails": "Ver Detalles y Licencia",
    "hero.offToday": "% Disponible",

    // Homepage Hero Section
    "hero.studioTitle": "Studio",
    "hero.studioSubtitle": "Construido para Ejecutar",
    "hero.studioDesc1": "Historias de domo cinemático, loops inmersivos sin costuras, y ambientes listos para VR — elaborados para operadores de domo, eventos inmersivos y performance en vivo.",
    "hero.studioDesc2": "Listo para proyección. Domo-correcto. Instantáneamente deployable.",
    "hero.exploreStudio": "Explorar Studio",
    "hero.videoNotAvailable": "Video no disponible",

    // Shows Section - Landing Page
    "shows.title": "Shows",
    "shows.subtitle": "Historias de Domo Cinemático",
    "shows.description": "Diseñados como mini-shows que mantienen la atención del público de principio a fin, nuestros Shows son perfectos para:",
    "shows.useCase1": "Programación de domo escolar",
    "shows.useCase2": "Segmentos principales de festival",
    "shows.useCase3": "Presentaciones inmersivas con marca",
    "shows.useCase4": "Aperturas de eventos temáticos",
    "shows.exploreShows": "Explorar Shows",

    // Shows Page - Detailed Page
    "showsPage.pageTitle": "Shows",
    "showsPage.pageSubtitle": "Historias de Domo Cinemático",
    "showsPage.descriptionDefault": "De reinos míticos a atmósferas sagradas, sumérgete en historias de maravilla.",
    "showsPage.perfectFor": "Perfecto para:",
    "showsPage.perfectFor1": "Noches de domo familiar",
    "showsPage.perfectFor2": "Programación cultural",
    "showsPage.perfectFor3": "Eventos enfocados en arte y experiencias",
    "showsPage.teasersTitle": "Teasers:",
    "showsPage.teasersDesc1": "Shows de larga duración y ediciones para domo disponibles. Si estás interesado en un episodio específico o deseas encargar una producción personalizada, contacta a nuestro equipo.",
    "showsPage.teasersDesc2": "Desarrollamos contenido inmersivo de concepto a entrega final.",
    "showsPage.characterDesign": "Diseño de personajes original y consistente",
    "showsPage.narrativeBuilding": "Construcción narrativa y visual cohesiva",
    "showsPage.effectsEditing": "Edición de escenas dinámica con efectos especiales",
    "showsPage.sendEmail": "Enviar Email",
    "showsPage.whatsapp": "WhatsApp",
    "showsPage.loadMore": "Cargar Más",

    // Shows Page - Mythic Labels
    "shows.mythicLabel1": "Presencia del Tayukú",
    "shows.mythicLabel2": "Halloween en Ciudad Lego",
    "shows.mythicLabel3": "Ritual Vibrante de Nueva Caledonia",
    "shows.mythicLabel4": "Hages del Océano Azul",
    "shows.mythicLabel5": "Espíritu del Viento Furioso",

    // Shows Page - Mythic Categories
    "shows.categoryAsian": "Asiático",
    "shows.categoryMesoamerican": "Mesoamericano",
    "shows.categoryGreek": "Griego",
    "shows.categoryEgyptian": "Egipcio",

    // Shows Page - Teaser Titles
    "shows.teaserTitle1": "Video Teaser 1",
    "shows.teaserTitle2": "Video Teaser 2",
    "shows.teaserTitle3": "Video Teaser 3",

    // Shows Page - Sample Show Data
    "shows.sampleShowTitle": "Conoce a Mosey — Guía del Nilo, Multiverso",
    "shows.sampleShowDescription": "De reinos míticos a atmósferas sagradas, sumérgete en historias de maravilla.",

    // Shows Collections - Database Descriptions
    "shows.description.chile": "Explora los paisajes extraordinarios y sitios sagrados de Chile, la nación más geográficamente diversa de América del Sur. Desde el Desierto de Atacama hasta los glaciares patagónicos, desde antiguas rutas incas hasta bosques místicos de Puma​ín, descubre Chile a través de múltiples colecciones inmersivas 360°.",

    // Environments Section - Landing Page
    "environments.landingTitle": "Ambientes",
    "environments.landingSubtitle": "Fondos Inmersivos Infinitos",
    "environments.landingDesc1": "Los Ambientes son loops inmersivos continuos elaborados utilizando movimiento profesional sintonizado específicamente para la percepción de domo.",
    "environments.landingDesc2": "Cuando necesitas atmósfera y flexibilidad",
    "environments.freeDemo": "Demo GRATIS",
    "environments.viewCatalogue": "Ver Catálogo",

    // Elementals Section
    "elementals.nature": "Naturaleza",
    "elementals.natureSubtitle": "Fuerzas Elementales",
    "elementals.mythic": "Mítico",
    "elementals.mythicSubtitle": "Mundos Legendarios",
    "elementals.art": "Arte",
    "elementals.artSubtitle": "Expresión Creativa",
    "elementals.culture": "Cultura",
    "elementals.cultureSubtitle": "Patrimonio e Historias",

    // Grand Finale Section
    "finale.heading": "¿Listo para Experimentar\nlo Imposible?",
    "finale.description": "Entra en mundos más allá de la imaginación. Experiencias de domo diseñadas para trascender fronteras y cautivar audiencias.",
    "finale.exploreAll": "Explorar Todas las Experiencias",
    "finale.learnStudio": "Aprende Sobre Studio",

    // Theatre Page
    "theatre.title": "Teatro",
    "theatre.tagline1": "Sumérgete. Sin requisitos especiales",
    "theatre.tagline2": "Pantalla más grande, mejor experiencia",
    "theatre.tagline3": "Un Catálogo Inmersivo Viviente",
    "theatre.tagline4": "Se lanzan nuevos mundos regularmente",
    "theatre.noImages": "Sin Imágenes Equirectangulares Disponibles",
    "theatre.checkBack": "Vuelve pronto para experiencias inmersivas 360°.",
    "theatre.clickGo": "Haz clic en GO para explorar en 360°",
    "theatre.defaultDescription": "Explora esta experiencia panorámica inmersiva",
    "theatre.panoramicExperience": "Experiencia Panorámica",
    "theatre.goButton": "GO",
    "theatre.ariaLabelPrevious": "Previous panorama",
    "theatre.ariaLabelNext": "Next panorama",
    "theatre.ariaLabelPanorama": "Go to panorama {index}",

    // Theatre Panorama Titles & Descriptions
    "theatre.panorama.aurora": "Aurora Borealis Ice Formations",
    "theatre.panorama.auroraDesc": "Mystical arctic scene with fractal-like ice formations and aurora borealis effect. Blending crystalline structures in blues, whites, and creams with ethereal northern lights.",
    "theatre.panorama.glacial": "Glacial Valley Aurora",
    "theatre.panorama.glacialDesc": "Aerial view of glacial formations showing flowing ice patterns in deep blues, whites, and browns. Capturing the dynamic nature of glacier movement.",
    "theatre.panorama.abstractMountain": "Abstract Mountain Ice Vortex",
    "theatre.panorama.abstractMountainDesc": "Surreal abstract landscape blending snow-capped mountains with organic flowing patterns in white, brown, and gold stripes.",
    "theatre.panorama.radiantIce": "Radiant Ice Cave",
    "theatre.panorama.radiantIceDesc": "Dramatic ice cave environment with radiating golden sunlight creating starburst effects through layered blue and white ice formations.",
    "theatre.panorama.crystalline": "Crystalline Ice Shards",
    "theatre.panorama.crystallineDesc": "Abstract crystalline ice formations and flowing patterns photographed panoramically with intricate details in ultra high-resolution.",
    "theatre.panorama.immersiveWorlds": "Immersive Worlds - Panoramic View",
    "theatre.panorama.immersiveWorldsDesc": "Explore boundless digital realms in 360 degrees",
    "theatre.panorama.culturalJourneys": "Cultural Journeys - Indo Expedition",
    "theatre.panorama.culturalJourneysDesc": "Stories from around the world in immersive 360 panorama",
    "theatre.panorama.digitalArt": "Digital Art - Contemporary Expression",
    "theatre.panorama.digitalArtDesc": "Contemporary artistic expressions in 360 immersive format",

    // Environments Section
    "environments.landingTitle": "Environments",
    "environments.landingSubtitle": "Endless Immersive Backdrops",
    "environments.landingDesc1": "Environments are continuous immersive loops crafted using professional motion tuned specifically for dome perception.",
    "environments.landingDesc2": "When you need atmosphere and flexibility",
    "environments.freeDemo": "FREE Demo",
    "environments.viewCatalogue": "View Catalogue",

    // Elementals Section
    "elementals.nature": "Nature",
    "elementals.natureSubtitle": "Elemental Forces",
    "elementals.mythic": "Mythic",
    "elementals.mythicSubtitle": "Legendary Worlds",
    "elementals.art": "Art",
    "elementals.artSubtitle": "Creative Expression",
    "elementals.culture": "Culture",
    "elementals.cultureSubtitle": "Heritage & Stories",

    // Grand Finale Section
    "finale.heading": "Ready to Experience\nthe Impossible?",
    "finale.description": "Step into worlds beyond imagination. Dome experiences designed to transcend boundaries and captivate audiences.",
    "finale.exploreAll": "Explore All Experiences",
    "finale.learnStudio": "Learn About Studio",

    // Theatre Page
    "theatre.title": "Theatre",
    "theatre.tagline1": "Immerse yourself. No special requirements",
    "theatre.tagline2": "Bigger screen brings better experience",
    "theatre.tagline3": "A Living Immersive Catalog",
    "theatre.tagline4": "New worlds are released regularly",
    "theatre.noImages": "No Equirectangular Images Available",
    "theatre.checkBack": "Check back soon for immersive 360° experiences.",
    "theatre.clickGo": "Click GO to explore in 360°",
    "theatre.defaultDescription": "Explore this immersive panoramic experience",
    "theatre.panoramicExperience": "Panoramic Experience",
    "theatre.goButton": "GO",
    "theatre.ariaLabelPrevious": "Panorama anterior",
    "theatre.ariaLabelNext": "Siguiente panorama",
    "theatre.ariaLabelPanorama": "Ir al panorama {index}",

    // Theatre Panorama Titles & Descriptions (Spanish)
    "theatre.panorama.aurora": "Formaciones de Aurora Boreal de Hielo",
    "theatre.panorama.auroraDesc": "Escena ártica mística con formaciones de hielo fractales y efecto de aurora boreal. Mezclando estructuras cristalinas en azules, blancos y cremas con luces del norte etéreas.",
    "theatre.panorama.glacial": "Aurora del Valle Glacial",
    "theatre.panorama.glacialDesc": "Vista aérea de formaciones glaciales mostrando patrones de flujo de hielo en azules profundos, blancos y marrones. Capturando la naturaleza dinámica del movimiento del glaciar.",
    "theatre.panorama.abstractMountain": "Vórtice de Hielo de Montaña Abstracto",
    "theatre.panorama.abstractMountainDesc": "Paisaje surreal que mezcla montañas cubiertas de nieve con patrones orgánicos fluidos en rayas blancas, marrones y doradas.",
    "theatre.panorama.radiantIce": "Cueva de Hielo Radiante",
    "theatre.panorama.radiantIceDesc": "Dramático ambiente de cueva de hielo con luz solar dorada radiante creando efectos de ráfaga a través de formaciones de hielo azul y blanco estratificadas.",
    "theatre.panorama.crystalline": "Fragmentos de Hielo Cristalino",
    "theatre.panorama.crystallineDesc": "Formaciones de hielo cristalino abstracto y patrones de flujo fotografiados panorámicamente con detalles intrincados en resolución ultra alta.",
    "theatre.panorama.immersiveWorlds": "Mundos Inmersivos - Vista Panorámica",
    "theatre.panorama.immersiveWorldsDesc": "Explora reinos digitales sin límites en 360 grados",
    "theatre.panorama.culturalJourneys": "Viajes Culturales - Expedición Indo",
    "theatre.panorama.culturalJourneysDesc": "Historias de alrededor del mundo en panorama inmersivo 360",
    "theatre.panorama.digitalArt": "Arte Digital - Expresión Contemporánea",
    "theatre.panorama.digitalArtDesc": "Expresiones artísticas contemporáneas en formato inmersivo 360",

    // Studio Page - Life Gallery & Team
    "studio.lifeGalleryTitle": "Galería de Vida",
    "studio.lifeGalleryDescription": "Detrás de cámaras y nuestro contenido viviendo en la realidad física.",
    "studio.juanBio": "Lidera el desarrollo de IA, sistemas generativos y arquitectura de producción inmersiva.",
    "studio.irinaBio": "Define la identidad visual y cura cada mundo en una experiencia inmersiva cohesiva.",
    "studio.galleryPrevious": "Elemento de galería anterior",
    "studio.galleryNext": "Siguiente elemento de galería",

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

    // Studio Page - Life Gallery & Team
    "studio.lifeGalleryTitle": "Life Gallery",
    "studio.lifeGalleryDescription": "Behind the scenes and our content living among physical reality.",
    "studio.juanBio": "Leads AI development, generative systems, and immersive production architecture.",
    "studio.irinaBio": "Shapes visual identity, and curates each world into a cohesive immersive experience.",
    "studio.galleryPrevious": "Previous gallery item",
    "studio.galleryNext": "Next gallery item",

    // Environments Page - Main
    "environmentsPage.title": "Environments",
    "environmentsPage.subtitle": "Seamless dome loops designed to charm.",
    "environmentsPage.benefit1": "Endless themed nights without rebuilding your show",
    "environmentsPage.benefit2": "Clean, seamless material ready to layer and mix",
    "environmentsPage.benefit3": "Ambient premium visuals that elevate any space",
    "environmentsPage.back": "Back",
    "environmentsPage.loadMore": "Load More",
    
    // Environments Page - Nature Categories
    "environments.oceans": "Oceans",
    "environments.volcanoes": "Volcanoes",
    "environments.forest": "Forest",
    "environments.iceSnow": "Ice and Snow",
    
    // Environments Page - Heritage Categories
    "environments.northAmerica": "North America",
    "environments.southAmerica": "South America",
    "environments.asia": "Asia",
    "environments.more": "More",
    
    // Environments Page - Art Categories
    "environments.architecture": "Architecture",
    "environments.landscapes": "Landscapes",
    "environments.geometry": "Geometry",
    "environments.cosmic": "Cosmic",
    "environments.abstract": "Abstract",
    
    // Environments Page - Art Labels
    "environments.artLabel1": "Origami Jungle",
    "environments.artLabel2": "Cyber Tree",
    "environments.artLabel3": "Emerald Mandala",
    "environments.artLabel4": "Sky with Diamonds",
    "environments.artLabel5": "Prismatic Sky",
    
    // Environments Page - Mythic Categories
    "environments.mythicAsian": "Asian",
    "environments.mythicMesoamerican": "Mesoamerican",
    "environments.mythicGreek": "Greek",
    "environments.mythicEgyptian": "Egyptian",

    // Collection Section
    "collection.badge": "Featured Collections",
    "collection.title": "Cultural",
    "collection.titleHighlight": "Collections",
    "collection.viewComplete": "View Full Collection",
    "collection.off": "% Licensing",

    // Auction Section
    "auction.badge": "⚡ Limited Edition",
    "auction.title": "Exclusive",
    "auction.titleHighlight": "Featured Works",
    "auction.subtitle": "Curated immersive works from our latest creative research. Each month we spotlight works exploring new narratives and cultural territories.",
    "auction.tip": "✨ Curated by studio directors • Each work carries cultural context and artistic provenance",
    "auction.hotDeal": "FEATURED!",
    "auction.endsIn": "Featured Until",
    "auction.buyNow": "View Work",
    left: "left", // Adding "left" translation for auction countdown timer
    minutes: "Minutes",
    seconds: "Seconds",
    untilPricesReset: "Until prices reset",
    instant: "Instant",

    // CTA Cards
    "cta.collection.title": "Collections",
    "cta.collection.subtitle": "Curated thematic works",
    "cta.collection.price": "$299+",
    "cta.collection.priceNote": "Per license tier",
    "cta.collection.button": "Explore Collections",
    "cta.gallery.title": "Gallery",
    "cta.gallery.subtitle": "Browse all works & formats",
    "cta.gallery.count": "50+",
    "cta.gallery.countNote": "Immersive works",
    "cta.gallery.button": "Browse Gallery",
    "cta.signIn.title": "Account",
    "cta.signIn.subtitle": "Access your licenses & downloads",
    "cta.signIn.access": "Secure",
    "cta.signIn.accessNote": "License management",
    "cta.signIn.button": "Sign In",

    // Stats Section
    "stats.resolution": "8K-16K",
    "stats.resolutionNote": "Ultra resolution",
    "stats.instant": "Secure",
    "stats.instantNote": "Licensed delivery",
    "stats.vr": "Spatial",
    "stats.vrNote": "Dome, VR, Performance",

    // Featured Gallery
    "featured.badge": "Featured Gallery",
    "featured.title": "Explore Our",
    "featured.titleHighlight": "Premium 360° Collection",
    "featured.subtitle": "Browse our curated selection of dome, equirectangular, and featured collection images",

    // FAQ Section
    "faq.badge": "Our Work",
    "faq.title": "Cultural Preservation Through",
    "faq.titleHighlight": "Immersive Technology",
    "faq.subtitle":
      "How we combine artificial intelligence with cultural respect to document and preserve the heritage of indigenous peoples.",

    "faq.q1.title": "What is 360° immersive documentation and why is it important for cultural heritage?",
    "faq.q1.answer":
      "360° immersive documentation captures complete cultural spaces and environments, allowing future generations to experience these places as if physically present. Unlike traditional photography that only shows fragments, our spherical captures preserve the totality of spatial context, architectural details, and atmosphere of cultural sites.\n\nThis is especially critical for indigenous sites in Asia facing threats from urbanization, climate change, or simply the passage of time. Our equirectangular images allow creating permanent digital archives that can be used for education, academic research, and virtual reality experiences that bring these cultures closer to people worldwide without the impact of mass tourism.",

    "faq.q2.title": "How do you use artificial intelligence in your cultural preservation projects?",
    "faq.q2.answer":
      "Our approach combines real photographic capture with AI techniques for restoration, reconstruction, and quality enhancement. We use noise diffusion algorithms to generate high-fidelity reconstructions of damaged or partially lost spaces, always guided by authentic historical documentation and consultation with local communities.\n\nFor well-preserved sites, we employ neural upscaling and algorithmic color correction to create files up to 16K resolution from original captures, revealing details imperceptible to the naked eye. In projects with indigenous peoples in Asia, we have documented ancestral temples, ceremonial sites, and community spaces, always with full consent and participation from the communities.\n\nOur technology also enables creating reconstructions of historical sites based on oral descriptions and community memories, giving visual form to intangible heritage that would otherwise be lost.",

    "faq.q3.title": "How do you ensure cultural respect in your work with indigenous peoples?",
    "faq.q3.answer":
      "Cultural respect is our fundamental principle. Each project begins with extensive dialogue with communities, obtaining explicit permissions not only for capture, but also for use and distribution of images. We recognize that many spaces have sacred meaning or cultural restrictions on who can access them.\n\nIn our work in Asia, we have established protocols including: consultation with community leaders and cultural authorities, training of local members in capture techniques so they can document their own spaces when appropriate, intellectual property agreements recognizing communities' rights over their heritage, and return of economic benefits to communities when material is commercialized.\n\nOur images are never published without explicit approval, and we respect restrictions on access to sacred or ceremonial spaces. Technology is just a tool; knowledge and decision-making always remain in the hands of the communities.",

    "faq.q4.title": "What technical specifications do you handle for cultural preservation files?",
    "faq.q4.answer":
      "For cultural preservation work, we use the highest technical standards to ensure longevity and fidelity of files:\n\n• Resolutions from 8K (7680×4320) up to 16K (15360×8640) in equirectangular format\n• Uncompressed RAW files for maximum fidelity\n• 16-bit color depth to capture complete dynamic ranges\n• Exhaustive metadata including GPS coordinates, date, capture conditions, and cultural context\n• Multiple copies in open file formats (TIFF, PNG) to avoid technological obsolescence\n• Complementary documentation with contextual, historical, and cultural information\n\nAll files comply with international digital preservation standards established by UNESCO and national libraries. We work with academic institutions to ensure these files can be accessed by researchers for decades.",

    "faq.q5.title": "What projects have you developed with indigenous peoples in Asia?",
    "faq.q5.answer":
      "We have collaborated with various communities on documentation and preservation projects:\n\n• Ancestral temples: 360° documentation of traditional religious architecture at risk, including details of wood carvings, murals, and ceremonial spaces\n• Natural ceremonial sites: Capture of sacred spaces in forests and mountains, preserving both the natural environment and cultural significance\n• Digital reconstructions: Recreation of lost historical spaces based on oral memory and ancestral documents, working closely with community elders\n• Cultural education: Development of VR experiences for local schools that teach new generations about their own traditions in accessible and engaging formats\n\nEach project is unique and adapted to the specific needs of each community. Our goal is not just to create static archives, but living tools that communities can use for education, sustainable cultural tourism, and identity strengthening.",

    "faq.q6.title": "How can cultural and educational institutions access this material?",
    "faq.q6.answer":
      "We work with multiple models depending on the project:\n\n**Educational and academic institutions:** Free or low-cost access for research, education, and preservation. We seek to maximize educational impact while respecting agreements with communities.\n\n**Museums and cultural centers:** Special licenses for exhibitions, both physical (dome projections, immersive installations) and virtual. These projects include contextual material and collaboration with indigenous communities.\n\n**Ethical commercial projects:** For documentaries, educational productions, or virtual tourism experiences, we offer licenses that include percentage of benefits returning directly to communities.\n\nEach case is evaluated individually, always prioritizing cultural respect and benefit for indigenous communities. Contact us to discuss specific projects. Communities always have veto rights over the use of images of their heritage.",

    // Gallery
    "gallery.badge": "Curated. Licensed. Production-Ready.",
    "gallery.title": "Premium 360° Assets",
    "gallery.titleHighlight": "Crafted by AI Algorithms",
    "gallery.subtitle":
      "Stop wasting time on prompts and generation limits. Browse our collection of algorithmically-perfected environments spanning heritage landmarks, futuristic cities, and infinite atmospheric variations—all instantly downloadable.",
    "gallery.stats.resolution": "16K",
    "gallery.stats.resolutionLabel": "Ultra Resolution",
    "gallery.stats.assets": "Ready Assets",
    "gallery.stats.waitTime": "0s",
    "gallery.stats.waitTimeLabel": "Wait Time",
    "gallery.stats.licensed": "100%",
    "gallery.stats.licensedLabel": "Licensed",
    "gallery.algorithmNote":
      "Each image powered by proprietary noise diffusion algorithms that capture movement, depth, and atmospheric richness across diverse scenarios—from cultural preservation to speculative futures",
    "gallery.formats": "Formats",
    "gallery.formatsNote": "360° projection types",
    "gallery.allFormats": "All Formats",
    "gallery.collections": "Collections",
    "gallery.collectionsNote": "Curated thematic collections",
    "gallery.exploreDataset": "Explore Rich Dataset Diversity",
    "gallery.datasetNote":
      "Each category represents thousands of training scenarios, capturing diverse lighting, weather, time periods, and atmospheric conditions",
    "gallery.allCollections": "All Collections",
    "gallery.multiEraStyles": "Multi-Era Styles",
    "gallery.temporalLighting": "Temporal Lighting",
    "gallery.materialTexture": "Material Texture",
    "gallery.heritageTitle": "Heritage Collection",
    "gallery.heritageSubtitle": "Where History Meets Innovation",
    "gallery.heritageDescription":
      "Our heritage pillar captures the soul of cultural landmarks through advanced algorithmic analysis. Unlike static photography, each frame contains infinite depth—the weathering of ancient stone, the dance of natural light across architecture, the atmospheric weight of centuries.",
    "gallery.heritageUseCase":
      "Perfect for virtual museums, cultural preservation, architectural visualization, and educational immersion.",
    "gallery.exploreHeritage": "Explore Full Heritage Collection",
    "gallery.exploreDatasetTitle": "Explore Rich Dataset Diversity",
    "gallery.datasetDescription":
      "Beyond heritage, our algorithmic engine has mastered dystopian futures, dreamscapes surreal, urban sprawl, natural phenomena, and speculative environments.",

    // Use Cases Section
    "useCases.badge": "Industry Applications",
    "useCases.title": "Production-Ready For",
    "useCases.titleHighlight": "Every Creative Vision",
    "useCases.subtitle":
      "Unlike generation tools that require prompts and iterations, our curated collection delivers instant, rights-managed assets trusted by professionals",
    "useCases.gameDev": "Game Development",
    "useCases.gameDevDesc":
      "Skyboxes and environments for VR/AR games. HDRI-ready, optimized formats, instant integration into Unity/Unreal.",
    "useCases.virtualProd": "Virtual Production",
    "useCases.virtualProdDesc":
      "LED wall backgrounds, projection mapping content. 16K resolution with authentic lighting and atmospheric depth.",
    "useCases.archViz": "Arch Visualization",
    "useCases.archVizDesc":
      "Realistic environmental contexts for architectural renders. Heritage landmarks, urban scenes, natural landscapes.",
    "useCases.metaverse": "Metaverse & Web3",
    "useCases.metaverseDesc":
      "Virtual world environments, NFT backgrounds, immersive experiences. Unique, algorithmically-crafted assets.",
    "useCases.digitalArt": "Digital Art & NFTs",
    "useCases.digitalArtDesc":
      "Exclusive 360° artworks with verifiable licensing. Limited editions, collector-grade quality and authenticity.",
    "useCases.education": "Education & Museums",
    "useCases.educationDesc":
      "Virtual tours, cultural preservation, immersive learning. Heritage sites captured with algorithmic precision.",

    // Comparison Section
    "comparison.title": "The Smart Alternative to",
    "comparison.titleHighlight": "Generation Tools & Free Assets",
    "comparison.genTools": "Generation Tools",
    "comparison.genToolsNote": "Skybox AI, PanoPulse, etc.",
    "comparison.genToolCon1": "Monthly generation limits ($120-$578/year)",
    "comparison.genToolCon2": "Trial-and-error prompting required",
    "comparison.genToolCon3": "Unpredictable quality and style consistency",
    "comparison.genToolCon4": "Time spent generating vs. creating",
    "comparison.genToolCon5": "Limited commercial licensing clarity",
    "comparison.ourPlatform": "n3uralia360.art",
    "comparison.ourPlatformNote": "Premium Curated Marketplace",
    "comparison.ourPro1": "Pay once, use forever - from $75/image",
    "comparison.ourPro2": "Instant download, production-ready quality",
    "comparison.ourPro3": "Curated collection by scenario & style",
    "comparison.ourPro4": "Start creating immediately, no setup",
    "comparison.ourPro5": "Full commercial license with indemnification",
    "comparison.legalTitle": "Legal Protection Included",
    "comparison.legalDesc":
      "Unlike generic stock libraries where AI-generated content creates copyright uncertainty, every n3uralia360.art image comes with full commercial licensing and indemnification.",

    // CTA
    "cta.readyToTransform": "Elevate Your Projects with",
    "cta.creativeVision": "Premium 360° Assets",
    "cta.joinThousands": "Join thousands of creators who trust n3uralia360.art for their immersive projects",
    "cta.startExploring": "Start Exploring",

    "about.badge": "About n3uralia360.art • Part of n3uralia Group",
    "about.title": "Revolutionizing",
    "about.titleHighlight": "Visual Content",
    "about.titleEnd": "for Professionals",
    "about.subtitle":
      "We're pioneering the future of immersive imagery with cutting-edge AI technology and professional-grade 360° content that transforms how people experience digital environments. As part of the innovative n3uralia group, we deliver supreme quality through advanced platform technology.",
    "about.whyChoose.badge": "Why Choose n3uralia360.art?",
    "about.whyChoose.title": "What Makes Us Different in 360° Photography",
    "about.whyChoose.subtitle": "Backed by n3uralia group's innovation and excellence standards",
    "about.aiGenerated.title": "100% AI-Generated Content",
    "about.aiGenerated.desc":
      "Unlike traditional photography companies, every image is created from scratch using proprietary AI technology developed by the n3uralia group. This means unique scenes that don't exist anywhere else, with perfect lighting and composition that would be impossible to capture naturally.",
    "about.professional.title": "Professional-Grade Quality",
    "about.professional.desc":
      "Our custom enhancement pipeline, powered by n3uralia group technology, transforms AI output into professional imagery with 4K-16K resolution. Every image meets the demanding standards required for commercial VR applications, projection mapping, and architectural visualization.",
    "about.mission.title": "Our Mission",
    "about.mission.p1":
      "At n3uralia360.art, part of the n3uralia group, we believe that immersive visual content should be accessible, high-quality, and professionally crafted. Our mission is to provide creators, architects, and businesses with the tools and content they need to bring their visions to life.",
    "about.mission.p2":
      "Through advanced AI generation and enhancement techniques developed within the n3uralia group ecosystem, we deliver unprecedented quality in 360° and fisheye imagery that meets the demanding standards of professional applications.",
    "about.offer.title": "What We Offer",
    "about.offer.item1": "High-resolution 360° equirectangular imagery",
    "about.offer.item2": "Professional fisheye lens photography",
    "about.offer.item3": "AI-enhanced image quality and detail through n3uralia group technology",
    "about.offer.item4": "Flexible licensing for commercial use",
    "about.offer.item5": "Instant downloads and access",
    "about.technology.title": "Our Technology",
    "about.technology.subtitle": "Powered by n3uralia group's innovative platform ecosystem",
    "about.technology.ai.title": "AI Enhancement",
    "about.technology.ai.desc":
      "Advanced neural networks enhance image quality and detail through n3uralia group platforms",
    "about.technology.capture.title": "Professional Capture",
    "about.technology.capture.desc": "State-of-the-art equipment for pristine image capture",
    "about.technology.qa.title": "Quality Assurance",
    "about.technology.qa.desc": "Rigorous testing ensures every image meets n3uralia group standards",
    "about.faq.badge": "Frequently Asked Questions",
    "about.faq.title": "Learn More About Our",
    "about.faq.titleHighlight": "Company & Process",
    "about.faq.subtitle":
      "Common questions about n3uralia360.art, our technology, and how we create professional 360° imagery.",
    "about.faq1.q": "What is n3uralia360.art and how did the company start?",
    "about.faq1.a":
      "n3uralia360.art is a pioneering company in AI-generated 360° photography, part of the innovative n3uralia group. We were founded to bridge the gap between traditional photography limitations and the growing demand for immersive visual content. We recognized that creating high-quality 360° imagery was expensive, time-consuming, and often impossible for many creative scenarios. Our solution combines cutting-edge AI generation with professional enhancement techniques developed within the n3uralia group ecosystem to deliver unique, high-quality immersive imagery that meets professional standards.",
    "about.faq2.q": "How does AI-generated photography compare to traditional 360° photography?",
    "about.faq2.a":
      "AI-generated photography offers several advantages over traditional methods: unlimited creative possibilities without physical constraints, perfect lighting and composition control, unique scenes that don't exist in reality, and consistent quality without weather or location dependencies. While traditional photography captures real environments, our AI approach powered by n3uralia group technology creates entirely new worlds with professional-grade quality, often exceeding what's possible with conventional equipment and techniques.",
    "about.faq3.q": "What quality standards does n3uralia360.art maintain?",
    "about.faq3.a":
      "We maintain rigorous quality standards throughout our entire pipeline, backed by n3uralia group's excellence standards. Every image undergoes professional enhancement to achieve 4K-16K resolution with superior clarity, color accuracy, and detail. Our proprietary enhancement process ensures consistent quality that meets the demanding requirements of commercial VR applications, projection mapping installations, and architectural visualization projects. We test every image for technical specifications and visual quality before making it available.",
    "about.faq4.q": "Does n3uralia360.art offer custom 360° imagery projects?",
    "about.faq4.a":
      "Yes, we offer custom 360° imagery projects for clients with specific requirements. Our AI generation capabilities, powered by n3uralia group technology, allow us to create unique environments, architectural spaces, or artistic scenes tailored to your project needs. Custom projects include consultation on technical specifications, multiple revision rounds, and delivery in your preferred formats and resolutions. Contact us to discuss your specific requirements and timeline for custom imagery solutions.",
    "about.faq5.q": "Can you explain n3uralia360.art's technology pipeline?",
    "about.faq5.a":
      "Our technology pipeline consists of three main stages: AI generation using proprietary models trained specifically for 360° imagery within the n3uralia group ecosystem, professional enhancement through custom-built tools that improve resolution and quality, and quality assurance testing to ensure every image meets our professional standards. Every tool in our pipeline is built from scratch by the n3uralia group, giving us complete control over the creative process and final output quality. This approach allows us to consistently deliver unique, high-quality imagery that exceeds traditional photography limitations.",
    "about.ready.title": "Ready to Get Started?",
    "about.ready.subtitle":
      "Join thousands of professionals who trust n3uralia360.art and the n3uralia group for their immersive content needs.",
    "about.ready.browse": "Browse Gallery",
    "about.ready.contact": "Contact Us",

    // Email Contact Modal
    "contact.title": "Contact Us",
    "contact.description": "Get in touch with N3uralia360",
    "contact.emailLabel": "Email Address",
    "contact.copy": "Copy",
    "contact.copied": "Copied",
    "contact.quotationTitle": "Request a Quotation",
    "contact.quotationIntro": "When requesting a quotation for our services or products, please include:",
    "contact.quotationItem1": "Project type (dome installation, VR environment, spatial media, etc.)",
    "contact.quotationItem2": "Venue size and specifications",
    "contact.quotationItem3": "Timeline and budget range (if applicable)",
    "contact.quotationItem4": "Your contact information and preferred communication method",
    "contact.quotationItem5": "Any reference images, inspiration, or detailed requirements",
    "contact.quotationResponse": "Our team will provide a tailored quotation within 24-48 hours.",
    "contact.instructionsTitle": "How to Contact Us",
    "contact.instruction1": "Copy the email address above",
    "contact.instruction2": "Open your preferred email client (Gmail, Outlook, Apple Mail, etc.)",
    "contact.instruction3": "Paste the email address in the 'To' field",
    "contact.instruction4": "Write your message with the details above and send",
    "contact.responseTime": "We typically respond within 24 hours during business days.",
    "contact.benefitsTitle": "Why use your email client?",
    "contact.benefit1": "✓ Use any email provider (Gmail, Outlook, Apple Mail, etc.)",
    "contact.benefit2": "✓ Maintain your email history and sent messages",
    "contact.benefit3": "✓ Faster response and better communication",
    "contact.benefit4": "✓ Your privacy and security",
    "contact.closeButton": "Close",

    "header.shoppingCart": "Shopping Cart",
    "header.cartEmpty": "Your cart is empty",
    "header.total": "Total",
    "header.proceedToCheckout": "Proceed to Checkout",

    "collections.badge": "Curated Collections",
    "collections.title": "Visual Stories in",
    "collections.titleHighlight": "Immersive Detail",
    "collections.subtitle":
      "Each collection is a carefully crafted narrative—from ancient monuments preserving human heritage to futuristic landscapes imagining tomorrow. Discover thematic sets designed for creators who value artistry and authenticity.",
    "collections.stats.collections": "Collections",
    "collections.stats.resolution": "Resolution",
    "collections.stats.format": "Format",
    "collections.coming.soon": "Coming Soon",
    "collections.coming.desc":
      "Our curators are assembling extraordinary collections. Check back soon to discover immersive visual narratives.",
    "collections.coming.exploreImages": "Explore Individual Images",
    "collections.subcollections": "Explore Sub-Collections",
    "collections.format": "Format",
    "collections.format.360": "360° Panoramic",
    "collections.license": "License",
    "collections.license.commercial": "Commercial Use",
    "collections.viewFull": "View Full Collection",
    "collections.individualPurchase": "Individual Purchase",
    "collections.buyingSeparately": "Buying all {count} photos separately",
    "collections.bundlePrice": "Bundle Price",
    "collections.completeCollection": "Complete bundle",
    "collections.youSave": "You Save",
    "collections.preferIndividual": "Prefer Individual Images?",
    "collections.browseGallery":
      "Browse our complete gallery to find specific 360° images with advanced filtering by format, theme, and style. Perfect for single-use projects.",
    "collections.browseButton": "Browse Gallery",
    "collections.exploreCollection": "Explore Collection",

    // Studio Page
    "studio.title": "Studio",
    "studio.description": "N3uralia360 is a content creation studio combining advanced proprietary AI tools with human art direction and real production.",
    "studio.aiToolsLink": "AI tools",
    "studio.weCreate": "We create:",
    "studio.fullDome": "Full-dome cinematic stories",
    "studio.seamlessDome": "Seamless dome environments & loops",
    "studio.vrReady": "VR-ready immersive worlds",
    "studio.educational": "Educational & cultural series",
    "studio.custom": "Custom immersive productions",
    "studio.teamTitle": "Team",
    "studio.teamDescription": "N3uralia360 is an AI + human studio. We build immersive content through code, curation, and cinematic motion design.",
    "studio.ourTools": "Our Tools",
    "studio.whatsapp": "WhatsApp",
    "studio.videoPlayer": "Video player",

    // Environments Page
    "environments.natureTitle": "Nature",
    "environments.natureDescription": "Explore real world with dreamlike immersive dome interpretations. Travel between UNESCO Sites in seconds or discover diversity of real life reimagined with immersive creativity.",
    "environments.oceans": "Oceans",
    "environments.volcanoes": "Volcanoes",
    "environments.forest": "Forest",
    "environments.iceSnow": "Ice & Snow",
    "environments.back": "Back",
    "environments.heritageTitle": "Heritage",
    "environments.heritageDescription": "Heritage Environments are immersive journeys inspired by real cultures, architecture, symbolism, and landscapes.",
    "environments.mythicTitle": "Mythic",
    "environments.mythicDescription": "The Mythical Universe series transforms symbolic and dreamlike cosmology into immersive dome experiences. Pure atmosphere and emotional immersion.",
    "environments.artTitle": "Art",
    "environments.artDescription": "Algorithmically generated original art immersions that reimagine visuality, texture, and movement as surrounding 360° spaces.",

    // Shows & Theatre Pages
    "shows.theatreTitle": "Teatro",
    "shows.theatreSubtitle": "Sumérgete en experiencias de video curadas",
    "shows.theatreDescription": "Pantalla más grande trae mejor experiencia. Mira nuestra colección curada de contenido de domo inmersivo en ambiente de escala de cine.",
    "shows.enterTheatre": "Entra al Teatro",

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

    "footer.legal": "Legal",
    "footer.licenseTerms": "Términos de Licencia",
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

    // Footer
    "footer.brandDescription": "Cultural immersive media studio creating experiences in dome installations, VR environments, and spatial media.",
    "footer.available247": "Available 24/7",
    "footer.exploreTitle": "Explore",
    "footer.gallery": "Gallery",
    "footer.collections": "Collections",
    "footer.allWorks": "All Works",
    "footer.theatreMode": "Theatre Mode",
    "footer.aboutTitle": "About",
    "footer.aboutN3uralia": "About N3uralia360",
    "footer.studioProcess": "Studio Process",
    "footer.commission": "Commission",
    "footer.contactTitle": "Contact",
    "footer.emailLabel": "Email",
    "footer.messageLabel": "Message",
    "footer.sendButton": "Send",
    "footer.phoneNumber": "+1 (555) 123-4567",
    "footer.location": "San Francisco, CA",
    "footer.followUs": "Follow Us",
    "footer.instagram": "Instagram",
    "footer.twitter": "Twitter",
    "footer.linkedIn": "LinkedIn",
    "footer.copyright": "© 2024 N3uralia360. All rights reserved.",

    // Cart
    "cart.emptyCart": "Your cart is empty",
    "cart.startShopping": "Start Shopping",
    "cart.subtotal": "Subtotal",
    "cart.tax": "Tax",
    "cart.shipping": "Shipping",
    "cart.total": "Total",
    "cart.proceedToCheckout": "Proceed to Checkout",

    // Collections
    "collections.badge": "Curated Collections",
    "collections.title": "Visual Stories in",
    "collections.titleHighlight": "Immersive Detail",
    "collections.subtitle": "Each collection is a carefully crafted narrative—from ancient monuments preserving human heritage to futuristic landscapes imagining tomorrow. Discover thematic sets designed for creators who value artistry and authenticity.",
    "collections.stats.collections": "Collections",
    "collections.stats.resolution": "Resolution",
    "collections.stats.format": "Format",
    "collections.coming.soon": "Coming Soon",
    "collections.coming.desc": "Our curators are assembling extraordinary collections. Check back soon to discover immersive visual narratives.",
    "collections.coming.exploreImages": "Explore Individual Images",
    "collections.subcollections": "Explore Sub-Collections",
    "collections.format": "Format",
    "collections.format.360": "360° Panoramic",
    "collections.license": "License",
    "collections.license.commercial": "Commercial Use",
    "collections.viewFull": "View Full Collection",
    "collections.individualPurchase": "Individual Purchase",
    "collections.buyingSeparately": "Buying all {count} photos separately",
    "collections.bundlePrice": "Bundle Price",
    "collections.completeCollection": "Complete bundle",
    "collections.youSave": "You Save",
    "collections.preferIndividual": "Prefer Individual Images?",
    "collections.browseGallery": "Browse our complete gallery to find specific 360° images with advanced filtering by format, theme, and style. Perfect for single-use projects.",
    "collections.browseButton": "Browse Gallery",
    "collections.exploreCollection": "Explore Collection",

    // Studio Page
    "studio.title": "Studio",
    "studio.description": "N3uralia360 is a content creation studio combining advanced proprietary AI tools with human art direction and real production.",
    "studio.aiToolsLink": "AI tools",
    "studio.weCreate": "We create:",
    "studio.fullDome": "Full-dome cinematic stories",
    "studio.seamlessDome": "Seamless dome environments & loops",
    "studio.vrReady": "VR-ready immersive worlds",
    "studio.educational": "Educational & cultural series",
    "studio.custom": "Custom immersive productions",
    "studio.teamTitle": "Team",
    "studio.teamDescription": "N3uralia360 is an AI + human studio. We build immersive content through code, curation, and cinematic motion design.",
    "studio.ourTools": "Our Tools",
    "studio.whatsapp": "WhatsApp",
    "studio.videoPlayer": "Video player",

    // Environments Page
    "environments.natureTitle": "Nature",
    "environments.natureDescription": "Explore real world with dreamlike immersive dome interpretations. Travel between UNESCO Sites in seconds or discover diversity of real life reimagined with immersive creativity.",
    "environments.oceans": "Oceans",
    "environments.volcanoes": "Volcanoes",
    "environments.forest": "Forest",
    "environments.iceSnow": "Ice & Snow",
    "environments.back": "Back",
    "environments.heritageTitle": "Heritage",
    "environments.heritageDescription": "Heritage Environments are immersive journeys inspired by real cultures, architecture, symbolism, and landscapes.",
    "environments.mythicTitle": "Mythic",
    "environments.mythicDescription": "The Mythical Universe series transforms symbolic and dreamlike cosmology into immersive dome experiences. Pure atmosphere and emotional immersion.",
    "environments.artTitle": "Art",
    "environments.artDescription": "Algorithmically generated original art immersions that reimagine visuality, texture, and movement as surrounding 360° spaces.",

    // Shows & Theatre Pages
    "shows.theatreTitle": "Theatre",
    "shows.theatreSubtitle": "Immerse yourself in curated video experiences",
    "shows.theatreDescription": "Bigger screen brings better experience. Watch our curated collection of immersive dome content on a cinema-scale environment.",
    "shows.enterTheatre": "Enter Theatre",

    "footer.legal": "Legal",
    "footer.licenseTerms": "License Terms",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isLoaded, setIsLoaded] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check URL query param first (?lang=es)
    const urlLang = searchParams?.get("lang") as Language
    if (urlLang && (urlLang === "es" || urlLang === "en")) {
      setLanguageState(urlLang)
      localStorage.setItem("language", urlLang)
      setIsLoaded(true)
      return
    }

    // Fall back to localStorage
    const saved = localStorage.getItem("language") as Language
    if (saved && (saved === "es" || saved === "en")) {
      setLanguageState(saved)
    } else {
      // Fall back to browser language or default to English
      const browserLang = typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "en"
      const defaultLang = (browserLang === "es" ? "es" : "en") as Language
      setLanguageState(defaultLang)
      localStorage.setItem("language", defaultLang)
    }
    setIsLoaded(true)
  }, [searchParams])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    // Ensure we have a valid language object, fallback to English if not
    const translationObj = translations[language] || translations.en
    return translationObj[key as keyof typeof translationObj] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
