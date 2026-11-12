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
  /** Short top-bar label for /setup (the footer uses the longer `setup`). */
  setupNav: string;
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
    setupNav: "Setup",
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
    setupNav: "Installation",
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
    setupNav: "Configuración",
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
    setupNav: "Einrichtung",
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
    setupNav: "Configuração",
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
  "hi": {
    skip: "सामग्री पर जाएँ",
    homeLabel: "Giftpin होम",
    navLabel: "मुख्य",
    menu: "मेन्यू",
    language: "भाषा",
    features: "फ़ीचर",
    pricing: "कीमतें",
    faq: "अक्सर पूछे जाने वाले सवाल",
    demo: "डेमो",
    install: "Shopify पर इंस्टॉल करें",
    installNote: "Shopify App Store से मुफ़्त में इंस्टॉल करें।",
    early: "जल्दी एक्सेस पाएँ",
    earlyNote: "Shopify App Store पर जल्द आ रहा है। अपनी रुचि बताएँ, लाइव होते ही हम आपको लिखेंगे।",
    seePricing: "कीमतें देखें",
    tagline: "Shopify स्टोर के लिए गिफ्ट रजिस्ट्री, जो आपके कैटलॉग तक सीमित नहीं है और फिर भी आपके प्रोडक्ट को सबसे आगे रखती है।",
    product: "प्रोडक्ट",
    guides: "गाइड",
    company: "कंपनी",
    setup: "सेटअप गाइड",
    setupNav: "सेटअप",
    creating: "रजिस्ट्री बनाना",
    app: "गिफ्ट रजिस्ट्री ऐप",
    wedding: "यूनिवर्सल वेडिंग रजिस्ट्री",
    baby: "बेबी रजिस्ट्री",
    home: "होम गुड्स स्टोर",
    compare: "रजिस्ट्री ऐप चुनना",
    giftCards: "गिफ्ट कार्ड",
    holiday: "हॉलिडे विश लिस्ट",
    privacy: "प्राइवेसी पॉलिसी",
    fine: "© Giftpin. Shopify, Shop Pay, Apple Pay, Google Pay, Babylist और Zola अपने-अपने मालिकों के ट्रेडमार्क हैं। Giftpin का Babylist या Zola से कोई संबंध नहीं है।",
  },
  "zh-CN": {
    skip: "跳到正文",
    homeLabel: "Giftpin 首页",
    navLabel: "主导航",
    menu: "菜单",
    language: "语言",
    features: "功能",
    pricing: "价格",
    faq: "常见问题",
    demo: "演示",
    install: "安装到 Shopify",
    installNote: "可从 Shopify App Store 免费安装。",
    early: "抢先体验",
    earlyNote: "即将登陆 Shopify App Store。告诉我们您有兴趣，上线后我们会第一时间联系您。",
    seePricing: "查看价格",
    tagline: "适用于 Shopify 店铺的礼物清单，不局限于您的商品目录，同时仍把您的商品放在首位。",
    product: "产品",
    guides: "指南",
    company: "公司",
    setup: "设置指南",
    setupNav: "设置",
    creating: "创建礼物清单",
    app: "礼物清单应用",
    wedding: "通用婚礼清单",
    baby: "宝宝礼物清单",
    home: "家居用品店铺",
    compare: "选择清单应用",
    giftCards: "礼品卡",
    holiday: "节日心愿单",
    privacy: "隐私政策",
    fine: "© Giftpin。Shopify、Shop Pay、Apple Pay、Google Pay、Babylist 和 Zola 是其各自所有者的商标。Giftpin 与 Babylist 或 Zola 无关联。",
  },
  "zh-TW": {
    skip: "跳到內容",
    homeLabel: "Giftpin 首頁",
    navLabel: "主選單",
    menu: "選單",
    language: "語言",
    features: "功能",
    pricing: "價格",
    faq: "常見問題",
    demo: "示範",
    install: "安裝到 Shopify",
    installNote: "可從 Shopify App Store 免費安裝。",
    early: "搶先體驗",
    earlyNote: "即將登陸 Shopify App Store。告訴我們您有興趣，上線後我們會第一時間與您聯絡。",
    seePricing: "查看價格",
    tagline: "適用於 Shopify 商店的禮物清單，不受限於您的商品目錄，同時仍把您的商品放在首位。",
    product: "產品",
    guides: "指南",
    company: "公司",
    setup: "設定指南",
    setupNav: "設定",
    creating: "建立禮物清單",
    app: "禮物清單應用程式",
    wedding: "通用婚禮清單",
    baby: "寶寶禮物清單",
    home: "居家用品商店",
    compare: "選擇清單應用程式",
    giftCards: "禮品卡",
    holiday: "節日願望清單",
    privacy: "隱私權政策",
    fine: "© Giftpin。Shopify、Shop Pay、Apple Pay、Google Pay、Babylist 與 Zola 為其各自所有者的商標。Giftpin 與 Babylist 或 Zola 無關聯。",
  },
  "ja": {
    skip: "本文へスキップ",
    homeLabel: "Giftpin ホーム",
    navLabel: "メイン",
    menu: "メニュー",
    language: "言語",
    features: "機能",
    pricing: "料金",
    faq: "よくある質問",
    demo: "デモ",
    install: "Shopify にインストール",
    installNote: "Shopify アプリストアから無料でインストールできます。",
    early: "先行アクセス",
    earlyNote: "まもなく Shopify アプリストアに登場します。ご興味をお知らせいただければ、公開時にご連絡します。",
    seePricing: "料金を見る",
    tagline: "商品カタログに縛られず、それでも自社商品を一番に紹介できる、Shopify ストア向けのギフトリストです。",
    product: "製品",
    guides: "ガイド",
    company: "会社",
    setup: "セットアップガイド",
    setupNav: "セットアップ",
    creating: "ギフトリストを作る",
    app: "ギフトリストアプリ",
    wedding: "どこでも使える結婚祝いリスト",
    baby: "ベビーギフトリスト",
    home: "ホーム用品のストア",
    compare: "リストアプリの選び方",
    giftCards: "ギフトカード",
    holiday: "ホリデーのほしいものリスト",
    privacy: "プライバシーポリシー",
    fine: "© Giftpin。Shopify、Shop Pay、Apple Pay、Google Pay、Babylist、Zola は各所有者の商標です。Giftpin は Babylist および Zola とは提携していません。",
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
  hi: flag(`<rect width="24" height="5.34" fill="#ff9933"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.66" width="24" height="5.34" fill="#138808"/><circle cx="12" cy="8" r="2" fill="none" stroke="#000080" stroke-width=".5"/>`),
  "zh-CN": flag(`<rect width="24" height="16" fill="#de2910"/><path d="M4.00 1.60L4.54 3.26L6.28 3.26L4.87 4.28L5.41 5.94L4.00 4.92L2.59 5.94L3.13 4.28L1.72 3.26L3.46 3.26zM7.31 2.01L7.70 1.57L7.40 1.07L7.93 1.30L8.31 0.86L8.26 1.44L8.80 1.67L8.23 1.80L8.18 2.38L7.88 1.88zM8.81 3.31L9.33 3.06L9.25 2.48L9.65 2.90L10.17 2.64L9.90 3.16L10.31 3.57L9.73 3.47L9.46 3.99L9.38 3.41zM8.83 5.38L9.41 5.36L9.57 4.80L9.77 5.35L10.35 5.33L9.89 5.68L10.09 6.23L9.61 5.91L9.15 6.26L9.31 5.70zM7.38 6.70L7.92 6.91L8.28 6.45L8.26 7.03L8.80 7.24L8.24 7.39L8.21 7.97L7.89 7.49L7.33 7.64L7.69 7.19z" fill="#ffde00"/>`),
  "zh-TW": flag(`<rect width="24" height="16" fill="#fe0000"/><rect width="12" height="8" fill="#000095"/><circle cx="6" cy="4" r="2.4" fill="#fff"/>`),
  ja: flag(`<rect width="24" height="16" fill="#fff"/><circle cx="12" cy="8" r="4.8" fill="#bc002d"/>`),
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
