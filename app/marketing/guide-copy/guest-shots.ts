import type { Locale } from "../../shared/i18n";

/** The one real screenshot used in the guest guide: public/guides/r10-guest-view.png (a guest's view of a registry). */
export const GUEST_SHOT_SRC = "/guides/r10-guest-view.png";
export const GUEST_SHOT_ALT: Record<Locale, string> = {
  "en": "A guest's view of a registry: a store item with Add to cart, a gift already taken care of with Undo, and an item from another store with Buy at and I bought this",
  "fr": "Ce que voit un invité : un article du magasin avec Ajouter au panier, un cadeau déjà pris en charge avec Annuler, et un article d'un autre magasin avec les boutons d'achat et J'ai acheté ceci",
  "es": "Lo que ve un invitado: un artículo de la tienda con Añadir al carrito, un regalo ya cubierto con Deshacer y un artículo de otra tienda con los botones de compra y Lo compré",
  "de": "Die Sicht eines Gasts: ein Artikel des Shops mit In den Warenkorb, ein bereits erledigtes Geschenk mit Rückgängig und ein Artikel eines anderen Shops mit Kaufen- und Gekauft-Button",
  "pt-BR": "O que um convidado vê: um item da loja com Adicionar ao carrinho, um presente já resolvido com Desfazer e um item de outra loja com os botões de compra e Eu comprei",
  "hi": "मेहमान को रजिस्ट्री ऐसी दिखती है: कार्ट में जोड़ें वाला स्टोर का आइटम, पहले से हो चुका गिफ्ट (पूर्ववत करें के साथ) और दूसरे स्टोर का आइटम खरीदने और मैंने खरीद लिया बटन के साथ",
  "zh-CN": "访客看到的礼品清单：带“加入购物车”的商店商品、已被认领并可撤销的礼物，以及带购买按钮和“我已购买”的其他商店商品",
  "zh-TW": "訪客看到的禮物清單：附「加入購物車」的商店商品、已有人處理且可復原的禮物，以及附購買按鈕與「我已購買」的其他商店商品",
  "ja": "ゲストから見たギフトリスト。カートに入れるボタン付きのストア商品、取り消し付きで対応済みのギフト、購入ボタンと「購入しました」付きの他店の商品"
};
