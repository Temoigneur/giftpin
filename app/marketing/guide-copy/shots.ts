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
  },
  "overviewTheme": {
    "src": "/guides/m3-overview-theme.png",
    "alt": {
      "en": "The Add Giftpin to your theme card on the Overview page, with the Add button to product pages, Add registry links and Add heart to product pages buttons boxed in red",
      "fr": "La carte Ajouter Giftpin à votre thème sur la page Aperçu, avec les boutons pour les pages produit, les liens de liste et le cœur encadrés en rouge",
      "es": "La tarjeta Añadir Giftpin a tu tema en la página de Resumen, con los botones de producto, enlaces de lista y corazón enmarcados en rojo",
      "de": "Die Karte „Giftpin zu Ihrem Theme hinzufügen“ auf der Übersicht, die Buttons für Produktseiten, Listen-Links und Herz sind rot umrandet",
      "pt-BR": "O cartão Adicionar o Giftpin ao seu tema na página Visão geral, com os botões de página de produto, links de lista e coração destacados em vermelho",
      "hi": "ओवरव्यू पेज पर Giftpin को अपनी थीम में जोड़ें कार्ड, प्रोडक्ट पेज बटन, रजिस्ट्री लिंक और हार्ट बटन लाल बॉक्स में",
      "zh-CN": "“概览”页面上的“将 Giftpin 添加到主题”卡片，商品页按钮、清单链接和爱心按钮用红框标出",
      "zh-TW": "「總覽」頁面上的「將 Giftpin 加入佈景主題」卡片，商品頁按鈕、清單連結和愛心按鈕以紅框標示",
      "ja": "概要ページの「テーマにGiftpinを追加」カード。商品ページ用ボタン、リストのリンク、ハートのボタンが赤い枠で示されている"
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
  }
};
