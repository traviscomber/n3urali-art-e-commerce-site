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

    // Environments Page - Main
    "environmentsPage.title": "Ambientes",
    "environmentsPage.subtitle": "Loops inmersivos sin costura diseñados para encantar.",
    "environmentsPage.benefit1": "Noches temáticas sin fin sin reconstruir tu show",
    "environmentsPage.benefit2": "Material limpio y sin costura listo para superponer y mezclar",
    "environmentsPage.benefit3": "Visuales premium ambiente que elevan cualquier espacio",
    "environmentsPage.back": "Atrás",
    "environmentsPage.loadMore": "Cargar Más",
    
    // Environments Page - Nature Categories
    "environments.oceans": "Océanos",
    "environments.volcanoes": "Volcanes",
    "environments.forest": "Bosque",
    "environments.iceSnow": "Hielo y Nieve",
    
    // Environments Page - Heritage Categories
    "environments.northAmerica": "América del Norte",
    "environments.southAmerica": "América del Sur",
    "environments.asia": "Asia",
    "environments.more": "Más",
    
    // Environments Page - Art Categories
    "environments.architecture": "Arquitectura",
    "environments.landscapes": "Paisajes",
    "environments.geometry": "Geometría",
    "environments.cosmic": "Cósmico",
    "environments.abstract": "Abstracto",
    
    // Environments Page - Art Labels
    "environments.artLabel1": "Jungla de Origami",
    "environments.artLabel2": "Árbol Cibernético",
    "environments.artLabel3": "Mandala Esmeralda",
    "environments.artLabel4": "Cielo con Diamantes",
    "environments.artLabel5": "Cielo Prismático",
    
    // Environments Page - Mythic Categories (same as shows)
    "environments.mythicAsian": "Asiático",
    "environments.mythicMesoamerican": "Mesoamericano",
    "environments.mythicGreek": "Griego",
    "environments.mythicEgyptian": "Egipcio",

    // Environments Section Titles & Descriptions
    "environments.natureTitle": "Naturaleza",
    "environments.natureDescription": "Explora el mundo real con interpretaciones de domo inmersivo onírico. Viaja entre Sitios Patrimonio de la UNESCO en segundos o descubre la diversidad de la vida real reimaginada con creatividad inmersiva.",
    "environments.heritageTitle": "Patrimonio",
    "environments.heritageDescription": "Los Ambientes de Patrimonio son viajes inmersivos inspirados en culturas reales, arquitectura, simbolismo y paisajes.",
    "environments.mythicTitle": "Mítico",
    "environments.mythicDescription": "La serie del Universo Mítico transforma la cosmología simbólica y onírica en experiencias de domo inmersivo. Pura atmósfera e inmersión emocional.",
    "environments.artTitle": "Arte",
    "environments.artDescription": "Inmersiones de arte original generadas algorítmicamente que reimaginan la visualidad, textura y movimiento como espacios 360° envolventes.",

    // Collection Section
    "collection.badge": "Colecciones Destacadas",
    "collection.title": "Colecciones",
    "collection.titleHighlight": "Culturales",
    "collection.viewComplete": "Ver Colección Completa",
    "collection.off": "% Licencia",

    // Auction Section
    "auction.badge": "⚡ Edición Limitada",
    "auction.title": "Obras",
    "auction.titleHighlight": "Destacadas",
    "auction.subtitle":
      "Obras inmersivas curadas de nuestra investigación creativa más reciente. Cada mes destacamos obras que exploran nuevas narrativas y territorios culturales.",
    "auction.tip": "✨ Curado por directores del estudio • Cada obra lleva contexto cultural y procedencia artística",
    "auction.hotDeal": "¡DESTACADO!",
    "auction.endsIn": "Destacado Hasta",
    "auction.buyNow": "Ver Obra",
    left: "restante", // Adding "left" translation for auction countdown timer
    minutes: "Minutos",
    seconds: "Segundos",
    untilPricesReset: "Hasta que se reinicien los precios",
    instant: "Instantáneo",

    // CTA Cards
    "cta.collection.title": "Colecciones",
    "cta.collection.subtitle": "Obras temáticas curadas",
    "cta.collection.price": "$299+",
    "cta.collection.priceNote": "Por nivel de licencia",
    "cta.collection.button": "Explorar Colecciones",
    "cta.gallery.title": "Galería",
    "cta.gallery.subtitle": "Navega todas las obras y formatos",
    "cta.gallery.count": "50+",
    "cta.gallery.countNote": "Obras inmersivas",
    "cta.gallery.button": "Explorar Galería",
    "cta.signIn.title": "Cuenta",
    "cta.signIn.subtitle": "Accede a tus licencias y descargas",
    "cta.signIn.access": "Seguro",
    "cta.signIn.accessNote": "Gestión de licencias",
    "cta.signIn.button": "Iniciar Sesión",

    // Stats Section
    "stats.resolution": "8K-16K",
    "stats.resolutionNote": "Ultra resolución",
    "stats.instant": "Seguro",
    "stats.instantNote": "Entrega Licenciada",
    "stats.vr": "Espacial",
    "stats.vrNote": "Domo, VR, Performance",

    // Featured Gallery
    "featured.badge": "Galería Destacada",
    "featured.title": "Explora Nuestra",
    "featured.titleHighlight": "Colección 360° Premium",
    "featured.subtitle": "Navega nuestra selección curada de imágenes domo, equirectangulares y de colección destacada",

    // FAQ Section
    "faq.badge": "Nuestro Trabajo",
    "faq.title": "Preservación Cultural a Través de",
    "faq.titleHighlight": "Tecnología Inmersiva",
    "faq.subtitle":
      "Cómo combinamos inteligencia artificial con respeto cultural para documentar y preservar el patrimonio de pueblos originarios.",

    "faq.q1.title": "¿Qué es la documentación inmersiva 360° y por qué es importante para el patrimonio cultural?",
    "faq.q1.answer":
      "La documentación inmersiva 360° captura espacios y ambientes culturales completos, permitiendo que las futuras generaciones experimenten estos lugares como si estuvieran presentes físicamente. A diferencia de la fotografía tradicional que solo muestra fragmentos, nuestras capturas esféricas preservan la totalidad del contexto espacial, los detalles arquitectónicos, y la atmósfera de sitios culturales.\n\nEsto es especialmente crítico para sitios de pueblos originarios en Asia que enfrentan amenazas de urbanización, cambio climático, o simplemente el paso del tiempo. Nuestras imágenes equirectangulares permiten crear archivos digitales permanentes que pueden usarse para educación, investigación académica, y experiencias de realidad virtual que acercan estas culturas a personas de todo el mundo sin el impacto del turismo masivo.",

    "faq.q2.title": "¿Cómo utilizan la inteligencia artificial en sus proyectos de preservación cultural?",
    "faq.q2.answer":
      "Nuestro enfoque combina captura fotográfica real con técnicas de IA para restauración, reconstrucción y mejora de calidad. Utilizamos algoritmos de difusión de ruido para generar reconstrucciones de alta fidelidad de espacios dañados o parcialmente perdidos, guiados siempre por documentación histórica auténtica y consulta con las comunidades locales.\n\nPara sitios bien preservados, empleamos upscaling neuronal y corrección de color algorítmica para crear archivos de hasta 16K de resolución desde capturas originales, revelando detalles imperceptibles a simple vista. En proyectos con pueblos originarios en Asia, hemos trabajado documentando templos ancestrales, sitios ceremoniales, y espacios comunitarios, siempre con pleno consentimiento y participación de las comunidades.\n\nNuestra tecnología también permite crear reconstrucciones de sitios históricos basadas en descripciones orales y memorias comunitarias, dando forma visual a patrimonio intangible que de otra forma se perdería.",

    "faq.q3.title": "¿Cómo garantizan el respeto cultural en su trabajo con pueblos originarios?",
    "faq.q3.answer":
      "El respeto cultural es nuestro principio fundamental. Cada proyecto comienza con diálogo extenso con las comunidades, obteniendo permisos explícitos no solo para la captura, sino también para el uso y distribución de las imágenes. Reconocemos que muchos espacios tienen significado sagrado o restricciones culturales sobre quién puede acceder a ellos.\n\nEn nuestro trabajo en Asia, hemos establecido protocolos que incluyen: consulta con líderes comunitarios y autoridades culturales, capacitación de miembros locales en las técnicas de captura para que sean ellos quienes documenten sus propios espacios cuando sea apropiado, acuerdos de propiedad intelectual que reconocen los derechos de las comunidades sobre su patrimonio, y retorno de beneficios económicos a las comunidades cuando el material se comercializa.\n\nNuestras imágenes nunca se publican sin aprobación explícita, y respetamos restricciones sobre acceso a espacios sagrados o ceremoniales. La tecnología es solo una herramienta; el conocimiento y la decisión siempre permanecen en manos de las comunidades.",

    "faq.q4.title": "¿Qué especificaciones técnicas manejan para archivos de preservación cultural?",
    "faq.q4.answer":
      "Para trabajos de preservación cultural, utilizamos los más altos estándares técnicos para garantizar longevidad y fidelidad de los archivos:\n\n• Resoluciones desde 8K (7680×4320) hasta 16K (15360×8640) en formato equirectangular\n• Archivos RAW sin compresión para máxima fidelidad\n• Profundidad de color de 16-bit para capturar rangos dinámicos completos\n• Metadatos exhaustivos incluyendo coordenadas GPS, fecha, condiciones de captura, y contexto cultural\n• Múltiples copias en formatos de archivo abiertos (TIFF, PNG) para evitar obsolescencia tecnológica\n• Documentación complementaria con información contextual, histórica y cultural\n\nTodos los archivos cumplen con estándares internacionales de preservación digital establecidos por UNESCO y bibliotecas nacionales. Trabajamos con instituciones académicas para asegurar que estos archivos puedan ser accedidos por investigadores durante décadas.",

    "faq.q5.title": "¿Qué proyectos han desarrollado con pueblos originarios en Asia?",
    "faq.q5.answer":
      "Hemos colaborado con diversas comunidades en proyectos de documentación y preservación:\n\n• Templos ancestrales: Documentación 360° de arquitectura religiosa tradicional en riesgo, incluyendo detalles de tallado en madera, murales, y espacios ceremoniales\n• Sitios ceremoniales naturales: Captura de espacios sagrados en bosques y montañas, preservando tanto el entorno natural como el significado cultural\n• Reconstrucciones digitales: Recreación de espacios históricos perdidos basados en memoria oral y documentos ancestrales, trabajando estrechamente con ancianos de las comunidades\n• Educación cultural: Desarrollo de experiencias VR para escuelas locales que enseñan a las nuevas generaciones sobre sus propias tradiciones en formatos accesibles y atractivos\n\nCada proyecto es único y adaptado a las necesidades específicas de cada comunidad. Nuestro objetivo no es solo crear archivos estáticos, sino herramientas vivas que las comunidades puedan usar para educación, turismo cultural sostenible, y fortalecimiento de identidad.",

    "faq.q6.title": "¿Cómo pueden las instituciones culturales y educativas acceder a este material?",
    "faq.q6.answer":
      "Trabajamos con múltiples modelos según el proyecto:\n\n**Instituciones educativas y académicas:** Acceso gratuito o de bajo costo para investigación, educación y preservación. Buscamos maximizar el impacto educativo mientras respetamos los acuerdos con las comunidades.\n\n**Museos y centros culturales:** Licencias especiales para exhibiciones, tanto físicas (proyecciones dome, instalaciones inmersivas) como virtuales. Estos proyectos incluyen material contextual y colaboración con las comunidades originarias.\n\n**Proyectos comerciales éticos:** Para documentales, producciones educativas o experiencias turísticas virtuales, ofrecemos licencias que incluyen porcentaje de beneficios que retorna directamente a las comunidades.\n\nCada caso se evalúa individualmente, priorizando siempre el respeto cultural y el beneficio para las comunidades originarias. Contacta con nosotros para discutir proyectos específicos. Las comunidades siempre tienen derecho de veto sobre el uso de imágenes de su patrimonio.",

    // Gallery
    "gallery.badge": "Curado. Licenciado. Listo para Producción.",
    "gallery.title": "Activos 360° Premium",
    "gallery.titleHighlight": "Creados por Algoritmos de IA",
    "gallery.subtitle":
      "Deja de perder tiempo en prompts y límites de generación. Explora nuestra colección de ambientes perfectos algorítmicamente que abarcan monumentos patrimoniales, ciudades futuristas e infinitas variaciones atmosféricas—todos descargables instantáneamente.",
    "gallery.stats.resolution": "16K",
    "gallery.stats.resolutionLabel": "Ultra Resolución",
    "gallery.stats.assets": "Activos Listos",
    "gallery.stats.waitTime": "0s",
    "gallery.stats.waitTimeLabel": "Tiempo de Espera",
    "gallery.stats.licensed": "100%",
    "gallery.stats.licensedLabel": "Licenciado",
    "gallery.algorithmNote":
      "Cada imagen potenciada por algoritmos de difusión de ruido propietarios que capturan movimiento, profundidad y riqueza atmosférica en escenarios diversos—desde preservación cultural hasta futuros especulativos",
    "gallery.formats": "Formatos",
    "gallery.formatsNote": "Tipos de proyección 360°",
    "gallery.allFormats": "Todos los Formatos",
    "gallery.collections": "Colecciones",
    "gallery.collectionsNote": "Colecciones temáticas curadas",
    "gallery.exploreDataset": "Explora la Diversidad de Conjuntos de Datos Rico",
    "gallery.datasetNote":
      "Cada categoría representa miles de escenarios de entrenamiento, capturando diversas condiciones de iluminación, clima, períodos de tiempo y atmosféricos",
    "gallery.allCollections": "Todas las Colecciones",
    "gallery.multiEraStyles": "Estilos Multi-Época",
    "gallery.temporalLighting": "Iluminación Temporal",
    "gallery.materialTexture": "Textura Material",
    "gallery.heritageTitle": "Colección Patrimonio",
    "gallery.heritageSubtitle": "Donde la Historia Encuentra la Innovación",
    "gallery.heritageDescription":
      "Nuestro pilar patrimonial captura el alma de monumentos culturales a través de análisis algorítmico avanzado. A diferencia de la fotografía estática, cada cuadro contiene profundidad infinita—el desgaste de piedra antigua, la danza de luz natural sobre arquitectura, el peso atmosférico de siglos.",
    "gallery.heritageUseCase":
      "Perfecto para museos virtuales, preservación cultural, visualización arquitectónica e inmersión educativa.",
    "gallery.exploreHeritage": "Explorar Colección Completa de Patrimonio",
    "gallery.exploreDatasetTitle": "Explora la Diversidad de Conjuntos de Datos Rico",
    "gallery.datasetDescription":
      "Más allá del patrimonio, nuestro motor algorítmico ha dominado futuros distópicos, paisajes oníricos surrealistas, expansión urbana, fenómenos naturales y ambientes especulativos.",

    // Use Cases Section
    "useCases.badge": "Aplicaciones Industriales",
    "useCases.title": "Listo para Producción Para",
    "useCases.titleHighlight": "Cada Visión Creativa",
    "useCases.subtitle":
      "A diferencia de herramientas de generación que requieren prompts e iteraciones, nuestra colección curada entrega activos instantáneos con derechos administrados, confiados por profesionales",
    "useCases.gameDev": "Desarrollo de Juegos",
    "useCases.gameDevDesc":
      "Skyboxes y ambientes para juegos VR/AR. Listos para HDRI, formatos optimizados, integración instantánea en Unity/Unreal.",
    "useCases.virtualProd": "Producción Virtual",
    "useCases.virtualProdDesc":
      "Fondos para pantallas LED, contenido de mapeo de proyección. Resolución 16K con iluminación auténtica y profundidad atmosférica.",
    "useCases.archViz": "Visualización Arquitectónica",
    "useCases.archVizDesc":
      "Contextos ambientales realistas para renders arquitectónicos. Monumentos patrimoniales, escenas urbanas, paisajes naturales.",
    "useCases.metaverse": "Metaverso y Web3",
    "useCases.metaverseDesc":
      "Ambientes de mundos virtuales, fondos NFT, experiencias inmersivas. Activos únicos creados algorítmicamente.",
    "useCases.digitalArt": "Arte Digital y NFTs",
    "useCases.digitalArtDesc":
      "Obras de arte 360° exclusivas con licencias verificables. Ediciones limitadas, calidad de coleccionista y autenticidad.",
    "useCases.education": "Educación y Museos",
    "useCases.educationDesc":
      "Tours virtuales, preservación cultural, aprendizaje inmersivo. Sitios patrimoniales capturados con precisión algorítmica.",

    // Comparison Section
    "comparison.title": "La Alternativa Inteligente a",
    "comparison.titleHighlight": "Herramientas de Generación y Activos Gratuitos",
    "comparison.genTools": "Herramientas de Generación",
    "comparison.genToolsNote": "Skybox AI, PanoPulse, etc.",
    "comparison.genToolCon1": "Límites de generación mensual ($120-$578/año)",
    "comparison.genToolCon2": "Prompting de prueba y error requerido",
    "comparison.genToolCon3": "Calidad impredecible y consistencia de estilo",
    "comparison.genToolCon4": "Tiempo gastado generando vs. creando",
    "comparison.genToolCon5": "Claridad limitada de licencias comerciales",
    "comparison.ourPlatform": "n3uralia360.art",
    "comparison.ourPlatformNote": "Marketplace Premium Curado",
    "comparison.ourPro1": "Paga una vez, usa para siempre - desde $75/imagen",
    "comparison.ourPro2": "Descarga instantánea, calidad lista para producción",
    "comparison.ourPro3": "Colección curada por escenario y estilo",
    "comparison.ourPro4": "Empieza a crear inmediatamente, sin configuración",
    "comparison.ourPro5": "Licencia comercial completa con indemnización",
    "comparison.legalTitle": "Protección Legal Incluida",
    "comparison.legalDesc":
      "A diferencia de bibliotecas de stock genéricas donde el contenido generado por IA crea incertidumbre de derechos de autor, cada imagen de n3uralia360.art viene con licencia comercial completa e indemnización.",

    // CTA
    "cta.readyToTransform": "Eleva tus Proyectos con",
    "cta.creativeVision": "Activos 360° Premium",
    "cta.joinThousands": "Únete a miles de creadores que confían en n3uralia360.art para sus proyectos inmersivos",
    "cta.startExploring": "Comenzar a Explorar",

    "about.badge": "Acerca de n3uralia360.art • Parte del Grupo n3uralia",
    "about.title": "Revolucionando",
    "about.titleHighlight": "Contenido Visual",
    "about.titleEnd": "para Profesionales",
    "about.subtitle":
      "Somos pioneros en el futuro de imágenes inmersivas con tecnología de IA de vanguardia y contenido 360° de grado profesional que transforma cómo las personas experimentan ambientes digitales. Como parte del innovador grupo n3uralia, entregamos calidad suprema a través de tecnología de plataforma avanzada.",
    "about.whyChoose.badge": "¿Por qué elegir n3uralia360.art?",
    "about.whyChoose.title": "Lo que nos hace diferentes en fotografía 360°",
    "about.whyChoose.subtitle": "Respaldados por los estándares de innovación y excelencia del grupo n3uralia",
    "about.aiGenerated.title": "100% Contenido Generado por IA",
    "about.aiGenerated.desc":
      "A diferencia de las empresas de fotografía tradicionales, cada imagen se crea desde cero utilizando tecnología de IA propietaria desarrollada por el grupo n3uralia. Esto significa escenas únicas que no existen en ningún otro lugar, con iluminación y composición perfectas que serían imposibles de capturar naturalmente.",
    "about.professional.title": "Calidad de Grado Profesional",
    "about.professional.desc":
      "Nuestro pipeline de mejora personalizado, impulsado por la tecnología del grupo n3uralia, transforma la salida de IA en imágenes profesionales con resolución 4K-16K. Cada imagen cumple con los estándares exigentes requeridos para aplicaciones VR comerciales, mapeo de proyección y visualización arquitectónica.",
    "about.mission.title": "Nuestra Misión",
    "about.mission.p1":
      "En n3uralia360.art, parte del grupo n3uralia, creemos que el contenido visual inmersivo debe ser accesible, de alta calidad y elaborado profesionalmente. Nuestra misión es proporcionar a creadores, arquitectos y empresas las herramientas y el contenido que necesitan para dar vida a sus visiones.",
    "about.mission.p2":
      "A través de técnicas avanzadas de generación y mejora de IA desarrolladas dentro del ecosistema del grupo n3uralia, entregamos calidad sin precedentes en imágenes 360° y fisheye que cumplen con los estándares exigentes de aplicaciones profesionales.",
    "about.offer.title": "Lo que Ofrecemos",
    "about.offer.item1": "Imágenes equirectangulares 360° de alta resolución",
    "about.offer.item2": "Fotografía profesional con lente fisheye",
    "about.offer.item3": "Calidad de imagen mejorada por IA y detalle a través de la tecnología del grupo n3uralia",
    "about.offer.item4": "Licencias flexibles para uso comercial",
    "about.offer.item5": "Descargas y acceso instantáneos",
    "about.technology.title": "Nuestra Tecnología",
    "about.technology.subtitle": "Impulsado por el ecosistema innovador de plataformas del grupo n3uralia",
    "about.technology.ai.title": "Mejora de IA",
    "about.technology.ai.desc":
      "Redes neuronales avanzadas mejoran la calidad y el detalle de las imágenes a través de las plataformas del grupo n3uralia",
    "about.technology.capture.title": "Captura Profesional",
    "about.technology.capture.desc": "Equipo de última generación para una captura de imagen prístina",
    "about.technology.qa.title": "Garantía de Calidad",
    "about.technology.qa.desc":
      "Pruebas rigurosas aseguran que cada imagen cumpla con los estándares del grupo n3uralia",
    "about.faq.badge": "Preguntas Frecuentes",
    "about.faq.title": "Aprende Más Sobre Nuestra",
    "about.faq.titleHighlight": "Empresa y Proceso",
    "about.faq.subtitle":
      "Preguntas comunes sobre n3uralia360.art, nuestra tecnología y cómo creamos imágenes 360° profesionales.",
    "about.faq1.q": "¿Qué es n3uralia360.art y cómo comenzó la empresa?",
    "about.faq1.a":
      "n3uralia360.art es una empresa pionera en fotografía 360° generada por IA, parte del innovador grupo n3uralia. Fuimos fundados para cerrar la brecha entre las limitaciones de la fotografía tradicional y la creciente demanda de contenido visual inmersivo. Reconocimos que crear imágenes 360° de alta calidad era costoso, consumía tiempo y a menudo imposible para muchos escenarios creativos. Nuestra solución combina generación de IA de vanguardia con técnicas de mejora profesional desarrolladas dentro del ecosistema del grupo n3uralia para entregar imágenes inmersivas únicas y de alta calidad que cumplen con estándares profesionales.",
    "about.faq2.q": "¿Cómo se compara la fotografía generada por IA con la fotografía 360° tradicional?",
    "about.faq2.a":
      "La fotografía generada por IA ofrece varias ventajas sobre los métodos tradicionales: posibilidades creativas ilimitadas sin restricciones físicas, control perfecto de iluminación y composición, escenas únicas que no existen en la realidad y calidad consistente sin dependencias del clima o la ubicación. Mientras que la fotografía tradicional captura ambientes reales, nuestro enfoque de IA impulsado por la tecnología del grupo n3uralia crea mundos completamente nuevos con calidad de grado profesional, a menudo superando lo que es posible con equipos y técnicas convencionales.",
    "about.faq3.q": "¿Qué estándares de calidad mantiene n3uralia360.art?",
    "about.faq3.a":
      "Mantenemos estándares de calidad rigurosos en todo nuestro pipeline, respaldados por los estándares de excelencia del grupo n3uralia. Cada imagen se somete a mejora profesional para lograr resolución 4K-16K con claridad, precisión de color y detalle superiores. Nuestro proceso de mejora propietario asegura calidad consistente que cumple con los requisitos exigentes de aplicaciones VR comerciales, instalaciones de mapeo de proyección y proyectos de visualización arquitectónica. Probamos cada imagen para especificaciones técnicas y calidad visual antes de hacerla disponible.",
    "about.faq4.q": "¿n3uralia360.art ofrece proyectos de imágenes 360° personalizados?",
    "about.faq4.a":
      "Sí, ofrecemos proyectos de imágenes 360° personalizados para clientes con requisitos específicos. Nuestras capacidades de generación de IA, impulsadas por la tecnología del grupo n3uralia, nos permiten crear ambientes únicos, espacios arquitectónicos o escenas artísticas adaptadas a las necesidades de tu proyecto. Los proyectos personalizados incluyen consulta sobre especificaciones técnicas, múltiples rondas de revisión y entrega en tus formatos y resoluciones preferidos. Contáctanos para discutir tus requisitos específicos y cronograma para soluciones de imágenes personalizadas.",
    "about.faq5.q": "¿Puedes explicar el pipeline tecnológico de n3uralia360.art?",
    "about.faq5.a":
      "Nuestro pipeline tecnológico consta de tres etapas principales: generación de IA utilizando modelos propietarios entrenados específicamente para imágenes 360° dentro del ecosistema del grupo n3uralia, mejora profesional a través de herramientas personalizadas que mejoran la resolución y la calidad, y pruebas de garantía de calidad para asegurar que cada imagen cumpla con nuestros estándares profesionales. Cada herramienta en nuestro pipeline está construida desde cero por el grupo n3uralia, dándonos control completo sobre el proceso creativo y la calidad de la salida final. Este enfoque nos permite entregar constantemente imágenes únicas y de alta calidad que superan las limitaciones de la fotografía tradicional.",
    "about.ready.title": "¿Listo para Empezar?",
    "about.ready.subtitle":
      "Únete a miles de profesionales que confían en n3uralia360.art y el grupo n3uralia para sus necesidades de contenido inmersivo.",
    "about.ready.browse": "Explorar Galería",
    "about.ready.contact": "Contáctanos",

    // Email Contact Modal
    "contact.title": "Contáctanos",
    "contact.description": "Ponte en contacto con N3uralia360",
    "contact.emailLabel": "Dirección de Correo",
    "contact.copy": "Copiar",
    "contact.copied": "Copiado",
    "contact.quotationTitle": "Solicita una Cotización",
    "contact.quotationIntro": "Al solicitar una cotización para nuestros servicios o productos, por favor incluye:",
    "contact.quotationItem1": "Tipo de proyecto (instalación de domo, ambiente VR, medios espaciales, etc.)",
    "contact.quotationItem2": "Tamaño y especificaciones del lugar",
    "contact.quotationItem3": "Cronograma y rango presupuestario (si aplica)",
    "contact.quotationItem4": "Tu información de contacto y método de comunicación preferido",
    "contact.quotationItem5": "Cualquier imagen de referencia, inspiración o requisitos detallados",
    "contact.quotationResponse": "Nuestro equipo proporcionará una cotización personalizada dentro de 24-48 horas.",
    "contact.instructionsTitle": "Cómo Contactarnos",
    "contact.instruction1": "Copia la dirección de correo arriba",
    "contact.instruction2": "Abre tu cliente de correo preferido (Gmail, Outlook, Apple Mail, etc.)",
    "contact.instruction3": "Pega la dirección de correo en el campo 'Para'",
    "contact.instruction4": "Escribe tu mensaje con los detalles anteriores y envía",
    "contact.responseTime": "Generalmente respondemos dentro de 24 horas en días hábiles.",
    "contact.benefitsTitle": "¿Por qué usar tu cliente de correo?",
    "contact.benefit1": "✓ Usa cualquier proveedor de correo (Gmail, Outlook, Apple Mail, etc.)",
    "contact.benefit2": "✓ Mantén tu historial de correos y mensajes enviados",
    "contact.benefit3": "✓ Respuesta más rápida y mejor comunicación",
    "contact.benefit4": "✓ Tu privacidad y seguridad",
    "contact.closeButton": "Cerrar",

    "header.shoppingCart": "Carrito de Compras",
    "header.cartEmpty": "Tu carrito está vacío",
    "header.total": "Total",
    "header.proceedToCheckout": "Proceder al Pago",

    "collections.badge": "Colecciones Curadas",
    "collections.title": "Historias Visuales en",
    "collections.titleHighlight": "Detalle Inmersivo",
    "collections.subtitle":
      "Cada colección es una narrativa cuidadosamente elaborada—desde monumentos antiguos preservando el patrimonio humano hasta paisajes futuristas imaginando el mañana. Descubre conjuntos temáticos diseñados para creadores que valoran el arte y la autenticidad.",
    "collections.stats.collections": "Colecciones",
    "collections.stats.resolution": "Resolución",
    "collections.stats.format": "Formato",
    "collections.coming.soon": "Próximamente",
    "collections.coming.desc":
      "Nuestros curadores están ensamblando colecciones extraordinarias. Vuelve pronto para descubrir narrativas visuales inmersivas.",
    "collections.coming.exploreImages": "Explorar Imágenes Individuales",
    "collections.subcollections": "Explorar Sub-Colecciones",
    "collections.format": "Formato",
    "collections.format.360": "360° Panorámico",
    "collections.license": "Licencia",
    "collections.license.commercial": "Uso Comercial",
    "collections.viewFull": "Ver Colección Completa",
    "collections.individualPurchase": "Compra Individual",
    "collections.buyingSeparately": "Comprando todas las {count} fotos por separado",
    "collections.bundlePrice": "Precio del Paquete",
    "collections.completeCollection": "Colección completa",
    "collections.youSave": "Ahorras",
    "collections.preferIndividual": "¿Prefieres Imágenes Individuales?",
    "collections.browseGallery":
      "Explora nuestra galería completa para encontrar imágenes 360° específicas con filtros avanzados por formato, tema y estilo. Perfecto para proyectos de un solo uso.",
    "collections.browseButton": "Explorar Galería",
    "collections.exploreCollection": "Explorar Colección",

    // Shows & Theatre Pages (Spanish)
    "shows.theatreTitle": "Teatro",
    "shows.theatreSubtitle": "Sumérgete en experiencias de video curadas",
    "shows.theatreDescription": "Pantalla más grande ofrece mejor experiencia. Mira nuestra colección curada de contenido inmersivo de domo en un entorno de escala de cine.",
    "shows.enterTheatre": "Entrar al Teatro",

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
    "footer.brandDescription": "Cultural immersive media studio creating experiences across dome installations, VR environments, and spatial media.",
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
    "footer.contact": "Contact",
    "footer.legalTitle": "Legal",
    "footer.licensingTerms": "Licensing Terms",
    "footer.licensingContract": "Licensing Contract",
    "footer.accountTitle": "Account",
    "footer.profile": "Profile",
    "footer.orders": "Orders",
    "footer.downloads": "Downloads",
    "footer.settings": "Settings",
    "footer.copyright": "© {year} N3uralia360. All rights reserved.",
    "footer.poweredBy": "Powered by N3uralia360 Studios",

    // Hero Section
    "hero.badge": "Immersive. Cultural. Authorial.",
    "hero.title": "Immersive Worlds.",
    "hero.titleHighlight": "Cultural Stories.",
    "hero.subtitle":
      "N3uralia360 is a cultural immersive media studio. We author experiences across dome installations, VR environments, performance loops, and spatial media. Each work begins with deep cultural research and unfolds through collaborative artistic vision.",
    "hero.description":
      "From heritage preservation to speculative futures, from institutional commissions to curated public collections—we create immersive narratives that transcend boundaries and engage audiences at the intersection of culture, art, and technology.",
    "hero.cta.explore": "Explore Works",
    "hero.cta.demo": "View Our Studio",
    "hero.videoPlaceholder": "[ Immersive Environment Backdrop ]",

    "hero.imageOfDay": "Featured Work",
    "hero.viewDetails": "View Details & License",
    "hero.offToday": "% Available",

    // Homepage Hero Section
    "hero.studioTitle": "Studio",
    "hero.studioSubtitle": "Built to Perform",
    "hero.studioDesc1": "Cinematic dome stories, seamless immersive loops, and VR-ready environments — crafted for dome operators, immersive events, and live performance.",
    "hero.studioDesc2": "Projection-ready. Dome-correct. Instantly deployable.",
    "hero.exploreStudio": "Explore Studio",
    "hero.videoNotAvailable": "Video not available",

    // Shows Section - Landing Page
    "shows.title": "Shows",
    "shows.subtitle": "Cinematic Dome Stories",
    "shows.description": "Designed as mini-shows that hold audience attention from beginning to end, our Shows are perfect for:",
    "shows.useCase1": "School dome programming",
    "shows.useCase2": "Festival headline segments",
    "shows.useCase3": "Branded immersive presentations",
    "shows.useCase4": "Themed event openings",
    "shows.exploreShows": "Explore Shows",

    // Shows Page - Detailed Page
    "showsPage.pageTitle": "Shows",
    "showsPage.pageSubtitle": "Cinematic Dome Stories",
    "showsPage.descriptionDefault": "From mythical realms to sacred atmospheres, immerse in tales of wonder.",
    "showsPage.perfectFor": "Perfect for:",
    "showsPage.perfectFor1": "Family dome nights",
    "showsPage.perfectFor2": "Cultural programming",
    "showsPage.perfectFor3": "Art and experience-focused events",
    "showsPage.teasersTitle": "Teasers:",
    "showsPage.teasersDesc1": "Full-length shows and dome editions are available. If you are interested in a specific episode or would like to commission a custom production, please contact our team.",
    "showsPage.teasersDesc2": "We develop immersive content from concept to final delivery.",
    "showsPage.characterDesign": "Original and consistent character design",
    "showsPage.narrativeBuilding": "Cohesive narrative and visual building",
    "showsPage.effectsEditing": "Dynamic scene editing with special effects",
    "showsPage.sendEmail": "Send Email",
    "showsPage.whatsapp": "WhatsApp",
    "showsPage.loadMore": "Load More",

    // Shows Page - Mythic Labels
    "shows.mythicLabel1": "El Tayukú Presence",
    "shows.mythicLabel2": "Halloween in Lego City",
    "shows.mythicLabel3": "Vibrant Ritual of New Caledonia",
    "shows.mythicLabel4": "Hages of Blue Ocean",
    "shows.mythicLabel5": "Angry Wind Spirit",

    // Shows Page - Mythic Categories
    "shows.categoryAsian": "Asian",
    "shows.categoryMesoamerican": "Mesoamerican",
    "shows.categoryGreek": "Greek",
    "shows.categoryEgyptian": "Egyptian",

    // Shows Page - Teaser Titles
    "shows.teaserTitle1": "Teaser Video 1",
    "shows.teaserTitle2": "Teaser Video 2",
    "shows.teaserTitle3": "Teaser Video 3",

    // Environments Section - Landing Page
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
    return translations[language][key] || key
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
