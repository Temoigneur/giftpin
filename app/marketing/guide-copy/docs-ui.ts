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
};

export const DOCS_UI: Record<Locale, DocsUi> = {
  en: { menu: "Documentation menu", merchants: "For Shopify store owners", customers: "For your customers", links: ["Setup", "Customize", "Pro features", "Registrants", "Guests"], forMerchant: "Shopify store owners", forRegistrant: "Registrants", forGuest: "Guests", onPage: "On this page" },
  fr: { menu: "Menu de la documentation", merchants: "Pour les propriétaires de boutique Shopify", customers: "Pour vos clients", links: ["Installation", "Personnalisation", "Fonctions Pro", "Créateurs de liste", "Invités"], forMerchant: "Propriétaires de boutique Shopify", forRegistrant: "Créateurs de liste", forGuest: "Invités", onPage: "Sur cette page" },
  es: { menu: "Menú de la documentación", merchants: "Para propietarios de tiendas Shopify", customers: "Para tus clientes", links: ["Configuración", "Personalización", "Funciones Pro", "Quien crea la lista", "Invitados"], forMerchant: "Propietarios de tiendas Shopify", forRegistrant: "Quien crea la lista", forGuest: "Invitados", onPage: "En esta página" },
  de: { menu: "Dokumentationsmenü", merchants: "Für Shopify-Shopbetreiber", customers: "Für Ihre Kunden", links: ["Einrichtung", "Anpassen", "Pro-Funktionen", "Listenersteller", "Gäste"], forMerchant: "Shopify-Shopbetreiber", forRegistrant: "Listenersteller", forGuest: "Gäste", onPage: "Auf dieser Seite" },
  "pt-BR": { menu: "Menu da documentação", merchants: "Para lojistas da Shopify", customers: "Para seus clientes", links: ["Configuração", "Personalização", "Recursos Pro", "Quem cria a lista", "Convidados"], forMerchant: "Lojistas da Shopify", forRegistrant: "Quem cria a lista", forGuest: "Convidados", onPage: "Nesta página" },
  hi: { menu: "डॉक्यूमेंटेशन मेन्यू", merchants: "Shopify स्टोर मालिकों के लिए", customers: "आपके ग्राहकों के लिए", links: ["सेटअप", "कस्टमाइज़ करें", "Pro फीचर", "रजिस्ट्री बनाने वाले", "मेहमान"], forMerchant: "Shopify स्टोर मालिक", forRegistrant: "रजिस्ट्री बनाने वाले", forGuest: "मेहमान", onPage: "इस पेज पर" },
  "zh-CN": { menu: "文档菜单", merchants: "面向 Shopify 店主", customers: "面向您的顾客", links: ["设置", "自定义", "Pro 功能", "清单创建者", "访客"], forMerchant: "Shopify 店主", forRegistrant: "清单创建者", forGuest: "访客", onPage: "本页内容" },
  "zh-TW": { menu: "文件選單", merchants: "適用於 Shopify 店主", customers: "適用於您的顧客", links: ["設定", "自訂", "Pro 功能", "清單建立者", "訪客"], forMerchant: "Shopify 店主", forRegistrant: "清單建立者", forGuest: "訪客", onPage: "本頁內容" },
  ja: { menu: "ドキュメントメニュー", merchants: "Shopifyストアオーナー向け", customers: "お客様向け", links: ["セットアップ", "カスタマイズ", "Pro機能", "リストの作成者", "ゲスト"], forMerchant: "Shopifyストアオーナー", forRegistrant: "リストの作成者", forGuest: "ゲスト", onPage: "このページの内容" },
};
