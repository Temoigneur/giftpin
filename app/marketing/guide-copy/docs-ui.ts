import type { Locale } from "../../shared/i18n";

/** Words around the documentation menu and the "who is this for" tag on each guide. Pure data. */
export type DocsUi = {
  menu: string;
  merchants: string;
  customers: string;
  /** Short link names, in order: setup, customize, pro, registry, guest. */
  links: [string, string, string, string, string];
  /** The tag in each guide's header. */
  forMerchant: string;
  forRegistrant: string;
  forGuest: string;
  onPage: string;
  /** Note under the merchant guides' header; {n} is the number of the last step. */
  order: string;
  /** Link label before the name of the next guide. */
  next: string;
};

export const DOCS_UI: Record<Locale, DocsUi> = {
  en: { menu: "Documentation menu", merchants: "For Shopify store owners", customers: "For your customers", links: ["Setup", "Customize", "Pro features", "Registrants", "Guests"], forMerchant: "Shopify store owners", forRegistrant: "Registrants", forGuest: "Guests", onPage: "On this page" , order: "Do these steps in order. They are numbered 1 to {n} across the Setup, Customize and Pro pages, and the numbers carry on from one page to the next.", next: "Next" },
  fr: { menu: "Menu de la documentation", merchants: "Pour les propriétaires de boutique Shopify", customers: "Pour vos clients", links: ["Installation", "Personnalisation", "Fonctions Pro", "Créateurs de liste", "Invités"], forMerchant: "Propriétaires de boutique Shopify", forRegistrant: "Créateurs de liste", forGuest: "Invités", onPage: "Sur cette page" , order: "Suivez ces étapes dans l'ordre. Elles sont numérotées de 1 à {n} sur les pages Installation, Personnalisation et Pro, et la numérotation continue d'une page à l'autre.", next: "Suite" },
  es: { menu: "Menú de la documentación", merchants: "Para propietarios de tiendas Shopify", customers: "Para tus clientes", links: ["Configuración", "Personalización", "Funciones Pro", "Quien crea la lista", "Invitados"], forMerchant: "Propietarios de tiendas Shopify", forRegistrant: "Quien crea la lista", forGuest: "Invitados", onPage: "En esta página" , order: "Sigue estos pasos en orden. Están numerados del 1 al {n} en las páginas Configuración, Personalización y Pro, y la numeración continúa de una página a la siguiente.", next: "Siguiente" },
  de: { menu: "Dokumentationsmenü", merchants: "Für Shopify-Shopbetreiber", customers: "Für Ihre Kunden", links: ["Einrichtung", "Anpassen", "Pro-Funktionen", "Listenersteller", "Gäste"], forMerchant: "Shopify-Shopbetreiber", forRegistrant: "Listenersteller", forGuest: "Gäste", onPage: "Auf dieser Seite" , order: "Gehen Sie diese Schritte der Reihe nach durch. Sie sind auf den Seiten Einrichtung, Anpassen und Pro von 1 bis {n} nummeriert, und die Nummerierung läuft von Seite zu Seite weiter.", next: "Weiter" },
  "pt-BR": { menu: "Menu da documentação", merchants: "Para lojistas da Shopify", customers: "Para seus clientes", links: ["Configuração", "Personalização", "Recursos Pro", "Quem cria a lista", "Convidados"], forMerchant: "Lojistas da Shopify", forRegistrant: "Quem cria a lista", forGuest: "Convidados", onPage: "Nesta página" , order: "Siga estas etapas em ordem. Elas são numeradas de 1 a {n} nas páginas Configuração, Personalização e Pro, e a numeração continua de uma página para a outra.", next: "Próximo" },
  hi: { menu: "डॉक्यूमेंटेशन मेन्यू", merchants: "Shopify स्टोर मालिकों के लिए", customers: "आपके ग्राहकों के लिए", links: ["सेटअप", "कस्टमाइज़ करें", "Pro फीचर", "रजिस्ट्री बनाने वाले", "मेहमान"], forMerchant: "Shopify स्टोर मालिक", forRegistrant: "रजिस्ट्री बनाने वाले", forGuest: "मेहमान", onPage: "इस पेज पर" , order: "इन चरणों को क्रम से करें। इन्हें सेटअप, कस्टमाइज़ और Pro पेजों पर 1 से {n} तक नंबर दिए गए हैं, और नंबर एक पेज से अगले पेज पर जारी रहते हैं।", next: "अगला" },
  "zh-CN": { menu: "文档菜单", merchants: "面向 Shopify 店主", customers: "面向您的顾客", links: ["设置", "自定义", "Pro 功能", "清单创建者", "访客"], forMerchant: "Shopify 店主", forRegistrant: "清单创建者", forGuest: "访客", onPage: "本页内容" , order: "请按顺序完成这些步骤。它们在“设置”“自定义”和 Pro 页面上从 1 编号到 {n}，编号会从一个页面延续到下一个页面。", next: "下一步" },
  "zh-TW": { menu: "文件選單", merchants: "適用於 Shopify 店主", customers: "適用於您的顧客", links: ["設定", "自訂", "Pro 功能", "清單建立者", "訪客"], forMerchant: "Shopify 店主", forRegistrant: "清單建立者", forGuest: "訪客", onPage: "本頁內容" , order: "請依序完成這些步驟。它們在「設定」「自訂」和 Pro 頁面上從 1 編號到 {n}，編號會從一個頁面延續到下一個頁面。", next: "下一步" },
  ja: { menu: "ドキュメントメニュー", merchants: "Shopifyストアオーナー向け", customers: "お客様向け", links: ["セットアップ", "カスタマイズ", "Pro機能", "リストの作成者", "ゲスト"], forMerchant: "Shopifyストアオーナー", forRegistrant: "リストの作成者", forGuest: "ゲスト", onPage: "このページの内容" , order: "この手順は順番に進めてください。セットアップ、カスタマイズ、Proの各ページで1から{n}まで番号が付いており、番号はページをまたいで続きます。", next: "次へ" },
};
