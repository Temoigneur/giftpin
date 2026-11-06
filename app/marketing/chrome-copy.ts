import { LOCALES, LOCALE_NAMES, toLocale, type Locale } from "../shared/i18n";

/**
 * The words around every giftpin.app page: header, menu, footer and the
 * install button, in each language. Page bodies are translated separately
 * (see guide-copy/); a page that isn't translated yet keeps its English body
 * under this translated frame. Not a `.server` file (CLAUDE.md hard rule 2).
 */
export type Chrome = {
  skip: string;
  homeLabel: string;
  navLabel: string;
  menu: string;
  language: string;
  features: string;
  pricing: string;
  faq: string;
  demo: string;
  install: string;
  installNote: string;
  early: string;
  earlyNote: string;
  seePricing: string;
  tagline: string;
  product: string;
  guides: string;
  company: string;
  setup: string;
  creating: string;
  app: string;
  wedding: string;
  baby: string;
  home: string;
  compare: string;
  giftCards: string;
  holiday: string;
  privacy: string;
  fine: string;
};

export const CHROME: Record<Locale, Chrome> = {
  en: {
    skip: "Skip to content",
    homeLabel: "Giftpin home",
    navLabel: "Main",
    menu: "Menu",
    language: "Language",
    features: "Features",
    pricing: "Pricing",
    faq: "FAQ",
    demo: "Demo",
    install: "Install on Shopify",
    installNote: "Free to install from the Shopify App Store.",
    early: "Get early access",
    earlyNote: "Coming soon to the Shopify App Store. Tell us you're interested and we'll write when it's live.",
    seePricing: "See pricing",
    tagline: "The gift registry for Shopify stores that isn't limited to your catalog, and still puts your products first.",
    product: "Product",
    guides: "Guides",
    company: "Company",
    setup: "Setup guide",
    creating: "Creating a registry",
    app: "Gift registry app",
    wedding: "Universal wedding registry",
    baby: "Baby registry",
    home: "Home goods stores",
    compare: "Choosing a registry app",
    giftCards: "Gift cards",
    holiday: "Holiday wish lists",
    privacy: "Privacy policy",
    fine: "© Giftpin. Shopify, Shop Pay, Apple Pay, Google Pay, Babylist and Zola are trademarks of their owners. Giftpin isn't affiliated with Babylist or Zola.",
  },
  fr: {
    skip: "Aller au contenu",
    homeLabel: "Accueil Giftpin",
    navLabel: "Principal",
    menu: "Menu",
    language: "Langue",
    features: "Fonctionnalités",
    pricing: "Tarifs",
    faq: "FAQ",
    demo: "Démo",
    install: "Installer sur Shopify",
    installNote: "Installation gratuite depuis la boutique d'applications Shopify.",
    early: "Accès anticipé",
    earlyNote: "Bientôt dans la boutique d'applications Shopify. Dites-nous que ça vous intéresse et nous vous écrirons à son lancement.",
    seePricing: "Voir les tarifs",
    tagline: "La liste de cadeaux pour les boutiques Shopify qui ne se limite pas à votre catalogue, tout en mettant vos produits en avant.",
    product: "Produit",
    guides: "Guides",
    company: "Entreprise",
    setup: "Guide d'installation",
    creating: "Créer une liste",
    app: "Application de liste de cadeaux",
    wedding: "Liste de mariage universelle",
    baby: "Liste de naissance",
    home: "Boutiques d'articles pour la maison",
    compare: "Choisir une application de liste",
    giftCards: "Cartes-cadeaux",
    holiday: "Listes de souhaits des Fêtes",
    privacy: "Politique de confidentialité",
    fine: "© Giftpin. Shopify, Shop Pay, Apple Pay, Google Pay, Babylist et Zola sont des marques de leurs propriétaires. Giftpin n'est affilié ni à Babylist ni à Zola.",
  },
  es: {
    skip: "Saltar al contenido",
    homeLabel: "Inicio de Giftpin",
    navLabel: "Principal",
    menu: "Menú",
    language: "Idioma",
    features: "Funciones",
    pricing: "Precios",
    faq: "Preguntas frecuentes",
    demo: "Demo",
    install: "Instalar en Shopify",
    installNote: "Instalación gratuita desde la tienda de aplicaciones de Shopify.",
    early: "Acceso anticipado",
    earlyNote: "Próximamente en la tienda de aplicaciones de Shopify. Dinos que te interesa y te escribiremos cuando esté disponible.",
    seePricing: "Ver precios",
    tagline: "La lista de regalos para tiendas Shopify que no se limita a tu catálogo y aun así pone tus productos primero.",
    product: "Producto",
    guides: "Guías",
    company: "Empresa",
    setup: "Guía de configuración",
    creating: "Crear una lista",
    app: "Aplicación de lista de regalos",
    wedding: "Lista de bodas universal",
    baby: "Lista de bebé",
    home: "Tiendas de artículos para el hogar",
    compare: "Elegir una aplicación de listas",
    giftCards: "Tarjetas de regalo",
    holiday: "Listas de deseos navideñas",
    privacy: "Política de privacidad",
    fine: "© Giftpin. Shopify, Shop Pay, Apple Pay, Google Pay, Babylist y Zola son marcas de sus propietarios. Giftpin no está afiliado a Babylist ni a Zola.",
  },
  de: {
    skip: "Zum Inhalt springen",
    homeLabel: "Giftpin Startseite",
    navLabel: "Hauptmenü",
    menu: "Menü",
    language: "Sprache",
    features: "Funktionen",
    pricing: "Preise",
    faq: "FAQ",
    demo: "Demo",
    install: "Auf Shopify installieren",
    installNote: "Kostenlos im Shopify App Store installieren.",
    early: "Frühen Zugang sichern",
    earlyNote: "Bald im Shopify App Store. Sag uns, dass du Interesse hast, und wir melden uns, sobald es soweit ist.",
    seePricing: "Preise ansehen",
    tagline: "Die Geschenkliste für Shopify-Shops, die nicht auf Ihren Katalog beschränkt ist und trotzdem Ihre Produkte an die erste Stelle setzt.",
    product: "Produkt",
    guides: "Anleitungen",
    company: "Unternehmen",
    setup: "Einrichtungsanleitung",
    creating: "Eine Liste erstellen",
    app: "Geschenklisten-App",
    wedding: "Universelle Hochzeitsliste",
    baby: "Babyliste",
    home: "Shops für Wohnartikel",
    compare: "Eine Listen-App auswählen",
    giftCards: "Geschenkkarten",
    holiday: "Weihnachts-Wunschlisten",
    privacy: "Datenschutzerklärung",
    fine: "© Giftpin. Shopify, Shop Pay, Apple Pay, Google Pay, Babylist und Zola sind Marken ihrer jeweiligen Inhaber. Giftpin ist nicht mit Babylist oder Zola verbunden.",
  },
  "pt-BR": {
    skip: "Ir para o conteúdo",
    homeLabel: "Início do Giftpin",
    navLabel: "Principal",
    menu: "Menu",
    language: "Idioma",
    features: "Recursos",
    pricing: "Preços",
    faq: "Perguntas frequentes",
    demo: "Demonstração",
    install: "Instalar na Shopify",
    installNote: "Instalação gratuita pela Shopify App Store.",
    early: "Acesso antecipado",
    earlyNote: "Em breve na Shopify App Store. Diga que você tem interesse e escreveremos quando estiver no ar.",
    seePricing: "Ver preços",
    tagline: "A lista de presentes para lojas Shopify que não se limita ao seu catálogo e ainda coloca seus produtos em primeiro lugar.",
    product: "Produto",
    guides: "Guias",
    company: "Empresa",
    setup: "Guia de configuração",
    creating: "Criar uma lista",
    app: "Aplicativo de lista de presentes",
    wedding: "Lista de casamento universal",
    baby: "Lista de bebê",
    home: "Lojas de artigos para casa",
    compare: "Escolher um aplicativo de listas",
    giftCards: "Cartões-presente",
    holiday: "Listas de desejos de fim de ano",
    privacy: "Política de privacidade",
    fine: "© Giftpin. Shopify, Shop Pay, Apple Pay, Google Pay, Babylist e Zola são marcas de seus respectivos donos. O Giftpin não é afiliado ao Babylist nem à Zola.",
  },
};

