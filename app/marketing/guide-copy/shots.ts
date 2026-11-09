import type { Locale } from "../../shared/i18n";

/** Real screenshots of the app used by the new guide steps (public/guides/). Alt text per language. */
export const SHOTS: Record<string, { src: string; alt: Record<Locale, string> }> = {
  "qr": {
    "src": "/guides/m12-qr-code.png",
    "alt": {
      "en": "The Your share link box with Share with guests, Copy link and QR code buttons, and a QR code open with a Download QR code button",
      "fr": "Le cadre du lien de partage avec les boutons de partage, Copier le lien et Code QR, et un code QR affiché avec un bouton pour le télécharger",
      "es": "El cuadro del enlace para compartir con los botones de compartir, Copiar enlace y Código QR, y un código QR abierto con un botón para descargarlo",
      "de": "Der Kasten mit dem Teilen-Link, Buttons zum Teilen, Link kopieren und QR-Code sowie ein geöffneter QR-Code mit Download-Button",
      "pt-BR": "A caixa do link de compartilhamento com os botões de compartilhar, Copiar link e Código QR, e um código QR aberto com um botão para baixá-lo",
      "hi": "शेयर लिंक वाला बॉक्स: शेयर, लिंक कॉपी करें और QR कोड बटन, और खुला हुआ QR कोड, डाउनलोड बटन के साथ",
      "zh-CN": "分享链接区域，含分享、复制链接和二维码按钮，并展开了二维码和下载二维码按钮",
      "zh-TW": "分享連結區塊，含分享、複製連結和 QR 碼按鈕，並展開 QR 碼與下載按鈕",
      "ja": "共有リンクの枠。共有、リンクをコピー、QRコードのボタンと、開いたQRコード（ダウンロードボタン付き）"
    }
  },
  "mylink": {
    "src": "/guides/m13-my-registries-link.png",
    "alt": {
      "en": "The My registries link above the registry name on the manage page",
      "fr": "Le lien Mes listes au-dessus du nom de la liste, sur la page de gestion",
      "es": "El enlace Mis listas encima del nombre de la lista, en la página de gestión",
      "de": "Der Link Meine Listen über dem Listennamen auf der Verwaltungsseite",
      "pt-BR": "O link Minhas listas acima do nome da lista, na página de gerenciamento",
      "hi": "मैनेज पेज पर रजिस्ट्री के नाम के ऊपर मेरी रजिस्ट्रियाँ लिंक",
      "zh-CN": "管理页面中清单名称上方的“我的清单”链接",
      "zh-TW": "管理頁面中清單名稱上方的「我的清單」連結",
      "ja": "管理ページのリスト名の上にある「マイリスト」リンク"
    }
  },
  "myregs": {
    "src": "/guides/m14-my-registries.png",
    "alt": {
      "en": "The My registries page, a grid of every registry started with the same email, each with an Open button",
      "fr": "La page Mes listes : toutes les listes créées avec le même e-mail, chacune avec un bouton Ouvrir",
      "es": "La página Mis listas: todas las listas creadas con el mismo correo, cada una con un botón Abrir",
      "de": "Die Seite Meine Listen: alle mit derselben E-Mail erstellten Listen, jeweils mit einem Öffnen-Button",
      "pt-BR": "A página Minhas listas: todas as listas criadas com o mesmo e-mail, cada uma com um botão Abrir",
      "hi": "मेरी रजिस्ट्रियाँ पेज: एक ही ईमेल से बनी सभी रजिस्ट्रियाँ, हर एक पर खोलें बटन",
      "zh-CN": "“我的清单”页面：用同一邮箱创建的所有清单，每个都有“打开”按钮",
      "zh-TW": "「我的清單」頁面：用同一個電子郵件建立的所有清單，每個都有「開啟」按鈕",
      "ja": "「マイリスト」ページ。同じメールアドレスで作成したすべてのリストと、それぞれの「開く」ボタン"
    }
  },
  "chip": {
    "src": "/guides/g1-chip-in.png",
    "alt": {
      "en": "A fund item on a guest's registry page with a goal, an Add to cart button, and the chip-in box with an amount and a Chip in button",
      "fr": "Un cadeau en cagnotte sur la page d'un invité, avec l'objectif, Ajouter au panier et la zone de participation avec un montant et un bouton pour participer",
      "es": "Un regalo con fondo en la página de un invitado, con la meta, Añadir al carrito y el cuadro para aportar con un importe y un botón de aportar",
      "de": "Ein Fonds-Geschenk auf der Gästeseite mit Ziel, In den Warenkorb und dem Beitragsfeld mit Betrag und Button zum Beisteuern",
      "pt-BR": "Um presente de vaquinha na página de um convidado, com a meta, Adicionar ao carrinho e a caixa para contribuir com um valor e um botão de contribuir",
      "hi": "मेहमान के पेज पर फंड वाला गिफ्ट: लक्ष्य, कार्ट में जोड़ें बटन, और रकम तथा योगदान बटन वाला बॉक्स",
      "zh-CN": "访客页面上的基金礼物：显示目标、加入购物车按钮，以及带金额和出资按钮的出资框",
      "zh-TW": "訪客頁面上的基金禮物：顯示目標、加入購物車按鈕，以及含金額與出資按鈕的出資框",
      "ja": "ゲストのページにある資金ギフト。目標額、カートに入れるボタン、金額欄と参加ボタンのある出資ボックス"
    }
  },
  "remind": {
    "src": "/guides/g2-reminder.png",
    "alt": {
      "en": "The reminder box on a guest's registry page, with an email field and a Remind me button",
      "fr": "La zone de rappel sur la page d'un invité, avec un champ e-mail et un bouton de rappel",
      "es": "El cuadro de recordatorio en la página de un invitado, con un campo de correo y un botón de recordatorio",
      "de": "Der Erinnerungskasten auf der Gästeseite mit E-Mail-Feld und Erinnerungs-Button",
      "pt-BR": "A caixa de lembrete na página de um convidado, com um campo de e-mail e um botão de lembrete",
      "hi": "मेहमान के पेज पर रिमाइंडर बॉक्स: ईमेल फ़ील्ड और रिमाइंडर बटन",
      "zh-CN": "访客页面上的提醒框，含邮箱输入框和提醒按钮",
      "zh-TW": "訪客頁面上的提醒框，含電子郵件欄位和提醒按鈕",
      "ja": "ゲストのページにあるリマインダー欄。メールアドレス欄とリマインドボタン"
    }
  },
  "panel": {
    "src": "/guides/m15-admin-panel.png",
    "alt": {
      "en": "A product page in the Shopify admin with the Giftpin registry panel open, listing the registries that include the product",
      "fr": "Une page produit dans l'admin Shopify avec le panneau Giftpin ouvert, listant les listes qui contiennent le produit",
      "es": "Una página de producto en el administrador de Shopify con el panel de Giftpin abierto, con las listas que incluyen el producto",
      "de": "Eine Produktseite im Shopify-Admin mit geöffnetem Giftpin-Bereich, der die Listen mit diesem Produkt zeigt",
      "pt-BR": "Uma página de produto no admin da Shopify com o painel do Giftpin aberto, listando as listas que incluem o produto",
      "hi": "Shopify एडमिन में प्रोडक्ट पेज, Giftpin पैनल खुला हुआ, जिसमें वे रजिस्ट्रियाँ दिख रही हैं जिनमें यह प्रोडक्ट है",
      "zh-CN": "Shopify 后台的商品页面，已打开 Giftpin 面板，列出包含该商品的清单",
      "zh-TW": "Shopify 後台的商品頁面，已開啟 Giftpin 面板，列出包含該商品的清單",
      "ja": "Shopify管理画面の商品ページ。Giftpinパネルを開き、その商品を含むリストを表示"
    }
  },
  "find": {
    "src": "/guides/g3-find-registry.png",
    "alt": {
      "en": "The Find a registry page with a Name box and a Search button",
      "fr": "La page Trouver une liste avec un champ Nom et un bouton Rechercher",
      "es": "La página Buscar una lista con un campo Nombre y un botón Buscar",
      "de": "Die Seite Liste finden mit einem Namensfeld und einem Suchen-Button",
      "pt-BR": "A página Encontrar uma lista com um campo Nome e um botão Buscar",
      "hi": "रजिस्ट्री खोजें पेज, नाम वाला बॉक्स और खोजें बटन के साथ",
      "zh-CN": "“查找清单”页面，含名称输入框和搜索按钮",
      "zh-TW": "「尋找清單」頁面，含名稱輸入框和搜尋按鈕",
      "ja": "「リストを探す」ページ。名前の入力欄と検索ボタン"
    }
  },
  "installStore": {
    "src": "/guides/m1-install-store.png",
    "alt": {
      "en": "The Giftpin page on the Shopify App Store with the Install button boxed in red and numbered 1",
      "fr": "La page Giftpin sur le Shopify App Store, bouton Installer encadré en rouge et numéroté 1",
      "es": "La página de Giftpin en la Shopify App Store con el botón Instalar enmarcado en rojo y numerado 1",
      "de": "Die Giftpin-Seite im Shopify App Store, der Installieren-Button rot umrandet und mit 1 nummeriert",
      "pt-BR": "A página do Giftpin na Shopify App Store com o botão Instalar destacado em vermelho e numerado 1",
      "hi": "Shopify App Store पर Giftpin का पेज, इंस्टॉल बटन लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 应用商店中的 Giftpin 页面，“安装”按钮用红框标出并编号为 1",
      "zh-TW": "Shopify App Store 中的 Giftpin 頁面，「安裝」按鈕以紅框標示並編號 1",
      "ja": "Shopify App StoreのGiftpinのページ。「インストール」ボタンが赤い枠と番号1で示されている"
    }
  },
  "installApprove": {
    "src": "/guides/m1-install-approve.png",
    "alt": {
      "en": "The permissions screen with the Install button boxed in red and numbered 2",
      "fr": "L'écran des autorisations, bouton Installer encadré en rouge et numéroté 2",
      "es": "La pantalla de permisos con el botón Instalar enmarcado en rojo y numerado 2",
      "de": "Der Berechtigungsbildschirm, der Installieren-Button rot umrandet und mit 2 nummeriert",
      "pt-BR": "A tela de permissões com o botão Instalar destacado em vermelho e numerado 2",
      "hi": "अनुमतियों वाली स्क्रीन, इंस्टॉल बटन लाल बॉक्स में और नंबर 2 के साथ",
      "zh-CN": "权限确认界面，“安装”按钮用红框标出并编号为 2",
      "zh-TW": "權限確認畫面，「安裝」按鈕以紅框標示並編號 2",
      "ja": "権限の確認画面。「インストール」ボタンが赤い枠と番号2で示されている"
    }
  },
  "themeSave": {
    "src": "/guides/m2-theme-save.png",
    "alt": {
      "en": "The theme editor with the Save button at the top right boxed in red and numbered 1",
      "fr": "L'éditeur de thème, bouton Enregistrer en haut à droite encadré en rouge et numéroté 1",
      "es": "El editor de temas con el botón Guardar, arriba a la derecha, enmarcado en rojo y numerado 1",
      "de": "Der Theme-Editor, der Speichern-Button oben rechts rot umrandet und mit 1 nummeriert",
      "pt-BR": "O editor de temas com o botão Salvar, no canto superior direito, destacado em vermelho e numerado 1",
      "hi": "थीम एडिटर, ऊपर दाईं ओर सेव बटन लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "主题编辑器，右上角的“保存”按钮用红框标出并编号为 1",
      "zh-TW": "主題編輯器，右上角的「儲存」按鈕以紅框標示並編號 1",
      "ja": "テーマエディタ。右上の「保存」ボタンが赤い枠と番号1で示されている"
    }
  }
};
