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
    "src": "/guides/g1-find-empty.png",
    "alt": {
      "en": "The Find a registry page: the name box boxed in red and numbered 1, and the Search button boxed and numbered 2",
      "fr": "La page Trouver une liste : le champ du nom encadré en rouge et numéroté 1, et le bouton Rechercher encadré et numéroté 2",
      "es": "La página Buscar un registro: el cuadro del nombre enmarcado en rojo y numerado 1, y el botón Buscar enmarcado y numerado 2",
      "de": "Die Seite Liste finden: das Namensfeld rot umrandet und mit 1 nummeriert und der Button Suchen umrandet und mit 2 nummeriert",
      "pt-BR": "A página Encontrar uma lista: a caixa do nome destacada em vermelho e numerada 1, e o botão Buscar destacado e numerado 2",
      "hi": "रजिस्ट्री खोजें पेज: नाम का बॉक्स लाल बॉक्स में और नंबर 1 के साथ, और खोजें बटन बॉक्स में और नंबर 2 के साथ",
      "zh-CN": "“查找清单”页面：名称输入框以红框标示并编号 1，“搜索”按钮以红框标示并编号 2",
      "zh-TW": "「尋找清單」頁面：名稱輸入框以紅框標示並編號 1，「搜尋」按鈕以紅框標示並編號 2",
      "ja": "「リストを探す」ページ。名前の入力欄が赤い枠と番号1、「検索」ボタンが赤い枠と番号2で示されている"
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
  },
  "overviewTheme": {
    "src": "/guides/p13-overview-theme.png",
    "alt": {
      "en": "The Add Giftpin to your theme card on Overview with its four buttons boxed in red and numbered in order: Add button to product pages 1, Add registry links 2, Add heart to product pages 3, Add saved items to the cart page 4",
      "fr": "La carte Ajouter Giftpin à votre thème sur l'Aperçu, avec ses quatre boutons encadrés en rouge et numérotés dans l'ordre : Ajouter le bouton aux pages produit 1, Ajouter les liens de registre 2, Ajouter le cœur aux pages produit 3, Ajouter les articles enregistrés à la page panier 4",
      "es": "La tarjeta Añade Giftpin a tu tema en el Resumen, con sus cuatro botones enmarcados en rojo y numerados en orden: Añadir botón a páginas de producto 1, Añadir enlaces de registro 2, Añadir corazón a páginas de producto 3, Añadir artículos guardados a la página del carrito 4",
      "de": "Die Karte Giftpin zu Ihrem Theme hinzufügen auf der Übersicht, mit vier rot umrandeten und der Reihe nach nummerierten Buttons: Button zu Produktseiten hinzufügen 1, Listen-Links hinzufügen 2, Herz zu Produktseiten hinzufügen 3, Gemerkte Artikel zur Warenkorbseite hinzufügen 4",
      "pt-BR": "O cartão Adicione o Giftpin ao seu tema na Visão geral, com seus quatro botões destacados em vermelho e numerados em ordem: Adicionar botão às páginas de produto 1, Adicionar links de lista 2, Adicionar coração às páginas de produto 3, Adicionar itens salvos à página do carrinho 4",
      "hi": "ओवरव्यू पर 'अपनी थीम में Giftpin जोड़ें' कार्ड, चारों बटन लाल बॉक्स में और क्रम से नंबर: प्रोडक्ट पेज पर बटन जोड़ें 1, रजिस्ट्री लिंक जोड़ें 2, प्रोडक्ट पेज पर दिल जोड़ें 3, कार्ट पेज पर सहेजे आइटम जोड़ें 4",
      "zh-CN": "“概览”上的“将 Giftpin 添加到主题”卡片，四个按钮依次以红框标示并编号：将按钮添加到商品页 1、添加清单链接 2、将爱心添加到商品页 3、将已收藏商品添加到购物车页 4",
      "zh-TW": "「總覽」上的「將 Giftpin 加入佈景主題」卡片，四個按鈕依序以紅框標示並編號：將按鈕加入商品頁 1、加入清單連結 2、將愛心加入商品頁 3、將已收藏商品加入購物車頁 4",
      "ja": "概要の「テーマにGiftpinを追加」カード。4つのボタンが赤い枠で順に番号付けされている：商品ページにボタンを追加 1、リストのリンクを追加 2、商品ページにハートを追加 3、保存済みアイテムをカートページに追加 4"
    }
  },
  "settingsSaveTop": {
    "src": "/guides/m4-settings-save-top.png",
    "alt": {
      "en": "The top of Giftpin's Settings page with the Save button at the top right boxed in red and numbered 1",
      "fr": "Le haut de la page Réglages de Giftpin, bouton Enregistrer en haut à droite encadré en rouge et numéroté 1",
      "es": "La parte superior de la página de Ajustes de Giftpin, con el botón Guardar arriba a la derecha enmarcado en rojo y numerado 1",
      "de": "Der obere Teil der Giftpin-Einstellungen, der Speichern-Button oben rechts rot umrandet und mit 1 nummeriert",
      "pt-BR": "O topo da página de Configurações do Giftpin, com o botão Salvar no canto superior direito destacado em vermelho e numerado 1",
      "hi": "Giftpin की सेटिंग पेज का ऊपरी हिस्सा, ऊपर दाईं ओर सेव बटन लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Giftpin 设置页面顶部，右上角的“保存”按钮用红框标出并编号为 1",
      "zh-TW": "Giftpin 設定頁面頂部，右上角的「儲存」按鈕以紅框標示並編號 1",
      "ja": "Giftpinの設定ページの上部。右上の「保存」ボタンが赤い枠と番号1で示されている"
    }
  },
  "settingsSaveBottom": {
    "src": "/guides/m4-settings-save-bottom.png",
    "alt": {
      "en": "The Automatic emails section with the lower Save button under it boxed in red and numbered 2",
      "fr": "La section Courriels automatiques avec le bouton Enregistrer du bas encadré en rouge et numéroté 2",
      "es": "La sección de correos automáticos con el botón Guardar inferior enmarcado en rojo y numerado 2",
      "de": "Der Bereich Automatische E-Mails mit dem unteren Speichern-Button, rot umrandet und mit 2 nummeriert",
      "pt-BR": "A seção de e-mails automáticos com o botão Salvar inferior destacado em vermelho e numerado 2",
      "hi": "स्वचालित ईमेल सेक्शन और उसके नीचे का सेव बटन, लाल बॉक्स में और नंबर 2 के साथ",
      "zh-CN": "“自动邮件”部分，下方的“保存”按钮用红框标出并编号为 2",
      "zh-TW": "「自動電子郵件」區塊，下方的「儲存」按鈕以紅框標示並編號 2",
      "ja": "「自動メール」セクション。その下の「保存」ボタンが赤い枠と番号2で示されている"
    }
  },
  "settingsSaveFunds": {
    "src": "/guides/m4-settings-save-funds.png",
    "alt": {
      "en": "The Group gifts and funds section with its own Save button boxed in red and numbered 3",
      "fr": "La section Cadeaux de groupe et cagnottes avec son propre bouton Enregistrer encadré en rouge et numéroté 3",
      "es": "La sección de regalos grupales y fondos con su propio botón Guardar enmarcado en rojo y numerado 3",
      "de": "Der Bereich Gruppengeschenke und Fonds mit eigenem Speichern-Button, rot umrandet und mit 3 nummeriert",
      "pt-BR": "A seção de presentes em grupo e vaquinhas com seu próprio botão Salvar destacado em vermelho e numerado 3",
      "hi": "समूह गिफ्ट और फंड सेक्शन, अपने अलग सेव बटन के साथ, लाल बॉक्स में और नंबर 3 के साथ",
      "zh-CN": "“集体礼物和基金”部分，自带的“保存”按钮用红框标出并编号为 3",
      "zh-TW": "「集體禮物與基金」區塊，專屬的「儲存」按鈕以紅框標示並編號 3",
      "ja": "「グループギフトと資金」セクション。専用の「保存」ボタンが赤い枠と番号3で示されている"
    }
  },
  "manageSaveSettings": {
    "src": "/guides/m6-manage-save-settings.png",
    "alt": {
      "en": "The Registry settings form on the manage page with the Save changes button boxed in red and numbered 1",
      "fr": "Le formulaire Réglages de la liste sur la page de gestion, bouton Enregistrer les modifications encadré en rouge et numéroté 1",
      "es": "El formulario de ajustes de la lista en la página de gestión, con el botón Guardar cambios enmarcado en rojo y numerado 1",
      "de": "Das Formular Listeneinstellungen auf der Verwaltungsseite, der Button Änderungen speichern rot umrandet und mit 1 nummeriert",
      "pt-BR": "O formulário de configurações da lista na página de gerenciamento, com o botão Salvar alterações destacado em vermelho e numerado 1",
      "hi": "मैनेज पेज पर रजिस्ट्री सेटिंग्स फ़ॉर्म, बदलाव सेव करें बटन लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "管理页面上的清单设置表单，“保存更改”按钮用红框标出并编号为 1",
      "zh-TW": "管理頁面上的清單設定表單，「儲存變更」按鈕以紅框標示並編號 1",
      "ja": "管理ページのリスト設定フォーム。「変更を保存」ボタンが赤い枠と番号1で示されている"
    }
  },
  "manageSaveShip": {
    "src": "/guides/m6-manage-save-ship.png",
    "alt": {
      "en": "The bottom of the Let guests ship gifts to me form with its own Save button boxed in red and numbered 2",
      "fr": "Le bas du formulaire Laisser les invités m'envoyer des cadeaux, avec son propre bouton Enregistrer encadré en rouge et numéroté 2",
      "es": "La parte inferior del formulario para que los invitados envíen regalos a tu dirección, con su propio botón Guardar enmarcado en rojo y numerado 2",
      "de": "Das Ende des Formulars „Gäste dürfen Geschenke an mich senden“ mit eigenem Speichern-Button, rot umrandet und mit 2 nummeriert",
      "pt-BR": "O fim do formulário para convidados enviarem presentes para você, com seu próprio botão Salvar destacado em vermelho e numerado 2",
      "hi": "मेहमानों को गिफ्ट मुझे भेजने देने वाले फ़ॉर्म का निचला हिस्सा, अपने सेव बटन के साथ, लाल बॉक्स में और नंबर 2 के साथ",
      "zh-CN": "“允许访客把礼物寄给我”表单底部，自带的“保存”按钮用红框标出并编号为 2",
      "zh-TW": "「讓訪客把禮物寄給我」表單底部，專屬的「儲存」按鈕以紅框標示並編號 2",
      "ja": "「ゲストがギフトを私に送れるようにする」フォームの下部。専用の「保存」ボタンが赤い枠と番号2で示されている"
    }
  },
  "manageItemUpdate": {
    "src": "/guides/m6-manage-item-update.png",
    "alt": {
      "en": "An item on the manage page with its Update button boxed in red and numbered 3",
      "fr": "Un article sur la page de gestion, bouton Mettre à jour encadré en rouge et numéroté 3",
      "es": "Un artículo en la página de gestión, con el botón Actualizar enmarcado en rojo y numerado 3",
      "de": "Ein Artikel auf der Verwaltungsseite, der Button Aktualisieren rot umrandet und mit 3 nummeriert",
      "pt-BR": "Um item na página de gerenciamento, com o botão Atualizar destacado em vermelho e numerado 3",
      "hi": "मैनेज पेज पर एक आइटम, अपडेट बटन लाल बॉक्स में और नंबर 3 के साथ",
      "zh-CN": "管理页面上的一件商品，“更新”按钮用红框标出并编号为 3",
      "zh-TW": "管理頁面上的一件商品，「更新」按鈕以紅框標示並編號 3",
      "ja": "管理ページのアイテム。「更新」ボタンが赤い枠と番号3で示されている"
    }
  },
  "partnerDialog": {
    "src": "/guides/m7-partner-dialog.png",
    "alt": {
      "en": "Step 2 of the first-time setup, Planning this with someone?, with the Add partner and Not now buttons boxed in red",
      "fr": "L'étape 2 de la configuration initiale, Vous organisez cela avec quelqu'un ?, avec les boutons Ajouter un partenaire et Pas maintenant encadrés en rouge",
      "es": "El paso 2 de la configuración inicial, ¿Lo organizas con alguien?, con los botones Añadir pareja y Ahora no enmarcados en rojo",
      "de": "Schritt 2 der Ersteinrichtung, „Planen Sie das mit jemandem?“, die Buttons Partner hinzufügen und Jetzt nicht rot umrandet",
      "pt-BR": "O passo 2 da configuração inicial, Está planejando isso com alguém?, com os botões Adicionar parceiro e Agora não destacados em vermelho",
      "hi": "शुरुआती सेटअप का चरण 2, क्या आप यह किसी के साथ प्लान कर रहे हैं?, पार्टनर जोड़ें और अभी नहीं बटन लाल बॉक्स में",
      "zh-CN": "首次设置的第 2 步“和别人一起筹备吗？”，“添加伴侣”和“暂不”按钮用红框标出",
      "zh-TW": "首次設定的第 2 步「和別人一起籌備嗎？」，「新增伴侶」和「暫不」按鈕以紅框標示",
      "ja": "最初のセットアップのステップ2「誰かと一緒に準備していますか？」。「パートナーを追加」と「今はしない」のボタンが赤い枠で示されている"
    }
  },
  "extItems": {
    "src": "/guides/c1-items-other-stores.png",
    "alt": {
      "en": "The Items from other stores section of Settings with its three choices boxed in red: Allow, Allow but keep my products in the majority, and My products only",
      "fr": "La section Articles d'autres boutiques des Réglages, avec ses trois choix encadrés en rouge : autoriser, autoriser en gardant mes produits majoritaires, et mes produits uniquement",
      "es": "La sección de artículos de otras tiendas en Ajustes, con sus tres opciones enmarcadas en rojo: permitir, permitir manteniendo mis productos mayoritarios y solo mis productos",
      "de": "Der Bereich Artikel aus anderen Shops in den Einstellungen, die drei Optionen rot umrandet: erlauben, erlauben mit Mehrheit meiner Produkte und nur meine Produkte",
      "pt-BR": "A seção de itens de outras lojas em Configurações, com as três opções destacadas em vermelho: permitir, permitir mantendo meus produtos em maioria e somente meus produtos",
      "hi": "सेटिंग्स में दूसरे स्टोर के आइटम सेक्शन, तीनों विकल्प लाल बॉक्स में: अनुमति दें, अनुमति दें पर मेरे प्रोडक्ट ज़्यादा रखें, और सिर्फ़ मेरे प्रोडक्ट",
      "zh-CN": "设置中的“其他商店的商品”部分，三个选项用红框标出：允许、允许但保持我的商品占多数、仅限我的商品",
      "zh-TW": "設定中的「其他商店的商品」區塊，三個選項以紅框標示：允許、允許但以我的商品為多數、僅限我的商品",
      "ja": "設定の「他のストアの商品」セクション。3つの選択肢（許可、自社商品を過半数に保って許可、自社商品のみ）が赤い枠で示されている"
    }
  },
  "soldOut": {
    "src": "/guides/c2-sold-out.png",
    "alt": {
      "en": "The Sold-out products section of Settings with its two choices boxed in red: show it as sold out, or hide it until it's back in stock",
      "fr": "La section Produits épuisés des Réglages, avec ses deux choix encadrés en rouge : l'afficher comme épuisé ou le masquer jusqu'au retour en stock",
      "es": "La sección de productos agotados en Ajustes, con sus dos opciones enmarcadas en rojo: mostrarlo como agotado u ocultarlo hasta que vuelva a haber stock",
      "de": "Der Bereich Ausverkaufte Produkte in den Einstellungen, die zwei Optionen rot umrandet: als ausverkauft anzeigen oder ausblenden, bis wieder Bestand da ist",
      "pt-BR": "A seção de produtos esgotados em Configurações, com as duas opções destacadas em vermelho: mostrar como esgotado ou ocultar até voltar ao estoque",
      "hi": "सेटिंग्स में बिक चुके प्रोडक्ट सेक्शन, दोनों विकल्प लाल बॉक्स में: बिका हुआ दिखाएँ या स्टॉक में लौटने तक छिपाएँ",
      "zh-CN": "设置中的“售罄商品”部分，两个选项用红框标出：显示为已售罄，或在补货前隐藏",
      "zh-TW": "設定中的「售完商品」區塊，兩個選項以紅框標示：顯示為已售完，或補貨前隱藏",
      "ja": "設定の「売り切れ商品」セクション。2つの選択肢（売り切れとして表示、在庫が戻るまで非表示）が赤い枠で示されている"
    }
  },
  "privacy": {
    "src": "/guides/c3-privacy.png",
    "alt": {
      "en": "The Privacy section of Settings with its two tick boxes boxed in red: hide who gave what until the event date, and enable the public find-a-registry page",
      "fr": "La section Confidentialité des Réglages, avec ses deux cases encadrées en rouge : masquer qui a offert quoi jusqu'à la date de l'événement et activer la page publique de recherche de listes",
      "es": "La sección de Privacidad en Ajustes, con sus dos casillas enmarcadas en rojo: ocultar quién regaló qué hasta la fecha del evento y activar la página pública para buscar listas",
      "de": "Der Bereich Datenschutz in den Einstellungen, die beiden Kontrollkästchen rot umrandet: wer was geschenkt hat bis zum Veranstaltungstag ausblenden und die öffentliche Listensuche aktivieren",
      "pt-BR": "A seção de Privacidade em Configurações, com as duas caixas destacadas em vermelho: ocultar quem deu o quê até a data do evento e ativar a página pública de busca de listas",
      "hi": "सेटिंग्स में प्राइवेसी सेक्शन, दोनों चेक बॉक्स लाल बॉक्स में: कार्यक्रम की तारीख तक किसने क्या दिया छिपाएँ, और सार्वजनिक रजिस्ट्री खोज पेज चालू करें",
      "zh-CN": "设置中的“隐私”部分，两个复选框用红框标出：活动日期前隐藏谁送了什么，以及启用公开的清单查找页面",
      "zh-TW": "設定中的「隱私」區塊，兩個核取方塊以紅框標示：活動日期前隱藏誰送了什麼，以及啟用公開的清單搜尋頁面",
      "ja": "設定の「プライバシー」セクション。2つのチェックボックス（イベント日まで誰が何を贈ったかを隠す、公開のリスト検索ページを有効にする）が赤い枠で示されている"
    }
  },
  "perks": {
    "src": "/guides/c4-perks.png",
    "alt": {
      "en": "The Registry perks section of Settings with the Your perks box boxed in red, holding one perk per line",
      "fr": "La section Avantages de liste des Réglages, avec la zone Vos avantages encadrée en rouge, un avantage par ligne",
      "es": "La sección de ventajas de la lista en Ajustes, con el cuadro Tus ventajas enmarcado en rojo, una ventaja por línea",
      "de": "Der Bereich Listenvorteile in den Einstellungen, das Feld Ihre Vorteile rot umrandet, ein Vorteil pro Zeile",
      "pt-BR": "A seção de vantagens da lista em Configurações, com a caixa Suas vantagens destacada em vermelho, uma vantagem por linha",
      "hi": "सेटिंग्स में रजिस्ट्री पर्क्स सेक्शन, आपके पर्क्स बॉक्स लाल बॉक्स में, हर लाइन में एक पर्क",
      "zh-CN": "设置中的“清单福利”部分，“您的福利”输入框用红框标出，每行一项福利",
      "zh-TW": "設定中的「清單福利」區塊，「您的福利」輸入框以紅框標示，每行一項福利",
      "ja": "設定の「リスト特典」セクション。「特典」の入力欄が赤い枠で示され、1行に1つの特典が入っている"
    }
  },
  "language": {
    "src": "/guides/c5-language.png",
    "alt": {
      "en": "The Appearance section of Settings with the Registry page language menu boxed in red",
      "fr": "La section Apparence des Réglages, avec le menu Langue de la page de liste encadré en rouge",
      "es": "La sección Apariencia de Ajustes, con el menú Idioma de la página de la lista enmarcado en rojo",
      "de": "Der Bereich Darstellung in den Einstellungen, das Menü Sprache der Listenseite rot umrandet",
      "pt-BR": "A seção Aparência em Configurações, com o menu Idioma da página da lista destacado em vermelho",
      "hi": "सेटिंग्स में दिखावट सेक्शन, रजिस्ट्री पेज की भाषा मेन्यू लाल बॉक्स में",
      "zh-CN": "设置中的“外观”部分，“清单页面语言”菜单用红框标出",
      "zh-TW": "設定中的「外觀」區塊，「清單頁面語言」選單以紅框標示",
      "ja": "設定の「外観」セクション。「リストページの言語」メニューが赤い枠で示されている"
    }
  },
  "import": {
    "src": "/guides/c6-import.png",
    "alt": {
      "en": "The Bring registries from another app page: Choose File boxed and numbered 1, the optional email checkbox boxed, and Check file boxed and numbered 2",
      "fr": "La page d'importation de listes d'une autre application : Choisir un fichier encadré et numéroté 1, la case facultative d'envoi d'e-mail encadrée, et Vérifier le fichier encadré et numéroté 2",
      "es": "La página para traer listas de otra aplicación: Elegir archivo enmarcado y numerado 1, la casilla opcional de correo enmarcada y Comprobar archivo enmarcado y numerado 2",
      "de": "Die Seite zum Übernehmen von Listen aus einer anderen App: Datei auswählen rot umrandet und mit 1 nummeriert, das optionale E-Mail-Kästchen umrandet, Datei prüfen mit 2 nummeriert",
      "pt-BR": "A página para trazer listas de outro aplicativo: Escolher arquivo destacado e numerado 1, a caixa opcional de e-mail destacada e Verificar arquivo destacado e numerado 2",
      "hi": "दूसरे ऐप से रजिस्ट्री लाने वाला पेज: फ़ाइल चुनें बटन लाल बॉक्स में नंबर 1 के साथ, वैकल्पिक ईमेल चेकबॉक्स बॉक्स में, और फ़ाइल जाँचें बटन नंबर 2 के साथ",
      "zh-CN": "“从其他应用导入清单”页面：“选择文件”用红框标出并编号为 1，可选的邮件复选框用红框标出，“检查文件”用红框标出并编号为 2",
      "zh-TW": "「從其他應用程式匯入清單」頁面：「選擇檔案」以紅框標示並編號 1，選用的電子郵件核取方塊以紅框標示，「檢查檔案」以紅框標示並編號 2",
      "ja": "他のアプリからリストを取り込むページ。「ファイルを選択」が赤い枠と番号1、任意のメールのチェックボックスが赤い枠、「ファイルを確認」が赤い枠と番号2で示されている"
    }
  },
  "flow": {
    "src": "/guides/c7-flow-triggers.png",
    "alt": {
      "en": "The Flow Select a trigger screen with the Giftpin app boxed in red and its three triggers boxed: Registry created, Registry event coming up and Registry gift bought",
      "fr": "L'écran Flow de sélection d'un déclencheur, avec l'application Giftpin encadrée en rouge et ses trois déclencheurs : Registry created, Registry event coming up et Registry gift bought",
      "es": "La pantalla de Flow para seleccionar un activador, con la aplicación Giftpin enmarcada en rojo y sus tres activadores: Registry created, Registry event coming up y Registry gift bought",
      "de": "Der Flow-Bildschirm zur Trigger-Auswahl, die Giftpin-App rot umrandet und ihre drei Trigger: Registry created, Registry event coming up und Registry gift bought",
      "pt-BR": "A tela do Flow para selecionar um gatilho, com o app Giftpin destacado em vermelho e seus três gatilhos: Registry created, Registry event coming up e Registry gift bought",
      "hi": "Flow में ट्रिगर चुनने की स्क्रीन, Giftpin ऐप लाल बॉक्स में और उसके तीनों ट्रिगर: Registry created, Registry event coming up और Registry gift bought",
      "zh-CN": "Flow 的“选择触发器”界面，Giftpin 应用用红框标出，其三个触发器：Registry created、Registry event coming up、Registry gift bought",
      "zh-TW": "Flow 的「選取觸發條件」畫面，Giftpin 應用程式以紅框標示，其三個觸發條件：Registry created、Registry event coming up、Registry gift bought",
      "ja": "Flowの「トリガーを選択」画面。Giftpinアプリが赤い枠で、3つのトリガー（Registry created、Registry event coming up、Registry gift bought）も赤い枠で示されている"
    }
  },
  "navPlan": {
    "src": "/guides/p12-nav-plan.png",
    "alt": {
      "en": "Giftpin's menu under Apps in the Shopify admin with Plan boxed in red and numbered 1",
      "fr": "Le menu de Giftpin sous Applications dans l'admin Shopify avec Forfait encadré en rouge et numéroté 1",
      "es": "El menú de Giftpin en Aplicaciones del admin de Shopify con Plan enmarcado en rojo y numerado 1",
      "de": "Das Giftpin-Menü unter Apps im Shopify-Admin mit Tarif rot umrandet und mit 1 nummeriert",
      "pt-BR": "O menu do Giftpin em Apps no admin da Shopify com Plano destacado em vermelho e numerado 1",
      "hi": "Shopify एडमिन में ऐप्स के नीचे Giftpin का मेनू, प्लान लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 后台「应用」下的 Giftpin 菜单，「套餐」以红框标示并编号 1",
      "zh-TW": "Shopify 後台「應用程式」下的 Giftpin 選單，「方案」以紅框標示並編號 1",
      "ja": "Shopify管理画面のアプリ内のGiftpinメニュー。「プラン」が赤い枠と番号1で示されている"
    }
  },
  "planFree": {
    "src": "/guides/p12-plan-free.png",
    "alt": {
      "en": "The Plan page on the Free plan, listing what Pro adds, with the Upgrade to Pro button boxed in red and numbered 2",
      "fr": "La page Forfait sur Gratuit, listant ce que Pro ajoute, avec le bouton Passer à Pro encadré en rouge et numéroté 2",
      "es": "La página de Plan en el plan Gratis, con lo que añade Pro y el botón Pasar a Pro enmarcado en rojo y numerado 2",
      "de": "Die Seite Tarif im Free-Tarif mit den Pro-Zusätzen und dem Button Auf Pro upgraden rot umrandet und mit 2 nummeriert",
      "pt-BR": "A página do Plano no plano Grátis, listando o que o Pro acrescenta, com o botão Assinar Pro destacado em vermelho e numerado 2",
      "hi": "फ्री प्लान पर प्लान पेज, Pro में क्या जुड़ता है, और Pro में अपग्रेड करें बटन लाल बॉक्स में नंबर 2 के साथ",
      "zh-CN": "免费套餐下的“套餐”页面，列出 Pro 增加的功能，“升级到 Pro”按钮以红框标示并编号 2",
      "zh-TW": "免費方案下的「方案」頁面，列出 Pro 增加的功能，「升級至 Pro」按鈕以紅框標示並編號 2",
      "ja": "無料プランのプランページ。Proで追加される内容と、赤い枠と番号2で示された「Proにアップグレード」ボタン"
    }
  },
  "giftPath": {
    "src": "/guides/p14-gift-card-path.png",
    "alt": {
      "en": "Shopify admin menus: Products boxed and numbered 1, an arrow to the Products submenu with Gift cards boxed and numbered 2, and an arrow down to the Gift cards page with the Add gift card product button boxed and numbered 3",
      "fr": "Menus de l'admin Shopify : Produits encadré et numéroté 1, une flèche vers le sous-menu Produits avec Cartes cadeaux encadré et numéroté 2, et une flèche vers la page Cartes cadeaux avec le bouton Ajouter un produit carte cadeau encadré et numéroté 3",
      "es": "Menús del admin de Shopify: Productos enmarcado y numerado 1, una flecha al submenú de Productos con Tarjetas de regalo enmarcado y numerado 2, y una flecha a la página Tarjetas de regalo con el botón Agregar producto de tarjeta de regalo enmarcado y numerado 3",
      "de": "Menüs im Shopify-Admin: Produkte umrandet und mit 1 nummeriert, ein Pfeil zum Untermenü Produkte mit Geschenkgutscheine umrandet und mit 2 nummeriert, und ein Pfeil zur Seite Geschenkgutscheine mit dem Button Geschenkgutschein-Produkt hinzufügen umrandet und mit 3 nummeriert",
      "pt-BR": "Menus do admin da Shopify: Produtos destacado e numerado 1, uma seta para o submenu Produtos com Cartões-presente destacado e numerado 2, e uma seta para a página Cartões-presente com o botão Adicionar produto de cartão-presente destacado e numerado 3",
      "hi": "Shopify एडमिन के मेनू: प्रोडक्ट्स लाल बॉक्स में नंबर 1, तीर प्रोडक्ट्स सबमेनू की ओर जहाँ गिफ्ट कार्ड्स नंबर 2 के साथ है, और तीर गिफ्ट कार्ड्स पेज की ओर जहाँ गिफ्ट कार्ड प्रोडक्ट जोड़ें बटन नंबर 3 के साथ है",
      "zh-CN": "Shopify 后台菜单：「商品」以红框标示并编号 1，箭头指向商品子菜单，其中「礼品卡」编号 2，再用箭头指向礼品卡页面，其中「添加礼品卡商品」按钮编号 3",
      "zh-TW": "Shopify 後台選單：「商品」以紅框標示並編號 1，箭頭指向商品子選單，其中「禮品卡」編號 2，再以箭頭指向禮品卡頁面，其中「新增禮品卡商品」按鈕編號 3",
      "ja": "Shopify管理画面のメニュー：「商品」が赤い枠と番号1、矢印の先の商品サブメニューで「ギフトカード」が番号2、さらに矢印の先のギフトカードページで「ギフトカード商品を追加」ボタンが番号3で示されている"
    }
  },
  "orderPath": {
    "src": "/guides/p14-order-processing-path.png",
    "alt": {
      "en": "Shopify admin: Settings boxed and numbered 1, an arrow to the Settings menu with General boxed and numbered 2, and an arrow to Order processing with Automatically fulfill only the gift cards of the order boxed and numbered 3, then the Save button boxed and numbered 4",
      "fr": "Admin Shopify : Paramètres encadré et numéroté 1, une flèche vers le menu Paramètres avec Général encadré et numéroté 2, puis une flèche vers Traitement des commandes avec l'option de ne traiter automatiquement que les cartes cadeaux encadrée et numérotée 3, puis le bouton Enregistrer encadré et numéroté 4",
      "es": "Admin de Shopify: Configuración enmarcado y numerado 1, una flecha al menú de Configuración con General enmarcado y numerado 2, y una flecha a Procesamiento de pedidos con la opción de cumplir automáticamente solo las tarjetas de regalo enmarcada y numerada 3, y el botón Guardar enmarcado y numerado 4",
      "de": "Shopify-Admin: Einstellungen umrandet und mit 1 nummeriert, ein Pfeil zum Einstellungsmenü mit Allgemein umrandet und mit 2 nummeriert, und ein Pfeil zu Bestellabwicklung mit der Option, nur die Geschenkgutscheine automatisch auszuführen, umrandet und mit 3 nummeriert, dann der Button Speichern umrandet und mit 4 nummeriert",
      "pt-BR": "Admin da Shopify: Configurações destacado e numerado 1, uma seta para o menu Configurações com Geral destacado e numerado 2, e uma seta para Processamento de pedidos com a opção de atender automaticamente apenas os cartões-presente destacada e numerada 3, depois o botão Salvar destacado e numerado 4",
      "hi": "Shopify एडमिन: सेटिंग्स लाल बॉक्स में नंबर 1, तीर सेटिंग्स मेनू की ओर जहाँ जनरल नंबर 2 के साथ है, और तीर ऑर्डर प्रोसेसिंग की ओर जहाँ केवल गिफ्ट कार्ड अपने आप फुलफिल करने का विकल्प नंबर 3 के साथ है, फिर सेव बटन नंबर 4 के साथ",
      "zh-CN": "Shopify 后台：「设置」以红框标示并编号 1，箭头指向设置菜单，其中「常规」编号 2，再指向「订单处理」，其中「仅自动履行订单中的礼品卡」选项编号 3，然后是「保存」按钮，编号 4",
      "zh-TW": "Shopify 後台：「設定」以紅框標示並編號 1，箭頭指向設定選單，其中「一般」編號 2，再指向「訂單處理」，其中「僅自動出貨訂單中的禮品卡」選項編號 3，接著是「儲存」按鈕，編號 4",
      "ja": "Shopify管理画面：「設定」が赤い枠と番号1、矢印の先の設定メニューで「一般」が番号2、さらに「注文処理」で「注文のギフトカードのみを自動的に処理」が番号3、続いて「保存」ボタンが番号4で示されている"
    }
  },
  "importPath": {
    "src": "/guides/p14-import-path.png",
    "alt": {
      "en": "Shopify admin left menu with Giftpin Gift Registry boxed and numbered 1, an arrow to Giftpin's menu with Registries boxed and numbered 2, and an arrow down to the Registries page with the Import registries button boxed and numbered 3",
      "fr": "Menu de gauche de l'admin Shopify avec Giftpin Gift Registry encadré et numéroté 1, une flèche vers le menu de Giftpin avec Registres encadré et numéroté 2, et une flèche vers la page Registres avec le bouton Importer des registres encadré et numéroté 3",
      "es": "Menú izquierdo del admin de Shopify con Giftpin Gift Registry enmarcado y numerado 1, una flecha al menú de Giftpin con Registros enmarcado y numerado 2, y una flecha a la página Registros con el botón Importar registros enmarcado y numerado 3",
      "de": "Linkes Menü im Shopify-Admin mit Giftpin Gift Registry umrandet und mit 1 nummeriert, ein Pfeil zum Giftpin-Menü mit Listen umrandet und mit 2 nummeriert, und ein Pfeil zur Seite Listen mit dem Button Listen importieren umrandet und mit 3 nummeriert",
      "pt-BR": "Menu à esquerda do admin da Shopify com Giftpin Gift Registry destacado e numerado 1, uma seta para o menu do Giftpin com Listas destacado e numerado 2, e uma seta para a página Listas com o botão Importar listas destacado e numerado 3",
      "hi": "Shopify एडमिन का बायाँ मेनू, Giftpin Gift Registry लाल बॉक्स में नंबर 1, तीर Giftpin के मेनू की ओर जहाँ रजिस्ट्रियाँ नंबर 2 के साथ है, और तीर रजिस्ट्रियाँ पेज की ओर जहाँ रजिस्ट्रियाँ इम्पोर्ट करें बटन नंबर 3 के साथ है",
      "zh-CN": "Shopify 后台左侧菜单，Giftpin Gift Registry 以红框标示并编号 1，箭头指向 Giftpin 菜单，其中「礼物清单」编号 2，再指向礼物清单页面，其中「导入礼物清单」按钮编号 3",
      "zh-TW": "Shopify 後台左側選單，Giftpin Gift Registry 以紅框標示並編號 1，箭頭指向 Giftpin 選單，其中「禮物清單」編號 2，再指向禮物清單頁面，其中「匯入禮物清單」按鈕編號 3",
      "ja": "Shopify管理画面の左メニューでGiftpin Gift Registryが赤い枠と番号1、矢印の先のGiftpinメニューで「リスト」が番号2、さらに矢印の先のリストページで「リストをインポート」ボタンが番号3で示されている"
    }
  },
  "productPanel": {
    "src": "/guides/p15-product-panel-path.png",
    "alt": {
      "en": "A product page in the Shopify admin: More actions boxed and numbered 1, an arrow to the open menu with Giftpin registry boxed and numbered 2, and the panel that opens listing the registries that include the product, with Done boxed and numbered 3",
      "fr": "Une page produit de l'admin Shopify : Autres actions encadré et numéroté 1, une flèche vers le menu ouvert avec Giftpin registry encadré et numéroté 2, et le panneau qui s'ouvre avec la liste des registres contenant le produit, Terminé encadré et numéroté 3",
      "es": "Una página de producto del admin de Shopify: Más acciones enmarcado y numerado 1, una flecha al menú abierto con Giftpin registry enmarcado y numerado 2, y el panel que se abre con los registros que incluyen el producto, con Listo enmarcado y numerado 3",
      "de": "Eine Produktseite im Shopify-Admin: Weitere Aktionen umrandet und mit 1 nummeriert, ein Pfeil zum geöffneten Menü mit Giftpin registry umrandet und mit 2 nummeriert, und das sich öffnende Fenster mit den Listen, die das Produkt enthalten, mit Fertig umrandet und mit 3 nummeriert",
      "pt-BR": "Uma página de produto do admin da Shopify: Mais ações destacado e numerado 1, uma seta para o menu aberto com Giftpin registry destacado e numerado 2, e o painel que abre listando as listas que incluem o produto, com Concluído destacado e numerado 3",
      "hi": "Shopify एडमिन में एक प्रोडक्ट पेज: और कार्रवाइयाँ लाल बॉक्स में नंबर 1, तीर खुले मेनू की ओर जहाँ Giftpin registry नंबर 2 के साथ है, और खुलने वाला पैनल जिसमें प्रोडक्ट वाली रजिस्ट्रियाँ दिखती हैं, हो गया नंबर 3 के साथ",
      "zh-CN": "Shopify 后台的商品页面：「更多操作」以红框标示并编号 1，箭头指向展开的菜单，其中 Giftpin registry 编号 2，以及打开的面板，列出包含该商品的礼物清单，「完成」编号 3",
      "zh-TW": "Shopify 後台的商品頁面：「更多動作」以紅框標示並編號 1，箭頭指向展開的選單，其中 Giftpin registry 編號 2，以及開啟的面板，列出包含該商品的禮物清單，「完成」編號 3",
      "ja": "Shopify管理画面の商品ページ：「その他の操作」が赤い枠と番号1、矢印の先の開いたメニューでGiftpin registryが番号2、開いたパネルにはこの商品を含むリストが並び、「完了」が番号3で示されている"
    }
  },
  "orderPanel": {
    "src": "/guides/p16-order-panel-path.png",
    "alt": {
      "en": "Shopify admin: Orders boxed and numbered 1, an arrow to the orders list with an order boxed and numbered 2, then the order page's More actions button numbered 3, the open menu with Giftpin registry boxed and numbered 4, and the panel showing which registry the order was credited to, with Done numbered 5. The buyer's name is covered",
      "fr": "Admin Shopify : Commandes encadré et numéroté 1, une flèche vers la liste des commandes avec une commande encadrée et numérotée 2, puis le bouton Autres actions de la commande numéroté 3, le menu ouvert avec Giftpin registry encadré et numéroté 4, et le panneau indiquant à quel registre la commande a été créditée, Terminé numéroté 5. Le nom de l'acheteur est masqué",
      "es": "Admin de Shopify: Pedidos enmarcado y numerado 1, una flecha a la lista de pedidos con un pedido enmarcado y numerado 2, luego el botón Más acciones del pedido numerado 3, el menú abierto con Giftpin registry enmarcado y numerado 4, y el panel que muestra a qué registro se acreditó el pedido, con Listo numerado 5. El nombre del comprador está tapado",
      "de": "Shopify-Admin: Bestellungen umrandet und mit 1 nummeriert, ein Pfeil zur Bestellliste mit einer umrandeten, mit 2 nummerierten Bestellung, dann der Button Weitere Aktionen der Bestellung mit 3, das geöffnete Menü mit Giftpin registry umrandet und mit 4 nummeriert, und das Fenster, das zeigt, welcher Liste die Bestellung gutgeschrieben wurde, mit Fertig als 5. Der Name des Käufers ist abgedeckt",
      "pt-BR": "Admin da Shopify: Pedidos destacado e numerado 1, uma seta para a lista de pedidos com um pedido destacado e numerado 2, depois o botão Mais ações do pedido numerado 3, o menu aberto com Giftpin registry destacado e numerado 4, e o painel que mostra a qual lista o pedido foi creditado, com Concluído numerado 5. O nome do comprador está coberto",
      "hi": "Shopify एडमिन: ऑर्डर लाल बॉक्स में नंबर 1, तीर ऑर्डर सूची की ओर जहाँ एक ऑर्डर नंबर 2 के साथ है, फिर ऑर्डर पेज का और कार्रवाइयाँ बटन नंबर 3, खुला मेनू जिसमें Giftpin registry नंबर 4 के साथ है, और वह पैनल जो दिखाता है कि ऑर्डर किस रजिस्ट्री को क्रेडिट हुआ, हो गया नंबर 5। खरीदार का नाम ढका हुआ है",
      "zh-CN": "Shopify 后台：「订单」以红框标示并编号 1，箭头指向订单列表，其中一个订单编号 2，然后是订单页的「更多操作」按钮编号 3，展开菜单中 Giftpin registry 编号 4，以及显示该订单记入哪个礼物清单的面板，「完成」编号 5。买家姓名已遮盖",
      "zh-TW": "Shopify 後台：「訂單」以紅框標示並編號 1，箭頭指向訂單列表，其中一筆訂單編號 2，接著是訂單頁的「更多動作」按鈕編號 3，展開選單中 Giftpin registry 編號 4，以及顯示該訂單記入哪個禮物清單的面板，「完成」編號 5。買家姓名已遮蓋",
      "ja": "Shopify管理画面：「注文」が赤い枠と番号1、矢印の先の注文一覧で注文が番号2、続いて注文ページの「その他の操作」が番号3、開いたメニューでGiftpin registryが番号4、この注文がどのリストに反映されたかを示すパネルで「完了」が番号5。購入者の名前は伏せてある"
    }
  },
  "customerPanel": {
    "src": "/guides/p16-customer-panel-path.png",
    "alt": {
      "en": "Shopify admin: Customers boxed and numbered 1, an arrow to a customer page with More actions numbered 2, the open menu with Giftpin registry boxed and numbered 3, and the panel listing their registries and the gifts they bought, with Done numbered 4. A buyer's name is covered",
      "fr": "Admin Shopify : Clients encadré et numéroté 1, une flèche vers une fiche client avec Autres actions numéroté 2, le menu ouvert avec Giftpin registry encadré et numéroté 3, et le panneau listant ses registres et les cadeaux achetés, Terminé numéroté 4. Le nom d'un acheteur est masqué",
      "es": "Admin de Shopify: Clientes enmarcado y numerado 1, una flecha a la página de un cliente con Más acciones numerado 2, el menú abierto con Giftpin registry enmarcado y numerado 3, y el panel con sus registros y los regalos que compró, con Listo numerado 4. El nombre de un comprador está tapado",
      "de": "Shopify-Admin: Kunden umrandet und mit 1 nummeriert, ein Pfeil zur Kundenseite mit Weitere Aktionen als 2, das geöffnete Menü mit Giftpin registry umrandet und mit 3 nummeriert, und das Fenster mit den Listen des Kunden und den gekauften Geschenken, Fertig als 4. Der Name eines Käufers ist abgedeckt",
      "pt-BR": "Admin da Shopify: Clientes destacado e numerado 1, uma seta para a página de um cliente com Mais ações numerado 2, o menu aberto com Giftpin registry destacado e numerado 3, e o painel com as listas dele e os presentes que comprou, com Concluído numerado 4. O nome de um comprador está coberto",
      "hi": "Shopify एडमिन: ग्राहक लाल बॉक्स में नंबर 1, तीर ग्राहक पेज की ओर जहाँ और कार्रवाइयाँ नंबर 2 के साथ है, खुला मेनू जिसमें Giftpin registry नंबर 3 के साथ है, और पैनल जिसमें उनकी रजिस्ट्रियाँ और खरीदे गए उपहार दिखते हैं, हो गया नंबर 4। एक खरीदार का नाम ढका हुआ है",
      "zh-CN": "Shopify 后台：「客户」以红框标示并编号 1，箭头指向客户页面，「更多操作」编号 2，展开菜单中 Giftpin registry 编号 3，以及列出其礼物清单和所购礼物的面板，「完成」编号 4。一位买家的姓名已遮盖",
      "zh-TW": "Shopify 後台：「顧客」以紅框標示並編號 1，箭頭指向顧客頁面，「更多動作」編號 2，展開選單中 Giftpin registry 編號 3，以及列出其禮物清單與所購禮物的面板，「完成」編號 4。一位買家的姓名已遮蓋",
      "ja": "Shopify管理画面：「顧客」が赤い枠と番号1、矢印の先の顧客ページで「その他の操作」が番号2、開いたメニューでGiftpin registryが番号3、その顧客のリストと購入したギフトを示すパネルで「完了」が番号4。購入者の名前は伏せてある"
    }
  },
  "flowPath": {
    "src": "/guides/p17-flow-path.png",
    "alt": {
      "en": "Shopify admin steps to a Flow trigger: Apps boxed and numbered 1, an arrow to the Apps list with Flow boxed and numbered 2, the Workflows page with Create workflow numbered 3, Select a trigger numbered 4, the Giftpin: Registry & Wishlist app numbered 5, and its three triggers with Registry created numbered 6 and added to the workflow. The developer's name is covered",
      "fr": "Étapes de l'admin Shopify vers un déclencheur Flow : Applications encadré et numéroté 1, une flèche vers la liste des applications avec Flow encadré et numéroté 2, la page Workflows avec Créer un workflow numéroté 3, Sélectionner un déclencheur numéroté 4, l'application Giftpin: Registry & Wishlist numérotée 5, et ses trois déclencheurs avec Registry created numéroté 6 puis ajouté au workflow. Le nom du développeur est masqué",
      "es": "Pasos del admin de Shopify hasta un activador de Flow: Aplicaciones enmarcado y numerado 1, una flecha a la lista de aplicaciones con Flow enmarcado y numerado 2, la página Workflows con Crear workflow numerado 3, Seleccionar un activador numerado 4, la aplicación Giftpin: Registry & Wishlist numerada 5, y sus tres activadores con Registry created numerado 6 y añadido al workflow. El nombre del desarrollador está tapado",
      "de": "Schritte im Shopify-Admin zu einem Flow-Trigger: Apps umrandet und mit 1 nummeriert, ein Pfeil zur App-Liste mit Flow umrandet und mit 2 nummeriert, die Seite Workflows mit Workflow erstellen als 3, Trigger auswählen als 4, die App Giftpin: Registry & Wishlist als 5 und ihre drei Trigger mit Registry created als 6, danach dem Workflow hinzugefügt. Der Name des Entwicklers ist abgedeckt",
      "pt-BR": "Etapas do admin da Shopify até um gatilho do Flow: Apps destacado e numerado 1, uma seta para a lista de apps com Flow destacado e numerado 2, a página Workflows com Criar workflow numerado 3, Selecionar um gatilho numerado 4, o app Giftpin: Registry & Wishlist numerado 5, e seus três gatilhos com Registry created numerado 6 e adicionado ao workflow. O nome do desenvolvedor está coberto",
      "hi": "Shopify एडमिन से Flow ट्रिगर तक के चरण: ऐप्स लाल बॉक्स में नंबर 1, तीर ऐप्स की सूची की ओर जहाँ Flow नंबर 2 के साथ है, Workflows पेज पर Create workflow नंबर 3, Select a trigger नंबर 4, ऐप Giftpin: Registry & Wishlist नंबर 5, और इसके तीन ट्रिगर जिनमें Registry created नंबर 6 के साथ वर्कफ़्लो में जुड़ा है। डेवलपर का नाम ढका हुआ है",
      "zh-CN": "从 Shopify 后台到 Flow 触发器的步骤：「应用」以红框标示并编号 1，箭头指向应用列表，其中 Flow 编号 2，Workflows 页面上的「创建工作流」编号 3，「选择触发器」编号 4，应用 Giftpin: Registry & Wishlist 编号 5，以及它的三个触发器，其中 Registry created 编号 6 并已添加到工作流。开发者姓名已遮盖",
      "zh-TW": "從 Shopify 後台到 Flow 觸發條件的步驟：「應用程式」以紅框標示並編號 1，箭頭指向應用程式清單，其中 Flow 編號 2，Workflows 頁面上的「建立工作流程」編號 3，「選取觸發條件」編號 4，應用程式 Giftpin: Registry & Wishlist 編號 5，以及它的三個觸發條件，其中 Registry created 編號 6 並已加入工作流程。開發者姓名已遮蓋",
      "ja": "Shopify管理画面からFlowのトリガーまでの手順：「アプリ」が赤い枠と番号1、矢印の先のアプリ一覧で「Flow」が番号2、Workflowsページの「ワークフローを作成」が番号3、「トリガーを選択」が番号4、アプリ「Giftpin: Registry & Wishlist」が番号5、その3つのトリガーのうちRegistry createdが番号6で、ワークフローに追加された状態。開発者名は伏せてある"
    }
  },
  "themePath": {
    "src": "/guides/p18-theme-block-path.png",
    "alt": {
      "en": "Shopify admin steps to the theme editor: Online Store numbered 1, Edit theme on your theme numbered 2, the page picker Home page numbered 3 then Products numbered 4, Default product numbered 5, Product information numbered 6, Add block numbered 7, the Apps tab numbered 8, Save for later numbered 9, then the page picker again (10) to choose Cart (11)",
      "fr": "Étapes de l'admin Shopify vers l'éditeur de thème : Boutique en ligne numéroté 1, Modifier le thème sur votre thème numéroté 2, le sélecteur de page Page d'accueil numéroté 3 puis Produits numéroté 4, Produit par défaut numéroté 5, Informations produit numéroté 6, Ajouter un bloc numéroté 7, l'onglet Applications numéroté 8, Save for later numéroté 9, puis de nouveau le sélecteur de page (10) pour choisir Panier (11)",
      "es": "Pasos del admin de Shopify al editor de temas: Tienda online numerado 1, Editar tema en tu tema numerado 2, el selector de página Página de inicio numerado 3 y luego Productos numerado 4, Producto predeterminado numerado 5, Información del producto numerado 6, Añadir bloque numerado 7, la pestaña Aplicaciones numerada 8, Save for later numerado 9, y otra vez el selector de página (10) para elegir Carrito (11)",
      "de": "Schritte im Shopify-Admin zum Theme-Editor: Onlineshop mit 1, Theme bearbeiten bei Ihrem Theme mit 2, die Seitenauswahl Startseite mit 3 und dann Produkte mit 4, Standardprodukt mit 5, Produktinformationen mit 6, Block hinzufügen mit 7, der Tab Apps mit 8, Save for later mit 9, danach erneut die Seitenauswahl (10), um Warenkorb (11) zu wählen",
      "pt-BR": "Etapas do admin da Shopify até o editor de temas: Loja virtual numerado 1, Editar tema no seu tema numerado 2, o seletor de página Página inicial numerado 3 e depois Produtos numerado 4, Produto padrão numerado 5, Informações do produto numerado 6, Adicionar bloco numerado 7, a aba Apps numerada 8, Save for later numerado 9, e de novo o seletor de página (10) para escolher Carrinho (11)",
      "hi": "Shopify एडमिन से थीम एडिटर तक के चरण: ऑनलाइन स्टोर नंबर 1, आपकी थीम पर थीम एडिट करें नंबर 2, पेज चयनकर्ता में होम पेज नंबर 3 फिर प्रोडक्ट्स नंबर 4, डिफ़ॉल्ट प्रोडक्ट नंबर 5, प्रोडक्ट जानकारी नंबर 6, ब्लॉक जोड़ें नंबर 7, ऐप्स टैब नंबर 8, Save for later नंबर 9, फिर दोबारा पेज चयनकर्ता (10) में कार्ट (11) चुनना",
      "zh-CN": "从 Shopify 后台到主题编辑器的步骤：「在线商店」编号 1，主题上的「编辑主题」编号 2，页面选择器「首页」编号 3，然后「商品」编号 4，「默认商品」编号 5，「商品信息」编号 6，「添加区块」编号 7，「应用」标签编号 8，Save for later 编号 9，再次打开页面选择器（10）选择「购物车」（11）",
      "zh-TW": "從 Shopify 後台到佈景主題編輯器的步驟：「線上商店」編號 1，佈景主題上的「編輯佈景主題」編號 2，頁面選擇器「首頁」編號 3，接著「商品」編號 4，「預設商品」編號 5，「商品資訊」編號 6，「新增區塊」編號 7，「應用程式」分頁編號 8，Save for later 編號 9，再次開啟頁面選擇器（10）選擇「購物車」（11）",
      "ja": "Shopify管理画面からテーマエディタまでの手順：「オンラインストア」が番号1、テーマの「テーマを編集」が番号2、ページ選択の「ホームページ」が番号3、続いて「商品」が番号4、「デフォルト商品」が番号5、「商品情報」が番号6、「ブロックを追加」が番号7、「アプリ」タブが番号8、Save for laterが番号9、もう一度ページ選択（10）で「カート」（11）を選ぶ"
    }
  },
  "cartPath": {
    "src": "/guides/p19-cart-block-path.png",
    "alt": {
      "en": "The theme editor's Cart page, under Template: Add section numbered 1, the Apps tab numbered 2, Giftpin's Saved items numbered 3, then Save at the top right numbered 4",
      "fr": "La page Panier de l'éditeur de thème, sous Modèle : Ajouter une section numéroté 1, l'onglet Applications numéroté 2, Saved items de Giftpin numéroté 3, puis Enregistrer en haut à droite numéroté 4",
      "es": "La página Carrito del editor de temas, en Plantilla: Añadir sección numerado 1, la pestaña Aplicaciones numerada 2, Saved items de Giftpin numerado 3 y luego Guardar arriba a la derecha numerado 4",
      "de": "Die Warenkorbseite im Theme-Editor, unter Vorlage: Abschnitt hinzufügen mit 1, der Tab Apps mit 2, Saved items von Giftpin mit 3, dann Speichern oben rechts mit 4",
      "pt-BR": "A página Carrinho do editor de temas, em Modelo: Adicionar seção numerado 1, a aba Apps numerada 2, Saved items do Giftpin numerado 3 e depois Salvar no canto superior direito numerado 4",
      "hi": "थीम एडिटर का कार्ट पेज, टेम्पलेट के नीचे: सेक्शन जोड़ें नंबर 1, ऐप्स टैब नंबर 2, Giftpin का Saved items नंबर 3, फिर ऊपर दाईं ओर सेव नंबर 4",
      "zh-CN": "主题编辑器的购物车页面，在「模板」下：「添加区段」编号 1，「应用」标签编号 2，Giftpin 的 Saved items 编号 3，然后右上角的「保存」编号 4",
      "zh-TW": "佈景主題編輯器的購物車頁面，在「範本」下：「新增區段」編號 1，「應用程式」分頁編號 2，Giftpin 的 Saved items 編號 3，然後右上角的「儲存」編號 4",
      "ja": "テーマエディタのカートページの「テンプレート」内：「セクションを追加」が番号1、「アプリ」タブが番号2、GiftpinのSaved itemsが番号3、右上の「保存」が番号4"
    }
  },
  "menuPath": {
    "src": "/guides/p20-menu-item-path.png",
    "alt": {
      "en": "For vintage themes: Content numbered 1, Menus numbered 2, Main menu numbered 3, Add menu item numbered 4, the Label (Gift registry, 5) and Link (/apps/registry, 6) fields, the /apps/registry suggestion numbered 7, then Save numbered 8",
      "fr": "Pour les thèmes anciens : Contenu numéroté 1, Menus numéroté 2, Menu principal numéroté 3, Ajouter un élément de menu numéroté 4, les champs Libellé (Gift registry, 5) et Lien (/apps/registry, 6), la suggestion /apps/registry numérotée 7, puis Enregistrer numéroté 8",
      "es": "Para temas antiguos: Contenido numerado 1, Menús numerado 2, Menú principal numerado 3, Añadir elemento de menú numerado 4, los campos Etiqueta (Gift registry, 5) y Enlace (/apps/registry, 6), la sugerencia /apps/registry numerada 7 y luego Guardar numerado 8",
      "de": "Für ältere Themes: Inhalte mit 1, Menüs mit 2, Hauptmenü mit 3, Menüpunkt hinzufügen mit 4, die Felder Bezeichnung (Gift registry, 5) und Link (/apps/registry, 6), der Vorschlag /apps/registry mit 7, danach Speichern mit 8",
      "pt-BR": "Para temas antigos: Conteúdo numerado 1, Menus numerado 2, Menu principal numerado 3, Adicionar item de menu numerado 4, os campos Rótulo (Gift registry, 5) e Link (/apps/registry, 6), a sugestão /apps/registry numerada 7 e depois Salvar numerado 8",
      "hi": "पुरानी थीम के लिए: कंटेंट नंबर 1, मेन्यू नंबर 2, मेन मेन्यू नंबर 3, मेन्यू आइटम जोड़ें नंबर 4, लेबल (Gift registry, 5) और लिंक (/apps/registry, 6) फ़ील्ड, सुझाव /apps/registry नंबर 7, फिर सेव नंबर 8",
      "zh-CN": "旧版主题：「内容」编号 1，「菜单」编号 2，「主菜单」编号 3，「添加菜单项」编号 4，「标签」（Gift registry，5）和「链接」（/apps/registry，6）字段，建议项 /apps/registry 编号 7，然后「保存」编号 8",
      "zh-TW": "舊式佈景主題：「內容」編號 1，「選單」編號 2，「主選單」編號 3，「新增選單項目」編號 4，「標籤」（Gift registry，5）與「連結」（/apps/registry，6）欄位，建議項 /apps/registry 編號 7，然後「儲存」編號 8",
      "ja": "古いテーマの場合：「コンテンツ」が番号1、「メニュー」が番号2、「メインメニュー」が番号3、「メニュー項目を追加」が番号4、「ラベル」（Gift registry、5）と「リンク」（/apps/registry、6）の欄、候補の/apps/registryが番号7、最後に「保存」が番号8"
    }
  },
  "cancelPro": {
    "src": "/guides/p1-cancel-pro.png",
    "alt": {
      "en": "The Plan page on Pro, showing the monthly price and the Cancel Pro button boxed in red",
      "fr": "La page Forfait sur Pro, avec le prix mensuel et le bouton Annuler Pro encadré en rouge",
      "es": "La página de Plan con Pro activo, con el precio mensual y el botón Cancelar Pro enmarcado en rojo",
      "de": "Die Seite Tarif mit aktivem Pro, mit dem Monatspreis und dem Button Pro kündigen rot umrandet",
      "pt-BR": "A página do Plano com o Pro ativo, mostrando o preço mensal e o botão Cancelar Pro destacado em vermelho",
      "hi": "Pro चालू होने पर प्लान पेज, मासिक कीमत और Pro रद्द करें बटन लाल बॉक्स में",
      "zh-CN": "已开通 Pro 的“套餐”页面，显示月费和用红框标出的“取消 Pro”按钮",
      "zh-TW": "已啟用 Pro 的「方案」頁面，顯示月費和以紅框標示的「取消 Pro」按鈕",
      "ja": "Pro加入中のプランページ。月額料金と、赤い枠で示された「Proを解約」ボタン"
    }
  },
  "afterEvent": {
    "src": "/guides/p2-after-event.png",
    "alt": {
      "en": "The After the event (Pro) section of Settings with the discount tick box and the Discount (%) and Code works for (days) fields boxed in red and numbered 2 to 4",
      "fr": "La section Après l'événement (Pro) des Réglages, avec la case de réduction et les champs Réduction (%) et Durée de validité du code (jours) encadrés en rouge et numérotés de 2 à 4",
      "es": "La sección Después del evento (Pro) de Ajustes, con la casilla del descuento y los campos Descuento (%) y Validez del código (días) enmarcados en rojo y numerados del 2 al 4",
      "de": "Der Bereich Nach der Veranstaltung (Pro) in den Einstellungen, das Rabatt-Kästchen und die Felder Rabatt (%) und Code gültig für (Tage) rot umrandet und mit 2 bis 4 nummeriert",
      "pt-BR": "A seção Depois do evento (Pro) em Configurações, com a caixa do desconto e os campos Desconto (%) e Código válido por (dias) destacados em vermelho e numerados de 2 a 4",
      "hi": "सेटिंग्स में कार्यक्रम के बाद (Pro) सेक्शन, छूट चेकबॉक्स और छूट (%) व कोड कितने दिन चलेगा फ़ील्ड लाल बॉक्स में, नंबर 2 से 4 के साथ",
      "zh-CN": "设置中的“活动结束后（Pro）”部分，折扣复选框以及“折扣 (%)”“优惠码有效天数”输入框用红框标出，编号 2 至 4",
      "zh-TW": "設定中的「活動結束後（Pro）」區塊，折扣核取方塊以及「折扣 (%)」「折扣碼有效天數」欄位以紅框標示，編號 2 至 4",
      "ja": "設定の「イベント後（Pro）」セクション。割引のチェックボックスと「割引（%）」「コードの有効日数」欄が赤い枠で、番号2〜4で示されている"
    }
  },
  "navSettings": {
    "src": "/guides/p3-nav-settings.png",
    "alt": {
      "en": "The Giftpin menu in the Shopify admin with Settings boxed in red and numbered 1",
      "fr": "Le menu Giftpin dans l'admin Shopify, Réglages encadré en rouge et numéroté 1",
      "es": "El menú de Giftpin en el administrador de Shopify, con Ajustes enmarcado en rojo y numerado 1",
      "de": "Das Giftpin-Menü im Shopify-Admin, Einstellungen rot umrandet und mit 1 nummeriert",
      "pt-BR": "O menu do Giftpin no admin da Shopify, com Configurações destacado em vermelho e numerado 1",
      "hi": "Shopify एडमिन में Giftpin मेन्यू, सेटिंग्स लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 后台中的 Giftpin 菜单，“设置”用红框标出并编号为 1",
      "zh-TW": "Shopify 後台中的 Giftpin 選單，「設定」以紅框標示並編號 1",
      "ja": "Shopify管理画面のGiftpinメニュー。「設定」が赤い枠と番号1で示されている"
    }
  },
  "emails": {
    "src": "/guides/p3-emails.png",
    "alt": {
      "en": "The Automatic emails (Pro) section of Settings with its three tick boxes boxed and numbered 5 and the Save button boxed and numbered 6",
      "fr": "La section Courriels automatiques (Pro) des Réglages, avec ses trois cases encadrées et numérotées 5 et le bouton Enregistrer encadré et numéroté 6",
      "es": "La sección de correos automáticos (Pro) de Ajustes, con sus tres casillas enmarcadas y numeradas 5 y el botón Guardar enmarcado y numerado 6",
      "de": "Der Bereich Automatische E-Mails (Pro) in den Einstellungen, die drei Kästchen umrandet und mit 5 nummeriert, der Speichern-Button umrandet und mit 6 nummeriert",
      "pt-BR": "A seção de e-mails automáticos (Pro) em Configurações, com as três caixas destacadas e numeradas 5 e o botão Salvar destacado e numerado 6",
      "hi": "सेटिंग्स में स्वचालित ईमेल (Pro) सेक्शन, तीनों चेकबॉक्स बॉक्स में नंबर 5 के साथ और सेव बटन बॉक्स में नंबर 6 के साथ",
      "zh-CN": "设置中的“自动邮件（Pro）”部分，三个复选框用红框标出并编号为 5，“保存”按钮用红框标出并编号为 6",
      "zh-TW": "設定中的「自動電子郵件（Pro）」區塊，三個核取方塊以紅框標示並編號 5，「儲存」按鈕以紅框標示並編號 6",
      "ja": "設定の「自動メール（Pro）」セクション。3つのチェックボックスが赤い枠と番号5、「保存」ボタンが赤い枠と番号6で示されている"
    }
  },
  "runNow": {
    "src": "/guides/p3-run-now.png",
    "alt": {
      "en": "The Run the after-event emails and discounts now card at the bottom of Settings, with the Run now button boxed in red and numbered 7",
      "fr": "La carte Lancer maintenant les courriels et réductions après l'événement, en bas des Réglages, bouton Exécuter maintenant encadré en rouge et numéroté 7",
      "es": "La tarjeta para ejecutar ahora los correos y descuentos posteriores al evento, al final de Ajustes, con el botón Ejecutar ahora enmarcado en rojo y numerado 7",
      "de": "Die Karte zum sofortigen Ausführen der E-Mails und Rabatte nach der Veranstaltung am Ende der Einstellungen, der Button Jetzt ausführen rot umrandet und mit 7 nummeriert",
      "pt-BR": "O cartão para executar agora os e-mails e descontos pós-evento, no fim de Configurações, com o botão Executar agora destacado em vermelho e numerado 7",
      "hi": "सेटिंग्स के नीचे कार्यक्रम के बाद के ईमेल और छूट अभी चलाएँ कार्ड, अभी चलाएँ बटन लाल बॉक्स में और नंबर 7 के साथ",
      "zh-CN": "设置底部的“立即运行活动结束后的邮件和折扣”卡片，“立即运行”按钮用红框标出并编号为 7",
      "zh-TW": "設定底部的「立即執行活動結束後的電子郵件與折扣」卡片，「立即執行」按鈕以紅框標示並編號 7",
      "ja": "設定の下部にある「イベント後のメールと割引を今すぐ実行」カード。「今すぐ実行」ボタンが赤い枠と番号7で示されている"
    }
  },
  "navPromotions": {
    "src": "/guides/p4-nav-promotions.png",
    "alt": {
      "en": "The Giftpin menu in the Shopify admin with Promotions boxed in red and numbered 1",
      "fr": "Le menu Giftpin dans l'admin Shopify, Promotions encadré en rouge et numéroté 1",
      "es": "El menú de Giftpin en el administrador de Shopify, con Promociones enmarcado en rojo y numerado 1",
      "de": "Das Giftpin-Menü im Shopify-Admin, Aktionen rot umrandet und mit 1 nummeriert",
      "pt-BR": "O menu do Giftpin no admin da Shopify, com Promoções destacado em vermelho e numerado 1",
      "hi": "Shopify एडमिन में Giftpin मेन्यू, प्रमोशन लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 后台中的 Giftpin 菜单，“促销”用红框标出并编号为 1",
      "zh-TW": "Shopify 後台中的 Giftpin 選單，「促銷」以紅框標示並編號 1",
      "ja": "Shopify管理画面のGiftpinメニュー。「プロモーション」が赤い枠と番号1で示されている"
    }
  },
  "newPromotion": {
    "src": "/guides/p4-new-promotion.png",
    "alt": {
      "en": "The New promotion form with the type choice boxed and numbered 2, the discount boxed and numbered 3, the start and end dates boxed and numbered 4, and Create promotion boxed and numbered 5",
      "fr": "Le formulaire Nouvelle promotion : le type encadré et numéroté 2, la réduction 3, les dates de début et de fin 4, et Créer la promotion 5",
      "es": "El formulario Nueva promoción: el tipo enmarcado y numerado 2, el descuento 3, las fechas de inicio y fin 4 y Crear promoción 5",
      "de": "Das Formular Neue Aktion: Typ rot umrandet und mit 2 nummeriert, Rabatt 3, Start- und Enddatum 4 und Aktion erstellen 5",
      "pt-BR": "O formulário Nova promoção: o tipo destacado e numerado 2, o desconto 3, as datas de início e fim 4 e Criar promoção 5",
      "hi": "नया प्रमोशन फ़ॉर्म: प्रकार बॉक्स में नंबर 2, छूट नंबर 3, शुरू और खत्म की तारीख नंबर 4, और प्रमोशन बनाएँ नंबर 5",
      "zh-CN": "“新建促销”表单：类型用红框标出并编号为 2，折扣为 3，开始和结束日期为 4，“创建促销”为 5",
      "zh-TW": "「新增促銷」表單：類型以紅框標示並編號 2，折扣為 3，開始與結束日期為 4，「建立促銷」為 5",
      "ja": "新規プロモーションのフォーム。種類が赤い枠と番号2、割引が3、開始日と終了日が4、「プロモーションを作成」が5で示されている"
    }
  },
  "yourPromotions": {
    "src": "/guides/p4-your-promotions.png",
    "alt": {
      "en": "The Your promotions list, which sits above the New promotion form, with the Pause button boxed in red and numbered 6",
      "fr": "La liste Vos promotions, située au-dessus du formulaire Nouvelle promotion, avec le bouton Suspendre encadré en rouge et numéroté 6",
      "es": "La lista Tus promociones, situada encima del formulario Nueva promoción, con el botón Pausar enmarcado en rojo y numerado 6",
      "de": "Die Liste Ihre Aktionen, die über dem Formular Neue Aktion steht, mit dem Button Pausieren rot umrandet und mit 6 nummeriert",
      "pt-BR": "A lista Suas promoções, que fica acima do formulário Nova promoção, com o botão Pausar destacado em vermelho e numerado 6",
      "hi": "आपके प्रमोशन की सूची, जो नया प्रमोशन फ़ॉर्म के ऊपर है, रोकें बटन लाल बॉक्स में और नंबर 6 के साथ",
      "zh-CN": "“您的促销”列表位于“新建促销”表单上方，“暂停”按钮用红框标出并编号为 6",
      "zh-TW": "「您的促銷」清單位於「新增促銷」表單上方，「暫停」按鈕以紅框標示並編號 6",
      "ja": "「プロモーション一覧」は新規プロモーションのフォームの上にあり、「一時停止」ボタンが赤い枠と番号6で示されている"
    }
  },
  "navDiscounts": {
    "src": "/guides/p5-nav-discounts.png",
    "alt": {
      "en": "Shopify admin left menu with Discounts boxed in red and numbered 7",
      "fr": "Menu de gauche de l'admin Shopify avec Réductions encadré en rouge et numéroté 7",
      "es": "Menú izquierdo del admin de Shopify con Descuentos enmarcado en rojo y numerado 7",
      "de": "Linkes Menü im Shopify-Admin mit Rabatte rot umrandet und mit 7 nummeriert",
      "pt-BR": "Menu à esquerda do admin da Shopify com Descontos destacado em vermelho e numerado 7",
      "hi": "Shopify एडमिन का बायाँ मेनू, डिस्काउंट लाल बॉक्स में और नंबर 7 के साथ",
      "zh-CN": "Shopify 后台左侧菜单，「折扣」以红框标示并编号 7",
      "zh-TW": "Shopify 後台左側選單，「折扣」以紅框標示並編號 7",
      "ja": "Shopify管理画面の左メニュー。「割引」が赤い枠と番号7で示されている"
    }
  },
  "discountsList": {
    "src": "/guides/p5-discounts-list.png",
    "alt": {
      "en": "Shopify's Discounts list with the Giftpin: Registry sale row boxed in red and numbered 8",
      "fr": "La liste des réductions de Shopify avec la ligne Giftpin: Registry sale encadrée en rouge et numérotée 8",
      "es": "La lista de descuentos de Shopify con la fila Giftpin: Registry sale enmarcada en rojo y numerada 8",
      "de": "Die Rabattliste von Shopify mit der Zeile Giftpin: Registry sale rot umrandet und mit 8 nummeriert",
      "pt-BR": "A lista de descontos da Shopify com a linha Giftpin: Registry sale destacada em vermelho e numerada 8",
      "hi": "Shopify की डिस्काउंट सूची, Giftpin: Registry sale वाली पंक्ति लाल बॉक्स में और नंबर 8 के साथ",
      "zh-CN": "Shopify 折扣列表，「Giftpin: Registry sale」一行以红框标示并编号 8",
      "zh-TW": "Shopify 折扣清單，「Giftpin: Registry sale」該列以紅框標示並編號 8",
      "ja": "Shopifyの割引一覧。「Giftpin: Registry sale」の行が赤い枠と番号8で示されている"
    }
  },
  "navAnalytics": {
    "src": "/guides/p6-nav-analytics.png",
    "alt": {
      "en": "Giftpin's menu under Apps in the Shopify admin with Analytics boxed in red and numbered 1",
      "fr": "Le menu de Giftpin sous Applications dans l'admin Shopify avec Analytique encadré en rouge et numéroté 1",
      "es": "El menú de Giftpin en Aplicaciones del admin de Shopify con Analíticas enmarcado en rojo y numerado 1",
      "de": "Das Giftpin-Menü unter Apps im Shopify-Admin mit Analysen rot umrandet und mit 1 nummeriert",
      "pt-BR": "O menu do Giftpin em Apps no admin da Shopify com Análises destacado em vermelho e numerado 1",
      "hi": "Shopify एडमिन में ऐप्स के नीचे Giftpin का मेनू, एनालिटिक्स लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 后台「应用」下的 Giftpin 菜单，「分析」以红框标示并编号 1",
      "zh-TW": "Shopify 後台「應用程式」下的 Giftpin 選單，「分析」以紅框標示並編號 1",
      "ja": "Shopify管理画面のアプリ内のGiftpinメニュー。「分析」が赤い枠と番号1で示されている"
    }
  },
  "analytics": {
    "src": "/guides/p6-analytics.png",
    "alt": {
      "en": "The Analytics charts (registries created, items added, gifts credited) with the Download CSV button boxed in red and numbered 2",
      "fr": "Les graphiques Analytique (registres créés, articles ajoutés, cadeaux crédités) avec le bouton Télécharger le CSV encadré en rouge et numéroté 2",
      "es": "Los gráficos de Analíticas (registros creados, artículos añadidos, regalos acreditados) con el botón Descargar CSV enmarcado en rojo y numerado 2",
      "de": "Die Analyse-Diagramme (erstellte Listen, hinzugefügte Artikel, angerechnete Geschenke) mit dem Button CSV herunterladen rot umrandet und mit 2 nummeriert",
      "pt-BR": "Os gráficos de Análises (listas criadas, itens adicionados, presentes creditados) com o botão Baixar CSV destacado em vermelho e numerado 2",
      "hi": "एनालिटिक्स चार्ट (बनाई गई रजिस्ट्रियाँ, जोड़े गए आइटम, क्रेडिट किए गए उपहार), CSV डाउनलोड करें बटन लाल बॉक्स में और नंबर 2 के साथ",
      "zh-CN": "分析图表（已创建的礼物清单、已添加的商品、已记入的礼物），「下载 CSV」按钮以红框标示并编号 2",
      "zh-TW": "分析圖表（已建立的禮物清單、已加入的商品、已記入的禮物），「下載 CSV」按鈕以紅框標示並編號 2",
      "ja": "分析のグラフ（作成されたリスト、追加された商品、反映されたギフト）。「CSVをダウンロード」ボタンが赤い枠と番号2で示されている"
    }
  },
  "openApps": {
    "src": "/guides/p11-open-apps.png",
    "alt": {
      "en": "Shopify admin's left menu with Apps boxed in red and numbered 1, and an arrow to the Apps list where Giftpin Gift Registry is boxed and numbered 2",
      "fr": "Le menu de gauche de l'admin Shopify avec Applications encadré en rouge et numéroté 1, et une flèche vers la liste des applications où Giftpin Gift Registry est encadré et numéroté 2",
      "es": "El menú izquierdo del admin de Shopify con Aplicaciones enmarcado en rojo y numerado 1, y una flecha hacia la lista de aplicaciones donde Giftpin Gift Registry está enmarcado y numerado 2",
      "de": "Das linke Menü im Shopify-Admin mit Apps rot umrandet und mit 1 nummeriert, und ein Pfeil zur App-Liste, in der Giftpin Gift Registry umrandet und mit 2 nummeriert ist",
      "pt-BR": "O menu à esquerda do admin da Shopify com Apps destacado em vermelho e numerado 1, e uma seta para a lista de apps onde Giftpin Gift Registry está destacado e numerado 2",
      "hi": "Shopify एडमिन का बायाँ मेनू, ऐप्स लाल बॉक्स में और नंबर 1 के साथ, और एक तीर ऐप्स की सूची की ओर जहाँ Giftpin Gift Registry लाल बॉक्स में और नंबर 2 के साथ है",
      "zh-CN": "Shopify 后台左侧菜单，「应用」以红框标示并编号 1，箭头指向应用列表，其中 Giftpin Gift Registry 以红框标示并编号 2",
      "zh-TW": "Shopify 後台左側選單，「應用程式」以紅框標示並編號 1，箭頭指向應用程式清單，其中 Giftpin Gift Registry 以紅框標示並編號 2",
      "ja": "Shopify管理画面の左メニュー。「アプリ」が赤い枠と番号1で示され、矢印の先のアプリ一覧でGiftpin Gift Registryが赤い枠と番号2で示されている"
    }
  },
  "clickGiftpin": {
    "src": "/guides/p11-click-giftpin.png",
    "alt": {
      "en": "Shopify admin's left menu with Giftpin Gift Registry, under Apps, boxed in red and numbered 1, and Giftpin's own menu open below it: Overview, Registries, Promotions, Analytics, In-store, Settings and Plan",
      "fr": "Le menu de gauche de l'admin Shopify avec Giftpin Gift Registry, sous Applications, encadré en rouge et numéroté 1, et le menu de Giftpin ouvert en dessous : Vue d'ensemble, Listes, Promotions, Analyses, En magasin, Paramètres et Forfait",
      "es": "El menú izquierdo del admin de Shopify con Giftpin Gift Registry, bajo Aplicaciones, enmarcado en rojo y numerado 1, y el menú de Giftpin abierto debajo: Resumen, Registros, Promociones, Analíticas, En tienda, Ajustes y Plan",
      "de": "Das linke Menü im Shopify-Admin mit Giftpin Gift Registry unter Apps, rot umrandet und mit 1 nummeriert, darunter das geöffnete Giftpin-Menü: Übersicht, Listen, Aktionen, Analysen, Im Laden, Einstellungen und Tarif",
      "pt-BR": "O menu à esquerda do admin da Shopify com Giftpin Gift Registry, em Apps, destacado em vermelho e numerado 1, e o menu do Giftpin aberto abaixo: Visão geral, Listas, Promoções, Análises, Na loja, Configurações e Plano",
      "hi": "Shopify एडमिन का बायाँ मेनू, ऐप्स के नीचे Giftpin Gift Registry लाल बॉक्स में और नंबर 1 के साथ, और उसके नीचे खुला Giftpin का मेनू: ओवरव्यू, रजिस्ट्रियाँ, प्रमोशन, एनालिटिक्स, इन-स्टोर, सेटिंग्स और प्लान",
      "zh-CN": "Shopify 后台左侧菜单，「应用」下的 Giftpin Gift Registry 以红框标示并编号 1，其下展开 Giftpin 自己的菜单：概览、礼物清单、促销、分析、门店、设置和方案",
      "zh-TW": "Shopify 後台左側選單，「應用程式」下的 Giftpin Gift Registry 以紅框標示並編號 1，其下展開 Giftpin 自己的選單：總覽、禮物清單、促銷、分析、門市、設定和方案",
      "ja": "Shopify管理画面の左メニュー。「アプリ」の下のGiftpin Gift Registryが赤い枠と番号1で示され、その下にGiftpinのメニュー（概要、リスト、プロモーション、分析、店頭、設定、プラン）が開いている"
    }
  },
  "clickApps": {
    "src": "/guides/p21-nav-apps.png",
    "alt": {
      "en": "Shopify admin's left menu collapsed to Apps and Giftpin Gift Registry, with Apps boxed in red and numbered 1",
      "fr": "Le menu de gauche de l'admin Shopify réduit à Applications et Giftpin Gift Registry, avec Applications encadré en rouge et numéroté 1",
      "es": "El menú izquierdo del admin de Shopify reducido a Aplicaciones y Giftpin Gift Registry, con Aplicaciones enmarcado en rojo y numerado 1",
      "de": "Das linke Menü im Shopify-Admin, zusammengeklappt auf Apps und Giftpin Gift Registry, mit Apps rot umrandet und mit 1 nummeriert",
      "pt-BR": "O menu à esquerda do admin da Shopify reduzido a Apps e Giftpin Gift Registry, com Apps destacado em vermelho e numerado 1",
      "hi": "Shopify एडमिन का बायाँ मेनू, ऐप्स और Giftpin Gift Registry तक सिमटा हुआ, ऐप्स लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 后台左侧菜单收起后只剩「应用」和 Giftpin Gift Registry，「应用」以红框标示并编号 1",
      "zh-TW": "Shopify 後台左側選單收合後只剩「應用程式」和 Giftpin Gift Registry，「應用程式」以紅框標示並編號 1",
      "ja": "Shopify管理画面の左メニュー。「アプリ」とGiftpin Gift Registryだけが表示され、「アプリ」が赤い枠と番号1で示されている"
    }
  },
  "clickGiftpinRow": {
    "src": "/guides/p21-nav-giftpin.png",
    "alt": {
      "en": "Shopify admin's left menu with Giftpin Gift Registry, under Apps, boxed in red and numbered 1",
      "fr": "Le menu de gauche de l'admin Shopify avec Giftpin Gift Registry, sous Applications, encadré en rouge et numéroté 1",
      "es": "El menú izquierdo del admin de Shopify con Giftpin Gift Registry, bajo Aplicaciones, enmarcado en rojo y numerado 1",
      "de": "Das linke Menü im Shopify-Admin mit Giftpin Gift Registry unter Apps, rot umrandet und mit 1 nummeriert",
      "pt-BR": "O menu à esquerda do admin da Shopify com Giftpin Gift Registry, em Apps, destacado em vermelho e numerado 1",
      "hi": "Shopify एडमिन का बायाँ मेनू, ऐप्स के नीचे Giftpin Gift Registry लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 后台左侧菜单，「应用」下的 Giftpin Gift Registry 以红框标示并编号 1",
      "zh-TW": "Shopify 後台左側選單，「應用程式」下的 Giftpin Gift Registry 以紅框標示並編號 1",
      "ja": "Shopify管理画面の左メニュー。「アプリ」の下のGiftpin Gift Registryが赤い枠と番号1で示されている"
    }
  },
  "clickOverview": {
    "src": "/guides/p21-nav-overview-click.png",
    "alt": {
      "en": "Giftpin's menu open under Apps in the Shopify admin, with Overview boxed in red and numbered 1",
      "fr": "Le menu de Giftpin ouvert sous Applications dans l'admin Shopify, avec Vue d'ensemble encadré en rouge et numéroté 1",
      "es": "El menú de Giftpin abierto bajo Aplicaciones en el admin de Shopify, con Resumen enmarcado en rojo y numerado 1",
      "de": "Das geöffnete Giftpin-Menü unter Apps im Shopify-Admin, mit Übersicht rot umrandet und mit 1 nummeriert",
      "pt-BR": "O menu do Giftpin aberto em Apps no admin da Shopify, com Visão geral destacado em vermelho e numerado 1",
      "hi": "Shopify एडमिन में ऐप्स के नीचे खुला Giftpin का मेनू, ओवरव्यू लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 后台「应用」下展开的 Giftpin 菜单，「概览」以红框标示并编号 1",
      "zh-TW": "Shopify 後台「應用程式」下展開的 Giftpin 選單，「總覽」以紅框標示並編號 1",
      "ja": "Shopify管理画面の「アプリ」の下で開いたGiftpinのメニュー。「概要」が赤い枠と番号1で示されている"
    }
  },
  "navOverview": {
    "src": "/guides/p21-nav-overview-click.png",
    "alt": {
      "en": "Giftpin's menu under Apps in the Shopify admin with Overview boxed in red and numbered 1",
      "fr": "Le menu de Giftpin sous Applications dans l'admin Shopify avec Aperçu encadré en rouge et numéroté 1",
      "es": "El menú de Giftpin en Aplicaciones del admin de Shopify con Resumen enmarcado en rojo y numerado 1",
      "de": "Das Giftpin-Menü unter Apps im Shopify-Admin mit Übersicht rot umrandet und mit 1 nummeriert",
      "pt-BR": "O menu do Giftpin em Apps no admin da Shopify com Visão geral destacado em vermelho e numerado 1",
      "hi": "Shopify एडमिन में ऐप्स के नीचे Giftpin का मेनू, ओवरव्यू लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 后台「应用」下的 Giftpin 菜单，「概览」以红框标示并编号 1",
      "zh-TW": "Shopify 後台「應用程式」下的 Giftpin 選單，「總覽」以紅框標示並編號 1",
      "ja": "Shopify管理画面のアプリ内のGiftpinメニュー。「概要」が赤い枠と番号1で示されている"
    }
  },
  "navRegistries": {
    "src": "/guides/p7-nav-registries.png",
    "alt": {
      "en": "Giftpin's menu under Apps in the Shopify admin with Registries boxed in red and numbered 1",
      "fr": "Le menu de Giftpin sous Applications dans l'admin Shopify avec Registres encadré en rouge et numéroté 1",
      "es": "El menú de Giftpin en Aplicaciones del admin de Shopify con Registros enmarcado en rojo y numerado 1",
      "de": "Das Giftpin-Menü unter Apps im Shopify-Admin mit Listen rot umrandet und mit 1 nummeriert",
      "pt-BR": "O menu do Giftpin em Apps no admin da Shopify com Listas destacado em vermelho e numerado 1",
      "hi": "Shopify एडमिन में ऐप्स के नीचे Giftpin का मेनू, रजिस्ट्रियाँ लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 后台「应用」下的 Giftpin 菜单，「礼物清单」以红框标示并编号 1",
      "zh-TW": "Shopify 後台「應用程式」下的 Giftpin 選單，「禮物清單」以紅框標示並編號 1",
      "ja": "Shopify管理画面のアプリ内のGiftpinメニュー。「リスト」が赤い枠と番号1で示されている"
    }
  },
  "exportCsv": {
    "src": "/guides/p7-export-csv.png",
    "alt": {
      "en": "The Export box at the bottom of the Registries page, with the Registries CSV button boxed and numbered 2 and the Purchases CSV button boxed and numbered 3",
      "fr": "Le bloc Exporter en bas de la page Registres, avec le bouton CSV des registres encadré et numéroté 2 et le bouton CSV des achats encadré et numéroté 3",
      "es": "El cuadro Exportar al final de la página Registros, con el botón CSV de registros enmarcado y numerado 2 y el botón CSV de compras enmarcado y numerado 3",
      "de": "Das Feld Export unten auf der Seite Listen, mit dem Button CSV der Listen umrandet und mit 2 nummeriert und dem Button CSV der Käufe umrandet und mit 3 nummeriert",
      "pt-BR": "A caixa Exportar no fim da página Listas, com o botão CSV das listas destacado e numerado 2 e o botão CSV das compras destacado e numerado 3",
      "hi": "रजिस्ट्रियाँ पेज के नीचे एक्सपोर्ट बॉक्स, रजिस्ट्रियाँ CSV बटन बॉक्स में नंबर 2 के साथ और खरीदारी CSV बटन बॉक्स में नंबर 3 के साथ",
      "zh-CN": "「礼物清单」页面底部的导出区域，「清单 CSV」按钮以红框标示并编号 2，「购买 CSV」按钮以红框标示并编号 3",
      "zh-TW": "「禮物清單」頁面底部的匯出區域，「清單 CSV」按鈕以紅框標示並編號 2，「購買 CSV」按鈕以紅框標示並編號 3",
      "ja": "リストページ下部のエクスポート欄。「リストCSV」ボタンが赤い枠と番号2、「購入CSV」ボタンが赤い枠と番号3で示されている"
    }
  },
  "navInStore": {
    "src": "/guides/p8-nav-instore.png",
    "alt": {
      "en": "Giftpin's menu under Apps in the Shopify admin with In-store boxed in red and numbered 1",
      "fr": "Le menu de Giftpin sous Applications dans l'admin Shopify avec En magasin encadré en rouge et numéroté 1",
      "es": "El menú de Giftpin en Aplicaciones del admin de Shopify con En tienda enmarcado en rojo y numerado 1",
      "de": "Das Giftpin-Menü unter Apps im Shopify-Admin mit Im Laden rot umrandet und mit 1 nummeriert",
      "pt-BR": "O menu do Giftpin em Apps no admin da Shopify com Na loja destacado em vermelho e numerado 1",
      "hi": "Shopify एडमिन में ऐप्स के नीचे Giftpin का मेनू, स्टोर में लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "Shopify 后台「应用」下的 Giftpin 菜单，「店内」以红框标示并编号 1",
      "zh-TW": "Shopify 後台「應用程式」下的 Giftpin 選單，「店內」以紅框標示並編號 1",
      "ja": "Shopify管理画面のアプリ内のGiftpinメニュー。「店頭」が赤い枠と番号1で示されている"
    }
  },
  "inStore": {
    "src": "/guides/p8-instore.png",
    "alt": {
      "en": "The In-store page, with the Find a registry search box boxed in red and numbered 2 and the Create registry button boxed and numbered 3",
      "fr": "La page En magasin, avec le champ Trouver un registre encadré en rouge et numéroté 2 et le bouton Créer un registre encadré et numéroté 3",
      "es": "La página En tienda, con el cuadro Buscar un registro enmarcado en rojo y numerado 2 y el botón Crear registro enmarcado y numerado 3",
      "de": "Die Seite Im Laden, mit dem Suchfeld Liste finden rot umrandet und mit 2 nummeriert und dem Button Liste erstellen umrandet und mit 3 nummeriert",
      "pt-BR": "A página Na loja, com a caixa Encontrar uma lista destacada em vermelho e numerada 2 e o botão Criar lista destacado e numerado 3",
      "hi": "स्टोर में पेज, रजिस्ट्री खोजें बॉक्स लाल बॉक्स में नंबर 2 के साथ और रजिस्ट्री बनाएँ बटन बॉक्स में नंबर 3 के साथ",
      "zh-CN": "「店内」页面，「查找礼物清单」搜索框以红框标示并编号 2，「创建清单」按钮以红框标示并编号 3",
      "zh-TW": "「店內」頁面，「尋找禮物清單」搜尋框以紅框標示並編號 2，「建立清單」按鈕以紅框標示並編號 3",
      "ja": "店頭ページ。「リストを探す」の検索欄が赤い枠と番号2、「リストを作成」ボタンが赤い枠と番号3で示されている"
    }
  },
  "posSettings": {
    "src": "/guides/p9-settings.png",
    "alt": {
      "en": "Shopify admin: “Settings” boxed in red and numbered 4",
      "fr": "Admin Shopify: « Settings » encadré en rouge et numéroté 4",
      "es": "Admin de Shopify: «Settings» enmarcado en rojo y numerado 4",
      "de": "Shopify-Admin: „Settings“ rot umrandet und mit 4 nummeriert",
      "pt-BR": "Admin da Shopify: “Settings” destacado em vermelho e numerado 4",
      "hi": "Shopify एडमिन: “Settings” लाल बॉक्स में और नंबर 4 के साथ",
      "zh-CN": "Shopify 后台: “Settings”以红框标示并编号 4",
      "zh-TW": "Shopify 後台: 「Settings」以紅框標示並編號 4",
      "ja": "Shopify管理画面: 「Settings」が赤い枠と番号4で示されている"
    }
  },
  "posSettingsChannels": {
    "src": "/guides/p9-settings-channels.png",
    "alt": {
      "en": "Shopify admin: “Sales channels” boxed in red and numbered 5",
      "fr": "Admin Shopify: « Sales channels » encadré en rouge et numéroté 5",
      "es": "Admin de Shopify: «Sales channels» enmarcado en rojo y numerado 5",
      "de": "Shopify-Admin: „Sales channels“ rot umrandet und mit 5 nummeriert",
      "pt-BR": "Admin da Shopify: “Sales channels” destacado em vermelho e numerado 5",
      "hi": "Shopify एडमिन: “Sales channels” लाल बॉक्स में और नंबर 5 के साथ",
      "zh-CN": "Shopify 后台: “Sales channels”以红框标示并编号 5",
      "zh-TW": "Shopify 後台: 「Sales channels」以紅框標示並編號 5",
      "ja": "Shopify管理画面: 「Sales channels」が赤い枠と番号5で示されている"
    }
  },
  "posSettingsBack": {
    "src": "/guides/p9-settings-back.png",
    "alt": {
      "en": "Shopify admin: “Back arrow next to Settings” boxed in red and numbered 6",
      "fr": "Admin Shopify: « Back arrow next to Settings » encadré en rouge et numéroté 6",
      "es": "Admin de Shopify: «Back arrow next to Settings» enmarcado en rojo y numerado 6",
      "de": "Shopify-Admin: „Back arrow next to Settings“ rot umrandet und mit 6 nummeriert",
      "pt-BR": "Admin da Shopify: “Back arrow next to Settings” destacado em vermelho e numerado 6",
      "hi": "Shopify एडमिन: “Back arrow next to Settings” लाल बॉक्स में और नंबर 6 के साथ",
      "zh-CN": "Shopify 后台: “Back arrow next to Settings”以红框标示并编号 6",
      "zh-TW": "Shopify 後台: 「Back arrow next to Settings」以紅框標示並編號 6",
      "ja": "Shopify管理画面: 「Back arrow next to Settings」が赤い枠と番号6で示されている"
    }
  },
  "posProducts": {
    "src": "/guides/p9-products.png",
    "alt": {
      "en": "Shopify admin: “Products” boxed in red and numbered 7",
      "fr": "Admin Shopify: « Products » encadré en rouge et numéroté 7",
      "es": "Admin de Shopify: «Products» enmarcado en rojo y numerado 7",
      "de": "Shopify-Admin: „Products“ rot umrandet und mit 7 nummeriert",
      "pt-BR": "Admin da Shopify: “Products” destacado em vermelho e numerado 7",
      "hi": "Shopify एडमिन: “Products” लाल बॉक्स में और नंबर 7 के साथ",
      "zh-CN": "Shopify 后台: “Products”以红框标示并编号 7",
      "zh-TW": "Shopify 後台: 「Products」以紅框標示並編號 7",
      "ja": "Shopify管理画面: 「Products」が赤い枠と番号7で示されている"
    }
  },
  "posProductRow": {
    "src": "/guides/p9-product-row.png",
    "alt": {
      "en": "Shopify admin: “Product name” boxed in red and numbered 8",
      "fr": "Admin Shopify: « Product name » encadré en rouge et numéroté 8",
      "es": "Admin de Shopify: «Product name» enmarcado en rojo y numerado 8",
      "de": "Shopify-Admin: „Product name“ rot umrandet und mit 8 nummeriert",
      "pt-BR": "Admin da Shopify: “Product name” destacado em vermelho e numerado 8",
      "hi": "Shopify एडमिन: “Product name” लाल बॉक्स में और नंबर 8 के साथ",
      "zh-CN": "Shopify 后台: “Product name”以红框标示并编号 8",
      "zh-TW": "Shopify 後台: 「Product name」以紅框標示並編號 8",
      "ja": "Shopify管理画面: 「Product name」が赤い枠と番号8で示されている"
    }
  },
  "posPublishing": {
    "src": "/guides/p9-publishing.png",
    "alt": {
      "en": "Shopify admin: “Publishing adjust icon” boxed in red and numbered 9",
      "fr": "Admin Shopify: « Publishing adjust icon » encadré en rouge et numéroté 9",
      "es": "Admin de Shopify: «Publishing adjust icon» enmarcado en rojo y numerado 9",
      "de": "Shopify-Admin: „Publishing adjust icon“ rot umrandet und mit 9 nummeriert",
      "pt-BR": "Admin da Shopify: “Publishing adjust icon” destacado em vermelho e numerado 9",
      "hi": "Shopify एडमिन: “Publishing adjust icon” लाल बॉक्स में और नंबर 9 के साथ",
      "zh-CN": "Shopify 后台: “Publishing adjust icon”以红框标示并编号 9",
      "zh-TW": "Shopify 後台: 「Publishing adjust icon」以紅框標示並編號 9",
      "ja": "Shopify管理画面: 「Publishing adjust icon」が赤い枠と番号9で示されている"
    }
  },
  "posPublishDialog": {
    "src": "/guides/p9-publish-dialog.png",
    "alt": {
      "en": "Shopify admin: “Point of Sale” boxed in red and numbered 10; “Done” boxed in red and numbered 11",
      "fr": "Admin Shopify: « Point of Sale » encadré en rouge et numéroté 10; « Done » encadré en rouge et numéroté 11",
      "es": "Admin de Shopify: «Point of Sale» enmarcado en rojo y numerado 10; «Done» enmarcado en rojo y numerado 11",
      "de": "Shopify-Admin: „Point of Sale“ rot umrandet und mit 10 nummeriert; „Done“ rot umrandet und mit 11 nummeriert",
      "pt-BR": "Admin da Shopify: “Point of Sale” destacado em vermelho e numerado 10; “Done” destacado em vermelho e numerado 11",
      "hi": "Shopify एडमिन: “Point of Sale” लाल बॉक्स में और नंबर 10 के साथ; “Done” लाल बॉक्स में और नंबर 11 के साथ",
      "zh-CN": "Shopify 后台: “Point of Sale”以红框标示并编号 10; “Done”以红框标示并编号 11",
      "zh-TW": "Shopify 後台: 「Point of Sale」以紅框標示並編號 10; 「Done」以紅框標示並編號 11",
      "ja": "Shopify管理画面: 「Point of Sale」が赤い枠と番号10で示されている; 「Done」が赤い枠と番号11で示されている"
    }
  },
  "posProductSave": {
    "src": "/guides/p9-product-save.png",
    "alt": {
      "en": "Shopify admin: “Save” boxed in red and numbered 12",
      "fr": "Admin Shopify: « Save » encadré en rouge et numéroté 12",
      "es": "Admin de Shopify: «Save» enmarcado en rojo y numerado 12",
      "de": "Shopify-Admin: „Save“ rot umrandet und mit 12 nummeriert",
      "pt-BR": "Admin da Shopify: “Save” destacado em vermelho e numerado 12",
      "hi": "Shopify एडमिन: “Save” लाल बॉक्स में और नंबर 12 के साथ",
      "zh-CN": "Shopify 后台: “Save”以红框标示并编号 12",
      "zh-TW": "Shopify 後台: 「Save」以紅框標示並編號 12",
      "ja": "Shopify管理画面: 「Save」が赤い枠と番号12で示されている"
    }
  },
  "posMenu": {
    "src": "/guides/p9-pos-menu.png",
    "alt": {
      "en": "Shopify admin: “Point of Sale” boxed in red and numbered 13",
      "fr": "Admin Shopify: « Point of Sale » encadré en rouge et numéroté 13",
      "es": "Admin de Shopify: «Point of Sale» enmarcado en rojo y numerado 13",
      "de": "Shopify-Admin: „Point of Sale“ rot umrandet und mit 13 nummeriert",
      "pt-BR": "Admin da Shopify: “Point of Sale” destacado em vermelho e numerado 13",
      "hi": "Shopify एडमिन: “Point of Sale” लाल बॉक्स में और नंबर 13 के साथ",
      "zh-CN": "Shopify 后台: “Point of Sale”以红框标示并编号 13",
      "zh-TW": "Shopify 後台: 「Point of Sale」以紅框標示並編號 13",
      "ja": "Shopify管理画面: 「Point of Sale」が赤い枠と番号13で示されている"
    }
  },
  "posEdit": {
    "src": "/guides/p9-edit-pos.png",
    "alt": {
      "en": "Shopify admin: “Edit Point of Sale” boxed in red and numbered 14",
      "fr": "Admin Shopify: « Edit Point of Sale » encadré en rouge et numéroté 14",
      "es": "Admin de Shopify: la fila «App de POS» en Point of Sale → Configuración, enmarcada en rojo y numerada 14",
      "de": "Shopify-Admin: „Edit Point of Sale“ rot umrandet und mit 14 nummeriert",
      "pt-BR": "Admin da Shopify: “Edit Point of Sale” destacado em vermelho e numerado 14",
      "hi": "Shopify एडमिन: “Edit Point of Sale” लाल बॉक्स में और नंबर 14 के साथ",
      "zh-CN": "Shopify 后台: “Edit Point of Sale”以红框标示并编号 14",
      "zh-TW": "Shopify 後台: 「Edit Point of Sale」以紅框標示並編號 14",
      "ja": "Shopify管理画面: 「Edit Point of Sale」が赤い枠と番号14で示されている"
    }
  },
  "posAddTile": {
    "src": "/guides/p9-add-tile.png",
    "alt": {
      "en": "Shopify admin: “Add tile” boxed in red and numbered 15; “Apps” boxed in red and numbered 16; “Giftpin Gift Registry” boxed in red and numbered 17",
      "fr": "Admin Shopify: « Add tile » encadré en rouge et numéroté 15; « Apps » encadré en rouge et numéroté 16; « Giftpin Gift Registry » encadré en rouge et numéroté 17",
      "es": "Admin de Shopify: «Agregar recuadro» enmarcado en rojo y numerado 15; «Apps» enmarcado en rojo y numerado 16; «Giftpin Gift Registry» enmarcado en rojo y numerado 17",
      "de": "Shopify-Admin: „Add tile“ rot umrandet und mit 15 nummeriert; „Apps“ rot umrandet und mit 16 nummeriert; „Giftpin Gift Registry“ rot umrandet und mit 17 nummeriert",
      "pt-BR": "Admin da Shopify: “Add tile” destacado em vermelho e numerado 15; “Apps” destacado em vermelho e numerado 16; “Giftpin Gift Registry” destacado em vermelho e numerado 17",
      "hi": "Shopify एडमिन: “Add tile” लाल बॉक्स में और नंबर 15 के साथ; “Apps” लाल बॉक्स में और नंबर 16 के साथ; “Giftpin Gift Registry” लाल बॉक्स में और नंबर 17 के साथ",
      "zh-CN": "Shopify 后台: “Add tile”以红框标示并编号 15; “Apps”以红框标示并编号 16; “Giftpin Gift Registry”以红框标示并编号 17",
      "zh-TW": "Shopify 後台: 「Add tile」以紅框標示並編號 15; 「Apps」以紅框標示並編號 16; 「Giftpin Gift Registry」以紅框標示並編號 17",
      "ja": "Shopify管理画面: 「Add tile」が赤い枠と番号15で示されている; 「Apps」が赤い枠と番号16で示されている; 「Giftpin Gift Registry」が赤い枠と番号17で示されている"
    }
  },
  "posTile": {
    "src": "/guides/p9-pos-tile.png",
    "alt": {
      "en": "Shopify POS home screen with the Giftpin tile, “Find or start a gift registry for a customer at the counter”, boxed in red and numbered 18",
      "fr": "Écran d'accueil de Shopify POS avec la tuile Giftpin, « Find or start a gift registry for a customer at the counter », encadrée en rouge et numérotée 18",
      "es": "Pantalla de inicio de Shopify POS con el icono de Giftpin, «Find or start a gift registry for a customer at the counter», enmarcado en rojo y numerado 18",
      "de": "Startbildschirm von Shopify POS mit der Giftpin-Kachel „Find or start a gift registry for a customer at the counter“, rot umrandet und mit 18 nummeriert",
      "pt-BR": "Tela inicial do Shopify POS com o bloco do Giftpin, “Find or start a gift registry for a customer at the counter”, destacado em vermelho e numerado 18",
      "hi": "Shopify POS की होम स्क्रीन, Giftpin टाइल “Find or start a gift registry for a customer at the counter” लाल बॉक्स में और नंबर 18 के साथ",
      "zh-CN": "Shopify POS 主屏幕，Giftpin 磁贴“Find or start a gift registry for a customer at the counter”以红框标示并编号 18",
      "zh-TW": "Shopify POS 主畫面，Giftpin 圖塊「Find or start a gift registry for a customer at the counter」以紅框標示並編號 18",
      "ja": "Shopify POSのホーム画面。Giftpinのタイル「Find or start a gift registry for a customer at the counter」が赤い枠と番号18で示されている"
    }
  },
  "posPhoneSearch": {
    "src": "/guides/p10-pos-phone-search.png",
    "alt": {
      "en": "Shopify POS on a phone: “Search box” boxed in red and numbered 19; “Maya's Christmas list” boxed in red and numbered 20; “Start a registry for a customer” boxed in red and numbered 21",
      "fr": "Shopify POS sur téléphone: « Search box » encadré en rouge et numéroté 19; « Maya's Christmas list » encadré en rouge et numéroté 20; « Start a registry for a customer » encadré en rouge et numéroté 21",
      "es": "Shopify POS en un teléfono: «Search box» enmarcado en rojo y numerado 19; «Maya's Christmas list» enmarcado en rojo y numerado 20; «Start a registry for a customer» enmarcado en rojo y numerado 21",
      "de": "Shopify POS auf dem Smartphone: „Search box“ rot umrandet und mit 19 nummeriert; „Maya's Christmas list“ rot umrandet und mit 20 nummeriert; „Start a registry for a customer“ rot umrandet und mit 21 nummeriert",
      "pt-BR": "Shopify POS no celular: “Search box” destacado em vermelho e numerado 19; “Maya's Christmas list” destacado em vermelho e numerado 20; “Start a registry for a customer” destacado em vermelho e numerado 21",
      "hi": "फ़ोन पर Shopify POS: “Search box” लाल बॉक्स में और नंबर 19 के साथ; “Maya's Christmas list” लाल बॉक्स में और नंबर 20 के साथ; “Start a registry for a customer” लाल बॉक्स में और नंबर 21 के साथ",
      "zh-CN": "手机上的 Shopify POS: “Search box”以红框标示并编号 19; “Maya's Christmas list”以红框标示并编号 20; “Start a registry for a customer”以红框标示并编号 21",
      "zh-TW": "手機上的 Shopify POS: 「Search box」以紅框標示並編號 19; 「Maya's Christmas list」以紅框標示並編號 20; 「Start a registry for a customer」以紅框標示並編號 21",
      "ja": "スマートフォンのShopify POS: 「Search box」が赤い枠と番号19で示されている; 「Maya's Christmas list」が赤い枠と番号20で示されている; 「Start a registry for a customer」が赤い枠と番号21で示されている"
    }
  },
  "barProducts": {
    "src": "/guides/p10-products.png",
    "alt": {
      "en": "Shopify admin: “Products” boxed in red and numbered 22",
      "fr": "Admin Shopify: « Products » encadré en rouge et numéroté 22",
      "es": "Admin de Shopify: «Products» enmarcado en rojo y numerado 22",
      "de": "Shopify-Admin: „Products“ rot umrandet und mit 22 nummeriert",
      "pt-BR": "Admin da Shopify: “Products” destacado em vermelho e numerado 22",
      "hi": "Shopify एडमिन: “Products” लाल बॉक्स में और नंबर 22 के साथ",
      "zh-CN": "Shopify 后台: “Products”以红框标示并编号 22",
      "zh-TW": "Shopify 後台: 「Products」以紅框標示並編號 22",
      "ja": "Shopify管理画面: 「Products」が赤い枠と番号22で示されている"
    }
  },
  "barRow": {
    "src": "/guides/p10-product-row.png",
    "alt": {
      "en": "Shopify admin: “Product name” boxed in red and numbered 23",
      "fr": "Admin Shopify: « Product name » encadré en rouge et numéroté 23",
      "es": "Admin de Shopify: «Product name» enmarcado en rojo y numerado 23",
      "de": "Shopify-Admin: „Product name“ rot umrandet und mit 23 nummeriert",
      "pt-BR": "Admin da Shopify: “Product name” destacado em vermelho e numerado 23",
      "hi": "Shopify एडमिन: “Product name” लाल बॉक्स में और नंबर 23 के साथ",
      "zh-CN": "Shopify 后台: “Product name”以红框标示并编号 23",
      "zh-TW": "Shopify 後台: 「Product name」以紅框標示並編號 23",
      "ja": "Shopify管理画面: 「Product name」が赤い枠と番号23で示されている"
    }
  },
  "barChip": {
    "src": "/guides/p10-barcodes-chip.png",
    "alt": {
      "en": "Shopify admin: “Barcodes” boxed in red and numbered 24",
      "fr": "Admin Shopify: « Barcodes » encadré en rouge et numéroté 24",
      "es": "Admin de Shopify: «Barcodes» enmarcado en rojo y numerado 24",
      "de": "Shopify-Admin: „Barcodes“ rot umrandet und mit 24 nummeriert",
      "pt-BR": "Admin da Shopify: “Barcodes” destacado em vermelho e numerado 24",
      "hi": "Shopify एडमिन: “Barcodes” लाल बॉक्स में और नंबर 24 के साथ",
      "zh-CN": "Shopify 后台: “Barcodes”以红框标示并编号 24",
      "zh-TW": "Shopify 後台: 「Barcodes」以紅框標示並編號 24",
      "ja": "Shopify管理画面: 「Barcodes」が赤い枠と番号24で示されている"
    }
  },
  "barField": {
    "src": "/guides/p10-barcode-field.png",
    "alt": {
      "en": "Shopify admin: “Barcode” boxed in red and numbered 25",
      "fr": "Admin Shopify: « Barcode » encadré en rouge et numéroté 25",
      "es": "Admin de Shopify: «Barcode» enmarcado en rojo y numerado 25",
      "de": "Shopify-Admin: „Barcode“ rot umrandet und mit 25 nummeriert",
      "pt-BR": "Admin da Shopify: “Barcode” destacado em vermelho e numerado 25",
      "hi": "Shopify एडमिन: “Barcode” लाल बॉक्स में और नंबर 25 के साथ",
      "zh-CN": "Shopify 后台: “Barcode”以红框标示并编号 25",
      "zh-TW": "Shopify 後台: 「Barcode」以紅框標示並編號 25",
      "ja": "Shopify管理画面: 「Barcode」が赤い枠と番号25で示されている"
    }
  },
  "barSave": {
    "src": "/guides/p10-save.png",
    "alt": {
      "en": "Shopify admin: “Save” boxed in red and numbered 26",
      "fr": "Admin Shopify: « Save » encadré en rouge et numéroté 26",
      "es": "Admin de Shopify: «Save» enmarcado en rojo y numerado 26",
      "de": "Shopify-Admin: „Save“ rot umrandet und mit 26 nummeriert",
      "pt-BR": "Admin da Shopify: “Save” destacado em vermelho e numerado 26",
      "hi": "Shopify एडमिन: “Save” लाल बॉक्स में और नंबर 26 के साथ",
      "zh-CN": "Shopify 后台: “Save”以红框标示并编号 26",
      "zh-TW": "Shopify 後台: 「Save」以紅框標示並編號 26",
      "ja": "Shopify管理画面: 「Save」が赤い枠と番号26で示されている"
    }
  },
  "scanCam": {
    "src": "/guides/p10-scan-cam.png",
    "alt": {
      "en": "Registry manage page on a phone: the open camera pointed at a barcode, boxed in red and numbered 27",
      "fr": "Page de gestion du registre sur téléphone: la caméra ouverte devant un code-barres, encadrée en rouge et numérotée 27",
      "es": "Página de gestión del registro en un teléfono: la cámara abierta apuntando a un código de barras, enmarcada en rojo y numerada 27",
      "de": "Verwaltungsseite der Liste auf dem Smartphone: die geöffnete Kamera auf einen Barcode gerichtet, rot umrandet und mit 27 nummeriert",
      "pt-BR": "Página de gerenciamento da lista no celular: a câmera aberta apontada para um código de barras, destacada em vermelho e numerada 27",
      "hi": "फ़ोन पर रजिस्ट्री का मैनेज पेज: बारकोड की ओर खुला कैमरा, लाल बॉक्स में और नंबर 27 के साथ",
      "zh-CN": "手机上的清单管理页面: 对准条形码的相机画面以红框标示并编号 27",
      "zh-TW": "手機上的清單管理頁面: 對準條碼的相機畫面以紅框標示並編號 27",
      "ja": "スマートフォンのリスト管理ページ: バーコードに向けたカメラ画面が赤い枠と番号27で示されている"
    }
  },
  "scanType": {
    "src": "/guides/p10-scan-type.png",
    "alt": {
      "en": "Registry manage page on a phone: “Barcode number” boxed in red and numbered 28; “Look up” boxed in red and numbered 29",
      "fr": "Page de gestion du registre sur téléphone: « Barcode number » encadré en rouge et numéroté 28; « Look up » encadré en rouge et numéroté 29",
      "es": "Página de gestión del registro en un teléfono: «Barcode number» enmarcado en rojo y numerado 28; «Look up» enmarcado en rojo y numerado 29",
      "de": "Verwaltungsseite der Liste auf dem Smartphone: „Barcode number“ rot umrandet und mit 28 nummeriert; „Look up“ rot umrandet und mit 29 nummeriert",
      "pt-BR": "Página de gerenciamento da lista no celular: “Barcode number” destacado em vermelho e numerado 28; “Look up” destacado em vermelho e numerado 29",
      "hi": "फ़ोन पर रजिस्ट्री का मैनेज पेज: “Barcode number” लाल बॉक्स में और नंबर 28 के साथ; “Look up” लाल बॉक्स में और नंबर 29 के साथ",
      "zh-CN": "手机上的清单管理页面: “Barcode number”以红框标示并编号 28; “Look up”以红框标示并编号 29",
      "zh-TW": "手機上的清單管理頁面: 「Barcode number」以紅框標示並編號 28; 「Look up」以紅框標示並編號 29",
      "ja": "スマートフォンのリスト管理ページ: 「Barcode number」が赤い枠と番号28で示されている; 「Look up」が赤い枠と番号29で示されている"
    }
  },
  "scanFound": {
    "src": "/guides/p10-scan-found.png",
    "alt": {
      "en": "Registry manage page on a phone: “On your list: add one more” boxed in red and numbered 30",
      "fr": "Page de gestion du registre sur téléphone: « On your list: add one more » encadré en rouge et numéroté 30",
      "es": "Página de gestión del registro en un teléfono: «On your list: add one more» enmarcado en rojo y numerado 30",
      "de": "Verwaltungsseite der Liste auf dem Smartphone: „On your list: add one more“ rot umrandet und mit 30 nummeriert",
      "pt-BR": "Página de gerenciamento da lista no celular: “On your list: add one more” destacado em vermelho e numerado 30",
      "hi": "फ़ोन पर रजिस्ट्री का मैनेज पेज: “On your list: add one more” लाल बॉक्स में और नंबर 30 के साथ",
      "zh-CN": "手机上的清单管理页面: “On your list: add one more”以红框标示并编号 30",
      "zh-TW": "手機上的清單管理頁面: 「On your list: add one more」以紅框標示並編號 30",
      "ja": "スマートフォンのリスト管理ページ: 「On your list: add one more」が赤い枠と番号30で示されている"
    }
  },
  "scanDone": {
    "src": "/guides/p10-scan-done.png",
    "alt": {
      "en": "Registry manage page on a phone: “Done scanning” boxed in red and numbered 31",
      "fr": "Page de gestion du registre sur téléphone: « Done scanning » encadré en rouge et numéroté 31",
      "es": "Página de gestión del registro en un teléfono: «Done scanning» enmarcado en rojo y numerado 31",
      "de": "Verwaltungsseite der Liste auf dem Smartphone: „Done scanning“ rot umrandet und mit 31 nummeriert",
      "pt-BR": "Página de gerenciamento da lista no celular: “Done scanning” destacado em vermelho e numerado 31",
      "hi": "फ़ोन पर रजिस्ट्री का मैनेज पेज: “Done scanning” लाल बॉक्स में और नंबर 31 के साथ",
      "zh-CN": "手机上的清单管理页面: “Done scanning”以红框标示并编号 31",
      "zh-TW": "手機上的清單管理頁面: 「Done scanning」以紅框標示並編號 31",
      "ja": "スマートフォンのリスト管理ページ: 「Done scanning」が赤い枠と番号31で示されている"
    }
  },
  "prefsBar": {
    "src": "/guides/r2-prefs-bar.png",
    "alt": {
      "en": "Registry manage page: “Edit registry & preferences” boxed in red and numbered 1",
      "fr": "Page de gestion du registre: « Edit registry & preferences » encadré en rouge et numéroté 1",
      "es": "Página de gestión del registro: «Edit registry & preferences» enmarcado en rojo y numerado 1",
      "de": "Verwaltungsseite der Liste: „Edit registry & preferences“ rot umrandet und mit 1 nummeriert",
      "pt-BR": "Página de gerenciamento da lista: “Edit registry & preferences” destacado em vermelho e numerado 1",
      "hi": "रजिस्ट्री का मैनेज पेज: “Edit registry & preferences” लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "清单管理页面: “Edit registry & preferences”以红框标示并编号 1",
      "zh-TW": "清單管理頁面: 「Edit registry & preferences」以紅框標示並編號 1",
      "ja": "リスト管理ページ: 「Edit registry & preferences」が赤い枠と番号1で示されている"
    }
  },
  "partnerForm": {
    "src": "/guides/r2-partner-form.png",
    "alt": {
      "en": "Registry manage page: “Add partner” boxed in red and numbered 2",
      "fr": "Page de gestion du registre: « Add partner » encadré en rouge et numéroté 2",
      "es": "Página de gestión del registro: «Add partner» enmarcado en rojo y numerado 2",
      "de": "Verwaltungsseite der Liste: „Add partner“ rot umrandet und mit 2 nummeriert",
      "pt-BR": "Página de gerenciamento da lista: “Add partner” destacado em vermelho e numerado 2",
      "hi": "रजिस्ट्री का मैनेज पेज: “Add partner” लाल बॉक्स में और नंबर 2 के साथ",
      "zh-CN": "清单管理页面: “Add partner”以红框标示并编号 2",
      "zh-TW": "清單管理頁面: 「Add partner」以紅框標示並編號 2",
      "ja": "リスト管理ページ: 「Add partner」が赤い枠と番号2で示されている"
    }
  },
  "partnerRemove": {
    "src": "/guides/r2-partner-remove.png",
    "alt": {
      "en": "Registry manage page: “Remove partner” boxed in red and numbered 3",
      "fr": "Page de gestion du registre: « Remove partner » encadré en rouge et numéroté 3",
      "es": "Página de gestión del registro: «Remove partner» enmarcado en rojo y numerado 3",
      "de": "Verwaltungsseite der Liste: „Remove partner“ rot umrandet und mit 3 nummeriert",
      "pt-BR": "Página de gerenciamento da lista: “Remove partner” destacado em vermelho e numerado 3",
      "hi": "रजिस्ट्री का मैनेज पेज: “Remove partner” लाल बॉक्स में और नंबर 3 के साथ",
      "zh-CN": "清单管理页面: “Remove partner”以红框标示并编号 3",
      "zh-TW": "清單管理頁面: 「Remove partner」以紅框標示並編號 3",
      "ja": "リスト管理ページ: 「Remove partner」が赤い枠と番号3で示されている"
    }
  },
  "manageShipSaved": {
    "src": "/guides/m6-manage-ship-saved.png",
    "alt": {
      "en": "The top of the shipping form, with the green message “Your shipping address is saved.” boxed in red",
      "fr": "Le haut du formulaire d'expédition, avec le message vert « Your shipping address is saved. » encadré en rouge",
      "es": "La parte superior del formulario de envío, con el mensaje verde «Your shipping address is saved.» enmarcado en rojo",
      "de": "Der obere Teil des Versandformulars, mit der grünen Meldung „Your shipping address is saved.“ rot umrandet",
      "pt-BR": "A parte de cima do formulário de envio, com a mensagem verde “Your shipping address is saved.” destacada em vermelho",
      "hi": "शिपिंग फ़ॉर्म का ऊपरी हिस्सा, हरा संदेश “Your shipping address is saved.” लाल बॉक्स में",
      "zh-CN": "配送表单顶部，绿色提示“Your shipping address is saved.”以红框标示",
      "zh-TW": "配送表單頂部，綠色提示「Your shipping address is saved.」以紅框標示",
      "ja": "配送フォームの上部。緑のメッセージ「Your shipping address is saved.」が赤い枠で示されている"
    }
  },
  "manageSettingsSaved": {
    "src": "/guides/r3-settings-saved.png",
    "alt": {
      "en": "The top of the manage page, under the registry name, with the green message “Your changes are saved.” boxed in red",
      "fr": "Le haut de la page de gestion, sous le nom du registre, avec le message vert « Your changes are saved. » encadré en rouge",
      "es": "La parte superior de la página de gestión, bajo el nombre del registro, con el mensaje verde «Your changes are saved.» enmarcado en rojo",
      "de": "Der obere Teil der Verwaltungsseite, unter dem Namen der Liste, mit der grünen Meldung „Your changes are saved.“ rot umrandet",
      "pt-BR": "A parte de cima da página de gerenciamento, abaixo do nome da lista, com a mensagem verde “Your changes are saved.” destacada em vermelho",
      "hi": "मैनेज पेज का ऊपरी हिस्सा, रजिस्ट्री के नाम के नीचे, हरा संदेश “Your changes are saved.” लाल बॉक्स में",
      "zh-CN": "管理页面顶部、清单名称下方，绿色提示“Your changes are saved.”以红框标示",
      "zh-TW": "管理頁面頂部、清單名稱下方，綠色提示「Your changes are saved.」以紅框標示",
      "ja": "管理ページの上部、リスト名の下。緑のメッセージ「Your changes are saved.」が赤い枠で示されている"
    }
  },
  "findResults": {
    "src": "/guides/g1-find-results.png",
    "alt": {
      "en": "The search results, with the registry's name link boxed in red and numbered 3",
      "fr": "Les résultats de recherche, avec le lien du nom de la liste encadré en rouge et numéroté 3",
      "es": "Los resultados de búsqueda, con el enlace del nombre del registro enmarcado en rojo y numerado 3",
      "de": "Die Suchergebnisse, mit dem Namenslink der Liste rot umrandet und mit 3 nummeriert",
      "pt-BR": "Os resultados da busca, com o link do nome da lista destacado em vermelho e numerado 3",
      "hi": "खोज के नतीजे, रजिस्ट्री के नाम का लिंक लाल बॉक्स में और नंबर 3 के साथ",
      "zh-CN": "搜索结果，清单名称链接以红框标示并编号 3",
      "zh-TW": "搜尋結果，清單名稱連結以紅框標示並編號 3",
      "ja": "検索結果。リスト名のリンクが赤い枠と番号3で示されている"
    }
  },
  "sortFilter": {
    "src": "/guides/g2-sort-filter.png",
    "alt": {
      "en": "A registry's list tools: the Sort menu open and boxed in red and numbered 1, and the Only show what's still needed tick box boxed and numbered 2",
      "fr": "Les outils de la liste : le menu Trier ouvert, encadré en rouge et numéroté 1, et la case Afficher seulement ce qui reste à offrir encadrée et numérotée 2",
      "es": "Las herramientas de la lista: el menú Ordenar abierto, enmarcado en rojo y numerado 1, y la casilla Mostrar solo lo que aún falta enmarcada y numerada 2",
      "de": "Die Listenwerkzeuge: das geöffnete Menü Sortieren, rot umrandet und mit 1 nummeriert, und das Kästchen Nur noch Benötigtes anzeigen, umrandet und mit 2 nummeriert",
      "pt-BR": "As ferramentas da lista: o menu Ordenar aberto, destacado em vermelho e numerado 1, e a caixa Mostrar só o que ainda falta destacada e numerada 2",
      "hi": "सूची के टूल: खुला हुआ क्रम चुनें मेनू लाल बॉक्स में और नंबर 1 के साथ, और केवल वही दिखाएँ जो अभी चाहिए वाला टिक बॉक्स नंबर 2 के साथ",
      "zh-CN": "清单工具：展开的“排序”菜单以红框标示并编号 1，“只显示仍需要的”勾选框以红框标示并编号 2",
      "zh-TW": "清單工具：展開的「排序」選單以紅框標示並編號 1，「只顯示仍需要的」核取方塊以紅框標示並編號 2",
      "ja": "リストのツール。開いた「並べ替え」メニューが赤い枠と番号1、「まだ必要なものだけ表示」のチェックボックスが赤い枠と番号2で示されている"
    }
  },
  "takenCare": {
    "src": "/guides/g3-taken-care-of.png",
    "alt": {
      "en": "A gift that's been taken care of, with the label “Already taken care of” boxed in red and the Undo link boxed and numbered 3",
      "fr": "Un cadeau déjà pris en charge, avec l'étiquette « Already taken care of » encadrée en rouge et le lien Annuler encadré et numéroté 3",
      "es": "Un regalo ya resuelto, con la etiqueta «Already taken care of» enmarcada en rojo y el enlace Deshacer enmarcado y numerado 3",
      "de": "Ein bereits erledigtes Geschenk, mit der Markierung „Already taken care of“ rot umrandet und dem Link Rückgängig umrandet und mit 3 nummeriert",
      "pt-BR": "Um presente já resolvido, com o rótulo “Already taken care of” destacado em vermelho e o link Desfazer destacado e numerado 3",
      "hi": "पहले से तय उपहार, “Already taken care of” लेबल लाल बॉक्स में और पूर्ववत करें लिंक बॉक्स में नंबर 3 के साथ",
      "zh-CN": "一件已被安排好的礼物，“Already taken care of”标签以红框标示，“撤销”链接以红框标示并编号 3",
      "zh-TW": "一件已被安排好的禮物，「Already taken care of」標籤以紅框標示，「復原」連結以紅框標示並編號 3",
      "ja": "手配済みのギフト。「Already taken care of」のラベルが赤い枠で、「元に戻す」リンクが赤い枠と番号3で示されている"
    }
  },
  "shipSetup": {
    "src": "/guides/r4-ship-setup.png",
    "alt": {
      "en": "First-time setup, step 1 of 2, Where should gifts go?, with the tick box to let guests ship gifts straight to you boxed in red and numbered 1",
      "fr": "Configuration initiale, étape 1 sur 2, Où les cadeaux doivent-ils aller ?, avec la case permettant aux invités de vous expédier les cadeaux directement encadrée en rouge et numérotée 1",
      "es": "Configuración inicial, paso 1 de 2, ¿Adónde deben ir los regalos?, con la casilla para que los invitados envíen los regalos directamente a ti enmarcada en rojo y numerada 1",
      "de": "Ersteinrichtung, Schritt 1 von 2, Wohin sollen die Geschenke?, mit dem Kästchen, das Gästen den direkten Versand an Sie erlaubt, rot umrandet und mit 1 nummeriert",
      "pt-BR": "Configuração inicial, etapa 1 de 2, Para onde os presentes devem ir?, com a caixa que permite aos convidados enviar presentes direto para você destacada em vermelho e numerada 1",
      "hi": "पहली बार की सेटअप, चरण 1/2, उपहार कहाँ जाएँ?, मेहमानों को सीधे आपको उपहार भेजने देने वाला टिक बॉक्स लाल बॉक्स में और नंबर 1 के साथ",
      "zh-CN": "首次设置第 1 步（共 2 步），礼物寄到哪里？，允许宾客直接把礼物寄给你的勾选框以红框标示并编号 1",
      "zh-TW": "首次設定第 1 步（共 2 步），禮物要寄到哪裡？，允許賓客直接把禮物寄給你的核取方塊以紅框標示並編號 1",
      "ja": "初回設定のステップ1/2「ギフトの届け先」。ゲストが直接あなたにギフトを発送できるチェックボックスが赤い枠と番号1で示されている"
    }
  },
  "giftCardPage": {
    "src": "/guides/g5-gift-card-page.png",
    "alt": {
      "en": "The store's gift card page: an amount boxed in red and numbered 1, the Email it straight to someone tick box numbered 2, the recipient's email and name boxes numbered 3 and 4, and Add to cart numbered 5",
      "fr": "La page de carte cadeau de la boutique : un montant encadré en rouge et numéroté 1, la case Envoyer par e-mail directement à quelqu'un numérotée 2, les champs e-mail et nom du destinataire numérotés 3 et 4, et Ajouter au panier numéroté 5",
      "es": "La página de tarjeta de regalo de la tienda: un importe enmarcado en rojo y numerado 1, la casilla Enviarla por email directamente a alguien numerada 2, los cuadros de email y nombre del destinatario numerados 3 y 4, y Añadir al carrito numerado 5",
      "de": "Die Geschenkkartenseite des Shops: ein Betrag rot umrandet und mit 1 nummeriert, das Kästchen Direkt per E-Mail an jemanden senden mit 2, die Felder für E-Mail und Name des Empfängers mit 3 und 4 und In den Warenkorb mit 5",
      "pt-BR": "A página de vale-presente da loja: um valor destacado em vermelho e numerado 1, a caixa Enviar por e-mail direto para alguém numerada 2, os campos de e-mail e nome do destinatário numerados 3 e 4, e Adicionar ao carrinho numerado 5",
      "hi": "स्टोर का गिफ़्ट कार्ड पेज: एक राशि लाल बॉक्स में और नंबर 1 के साथ, किसी को सीधे ईमेल करें टिक बॉक्स नंबर 2, प्राप्तकर्ता के ईमेल और नाम के बॉक्स नंबर 3 और 4, और कार्ट में जोड़ें नंबर 5",
      "zh-CN": "商店的礼品卡页面：一个金额以红框标示并编号 1，“直接通过邮件发给某人”勾选框编号 2，收件人邮箱和姓名输入框编号 3 和 4，“加入购物车”编号 5",
      "zh-TW": "商店的禮品卡頁面：一個金額以紅框標示並編號 1，「直接以電子郵件寄給某人」核取方塊編號 2，收件人電子郵件與姓名欄位編號 3 和 4，「加入購物車」編號 5",
      "ja": "ストアのギフトカードページ。金額が赤い枠と番号1、「直接メールで送る」のチェックボックスが番号2、受取人のメールアドレスと名前の欄が番号3と4、「カートに追加」が番号5で示されている"
    }
  },
  "shareRow": {
    "src": "/guides/g6-share-row.png",
    "alt": {
      "en": "The Share row at the top of a registry, with the Share button boxed in red and numbered 1, beside the WhatsApp, Text and Email buttons",
      "fr": "La rangée Partager en haut d'une liste, avec le bouton Partager encadré en rouge et numéroté 1, à côté des boutons WhatsApp, SMS et E-mail",
      "es": "La fila Compartir en la parte superior de un registro, con el botón Compartir enmarcado en rojo y numerado 1, junto a los botones WhatsApp, Mensaje y Correo",
      "de": "Die Zeile Teilen oben auf einer Liste, mit dem Button Teilen rot umrandet und mit 1 nummeriert, neben den Buttons WhatsApp, SMS und E-Mail",
      "pt-BR": "A linha Compartilhar no topo de uma lista, com o botão Compartilhar destacado em vermelho e numerado 1, ao lado dos botões WhatsApp, Mensagem e E-mail",
      "hi": "रजिस्ट्री के ऊपर शेयर की पंक्ति, शेयर बटन लाल बॉक्स में और नंबर 1 के साथ, WhatsApp, टेक्स्ट और ईमेल बटनों के बगल में",
      "zh-CN": "清单顶部的分享行，“分享”按钮以红框标示并编号 1，旁边是 WhatsApp、短信和邮件按钮",
      "zh-TW": "清單頂部的分享列，「分享」按鈕以紅框標示並編號 1，旁邊是 WhatsApp、簡訊和電子郵件按鈕",
      "ja": "リスト上部の共有の列。「共有」ボタンが赤い枠と番号1で示され、隣にWhatsApp、テキスト、メールのボタンが並んでいる"
    }
  }
};
