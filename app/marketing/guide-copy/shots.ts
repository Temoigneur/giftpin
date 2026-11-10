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
  }
};