const flag = (inner: string) =>
  `<svg class="flag" viewBox="0 0 24 16" width="22" height="15" aria-hidden="true" focusable="false">${inner}<rect width="24" height="16" fill="none" stroke="rgba(0,0,0,.25)"/></svg>`;

/** Small inline flags (no image requests, they render on every OS). English uses the US flag. */
export const FLAGS: Record<Locale, string> = {
  en: flag(
    `<rect width="24" height="16" fill="#fff"/><rect y="0.00" width="24" height="1.25" fill="#b22234"/><rect y="1.23" width="24" height="1.25" fill="#fff"/><rect y="2.46" width="24" height="1.25" fill="#b22234"/><rect y="3.69" width="24" height="1.25" fill="#fff"/><rect y="4.92" width="24" height="1.25" fill="#b22234"/><rect y="6.15" width="24" height="1.25" fill="#fff"/><rect y="7.38" width="24" height="1.25" fill="#b22234"/><rect y="8.62" width="24" height="1.25" fill="#fff"/><rect y="9.85" width="24" height="1.25" fill="#b22234"/><rect y="11.08" width="24" height="1.25" fill="#fff"/><rect y="12.31" width="24" height="1.25" fill="#b22234"/><rect y="13.54" width="24" height="1.25" fill="#fff"/><rect y="14.77" width="24" height="1.25" fill="#b22234"/><rect width="10" height="8.62" fill="#3c3b6e"/><circle cx="1.60" cy="1.30" r=".45" fill="#fff"/><circle cx="3.35" cy="1.30" r=".45" fill="#fff"/><circle cx="5.10" cy="1.30" r=".45" fill="#fff"/><circle cx="6.85" cy="1.30" r=".45" fill="#fff"/><circle cx="8.60" cy="1.30" r=".45" fill="#fff"/><circle cx="1.60" cy="2.85" r=".45" fill="#fff"/><circle cx="3.35" cy="2.85" r=".45" fill="#fff"/><circle cx="5.10" cy="2.85" r=".45" fill="#fff"/><circle cx="6.85" cy="2.85" r=".45" fill="#fff"/><circle cx="8.60" cy="2.85" r=".45" fill="#fff"/><circle cx="1.60" cy="4.40" r=".45" fill="#fff"/><circle cx="3.35" cy="4.40" r=".45" fill="#fff"/><circle cx="5.10" cy="4.40" r=".45" fill="#fff"/><circle cx="6.85" cy="4.40" r=".45" fill="#fff"/><circle cx="8.60" cy="4.40" r=".45" fill="#fff"/><circle cx="1.60" cy="5.95" r=".45" fill="#fff"/><circle cx="3.35" cy="5.95" r=".45" fill="#fff"/><circle cx="5.10" cy="5.95" r=".45" fill="#fff"/><circle cx="6.85" cy="5.95" r=".45" fill="#fff"/><circle cx="8.60" cy="5.95" r=".45" fill="#fff"/><circle cx="1.60" cy="7.50" r=".45" fill="#fff"/><circle cx="3.35" cy="7.50" r=".45" fill="#fff"/><circle cx="5.10" cy="7.50" r=".45" fill="#fff"/><circle cx="6.85" cy="7.50" r=".45" fill="#fff"/><circle cx="8.60" cy="7.50" r=".45" fill="#fff"/>`,
  ),
  fr: flag(`<rect width="8" height="16" fill="#0055a4"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ef4135"/>`),
  es: flag(`<rect width="24" height="16" fill="#c60b1e"/><rect y="4" width="24" height="8" fill="#ffc400"/>`),
  de: flag(`<rect width="24" height="5.34" fill="#000"/><rect y="5.33" width="24" height="5.34" fill="#dd0000"/><rect y="10.66" width="24" height="5.34" fill="#ffce00"/>`),
  "pt-BR": flag(`<rect width="24" height="16" fill="#009c3b"/><path d="M12 2.2L22 8 12 13.8 2 8z" fill="#ffdf00"/><circle cx="12" cy="8" r="3.3" fill="#002776"/>`),
};

export const LANG_COOKIE = "giftpin-lang";

/**
 * The language for this request: `?lang=` wins (it is what a shared or
 * indexed link carries), then the cookie the language menu sets so the choice
 * sticks as the visitor moves around the site, otherwise English.
 */
export function siteLocaleFromRequest(request: Request): Locale {
  const v = new URL(request.url).searchParams.get("lang");
  if (v) return toLocale(v);
  const cookie = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]+)`))?.[1];
  return cookie ? toLocale(decodeURIComponent(cookie)) : "en";
}

export { LOCALES, LOCALE_NAMES };
