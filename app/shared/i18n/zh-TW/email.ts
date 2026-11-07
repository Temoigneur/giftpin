import type { enEmail } from "../en/email";

export const zhTWEmail: { [K in keyof typeof enEmail]: string } = {
  // Magic link to a registry
  "email.link.subject.registry": "您的禮物清單：{title}",
  "email.link.subject.wishlist": "您的願望清單：{title}",
  "email.link.text.registry": "開啟您的禮物清單：{url}\n\n這個連結 90 天內有效。任何拿到連結的人都可以編輯您的禮物清單，請妥善保管。",
  "email.link.text.wishlist": "開啟您的願望清單：{url}\n\n這個連結 90 天內有效。任何拿到連結的人都可以編輯您的願望清單，請妥善保管。",
  "email.link.heading.registry": "這是您的禮物清單",
  "email.link.heading.wishlist": "這是您的願望清單",
  "email.link.useHtml": "想新增商品或查看誰買了什麼時，隨時可以使用這個連結。",
  "email.link.noteHtml.registry": "這個連結 90 天內有效，任何拿到連結的人都可以編輯您的禮物清單，請妥善保管。您寄給賓客的<em>分享</em>連結則不同，只能檢視。",
  "email.link.noteHtml.wishlist": "這個連結 90 天內有效，任何拿到連結的人都可以編輯您的願望清單，請妥善保管。您寄給賓客的<em>分享</em>連結則不同，只能檢視。",
  "email.link.cta.registry": "開啟我的禮物清單",
  "email.link.cta.wishlist": "開啟我的願望清單",

  // My registries
  "email.account.defaultShop": "商店",
  "email.account.subject": "您在 {shop} 的禮物清單",
  "email.account.text": "查看您在 {shop} 的所有禮物清單：{url}",
  "email.account.textNote": "這個連結 90 天內有效。任何拿到連結的人都可以編輯這些清單，請妥善保管。",
  "email.account.heading": "您的禮物清單",
  "email.account.introHtml": "這個連結可以看到您用此電子郵件在 {shop} 建立的所有清單：",
  "email.account.noteHtml": "這個連結 90 天內有效，任何拿到連結的人都可以編輯這些清單，請妥善保管。您之後用此電子郵件建立的清單也會出現在那裡。",
  "email.account.cta": "查看我的清單",

  // Partner added
  "email.partner.subject.named": "{name} 已將您加入「{title}」禮物清單",
  "email.partner.subject.unnamed": "您已被加入「{title}」禮物清單",
  "email.partner.heading.named": "{name} 已將您加入一份禮物清單",
  "email.partner.heading.unnamed": "您已被加入一份禮物清單",
  "email.partner.lead.named": "{name} 已將您加入 {shop} 的「{title}」禮物清單。",
  "email.partner.lead.unnamed": "您已被加入 {shop} 的「{title}」禮物清單。",
  "email.partner.then": "您可以新增禮物，也可以查看誰買了什麼。",
  "email.partner.open": "開啟清單：{url}",
  "email.partner.textNote": "這個連結 90 天內有效。任何拿到連結的人都可以編輯這份清單，請妥善保管。若連結過期，請用這個電子郵件地址到商店的禮物清單頁面索取新連結。",
  "email.partner.noteHtml": "這個連結 90 天內有效，任何拿到連結的人都可以編輯這份清單，請妥善保管。若連結過期，請用這個電子郵件地址到商店的禮物清單頁面索取新連結。",
  "email.partner.cta": "開啟清單",

  // Buyer line, shared by the gift emails
  "email.buyer.hidden": "活動結束後，我們會告訴您是誰送的。",
  "email.buyer.named": "來自 {name}。",
  "email.buyer.anonymous": "購買者選擇不透露姓名。",
  "email.buyer.anonymousContribution": "對方選擇不透露姓名。",

  // Someone bought a gift
  "email.purchased.subject": "有人購買了{item}",
  "email.purchased.text.registry": "{buyer}\n\n{item} — {desired} 件中的 {qty} 件\n\n查看您的禮物清單：{url}",
  "email.purchased.text.wishlist": "{buyer}\n\n{item} — {desired} 件中的 {qty} 件\n\n查看您的願望清單：{url}",
  "email.purchased.heading": "您收到一份禮物",
  "email.purchased.cta.registry": "查看我的禮物清單",
  "email.purchased.cta.wishlist": "查看我的願望清單",

  // Someone chipped in
  "email.contribution.moneyFallback": "一張禮品卡",
  "email.contribution.subject": "有人為{item}集資贊助",
  "email.contribution.text.registry": "{money}，贊助{item}。\n\n{buyer}\n\n{where}\n\n查看您的禮物清單：{url}",
  "email.contribution.text.wishlist": "{money}，贊助{item}。\n\n{buyer}\n\n{where}\n\n查看您的願望清單：{url}",
  "email.contribution.heading": "有人集資贊助",
  "email.contribution.leadHtml": "{money}，贊助{item}。",
  "email.contribution.where.toRegistrant": "禮品卡本身會由商店另外寄一封電子郵件，通常是寄到這個地址。如果您的賓客使用 Shop Pay 付款，禮品卡會寄給他們，他們可以再轉送給您。",
  "email.contribution.where.toGuest": "禮品卡已寄到您賓客的信箱，他們可以再轉送給您。",
  "email.contribution.cta.registry": "查看我的禮物清單",
  "email.contribution.cta.wishlist": "查看我的願望清單",

  // Guest clicked through to another retailer
  "email.followup.subject": "您買了{item}嗎？",
  "email.followup.text": "您前往 {domain} 查看「{item}」。請告訴我們結果，避免有人重複購買：\n\n是的，我買了：{confirmUrl}\n不，我沒買：{releaseUrl}",
  "email.followup.heading": "您最後有購買嗎？",
  "email.followup.bodyHtml": "您前往 {domain} 查看{item}。我們已在清單上為您預訂，避免有人重複購買，但只能再保留一小段時間。",
  "email.followup.cta": "是的，我買了",
  "email.followup.release": "不，我沒買，請放回清單",

  // Registrant, before the event
  "email.eventReminder.subject_one": "{title}：還有 {n} 件商品尚未被預訂",
  "email.eventReminder.subject_other": "{title}：還有 {n} 件商品尚未被預訂",
  "email.eventReminder.text_one": "您的活動即將到來，還有 {n} 件商品尚未被購買。\n\n{url}",
  "email.eventReminder.text_other": "您的活動即將到來，還有 {n} 件商品尚未被購買。\n\n{url}",
  "email.eventReminder.heading": "您的活動即將到來",
  "email.eventReminder.bodyHtml_one": "您的禮物清單上還有 {n} 件商品尚未被購買。現在很適合再次分享連結，或是移除您已改變心意的商品。",
  "email.eventReminder.bodyHtml_other": "您的禮物清單上還有 {n} 件商品尚未被購買。現在很適合再次分享連結，或是移除您已改變心意的商品。",
  "email.eventReminder.cta": "開啟我的禮物清單",

  // Guest who asked to be reminded
  "email.when.today": "今天",
  "email.when.tomorrow": "明天",
  "email.when.twoWeeks": "兩週後",
  "email.when.days_one": "{n} 天後",
  "email.when.days_other": "{n} 天後",
  "email.guestReminder.subject": "{title}就在{when}",
  "email.guestReminder.introHtml": "您請我們在大日子之前提醒您。",
  "email.guestReminder.left_one": "清單上還有 {n} 份禮物。",
  "email.guestReminder.left_other": "清單上還有 {n} 份禮物。",
  "email.guestReminder.none": "清單上的每一份禮物都已經有人處理了。",
  "email.guestReminder.leftHtml_one": "清單上還有 {n} 份禮物，您還有時間挑選。",
  "email.guestReminder.leftHtml_other": "清單上還有 {n} 份禮物，您還有時間挑選。",
  "email.guestReminder.noneHtml": "清單上的每一份禮物都已經有人處理了，不過清單仍然在，歡迎您看看。",
  "email.guestReminder.text": "{title}就在{when}。{left}\n\n查看禮物清單：{url}\n\n您請 {shop} 提醒您。停止接收這些郵件：{unsubscribe}",
  "email.guestReminder.cta": "查看禮物清單",
  "email.guestReminder.footerHtml": "您會收到這封郵件，是因為您請 {shop} 提醒您這份禮物清單。{link}",
  "email.guestReminder.stop": "停止接收這些郵件",

  // Registrant: most of the list is bought
  "email.mostGone.subject": "「{title}」的 {total} 份禮物中，已有 {fulfilled} 份處理完成",
  "email.mostGone.text.registry": "您的禮物清單大部分都已被購買：{total} 份禮物中已有 {fulfilled} 份。若您再多新增一些商品，還沒挑選的賓客就有更多選擇。\n\n開啟您的禮物清單：{url}",
  "email.mostGone.text.wishlist": "您的願望清單大部分都已被購買：{total} 份禮物中已有 {fulfilled} 份。若您再多新增一些商品，還沒挑選的賓客就有更多選擇。\n\n開啟您的願望清單：{url}",
  "email.mostGone.heading.registry": "您的禮物清單快被買光了",
  "email.mostGone.heading.wishlist": "您的願望清單快被買光了",
  "email.mostGone.countHtml.registry": "您禮物清單上的 {total} 份禮物中，<strong>已有 {fulfilled} 份</strong>處理完成。",
  "email.mostGone.countHtml.wishlist": "您願望清單上的 {total} 份禮物中，<strong>已有 {fulfilled} 份</strong>處理完成。",
  "email.mostGone.moreHtml": "現在多新增一些商品，還沒挑選的賓客就有更多選擇。",
  "email.mostGone.cta": "新增更多商品",

  // Registrant, after the event
  "email.thankYou.subject": "該寫感謝函了",
  "email.thankYou.text": "以下是誰送了什麼，讓您輕鬆寫感謝函：\n\n{list}{more}\n\n下載完整名單：{csvUrl}\n開啟您的禮物清單：{url}",
  "email.thankYou.more": "……完整名單中還有 {n} 筆。",
  "email.thankYou.introHtml": "以下是「{title}」中誰送了什麼，讓您輕鬆寫感謝函。",
  "email.thankYou.open": "開啟我的禮物清單",
  "email.thankYou.cta": "下載完整名單",

  "email.discount.subject": "「{title}」剩餘商品享 {percent}% 折扣",
  "email.discount.text": "感謝您與 {shop} 一起建立「{title}」。您清單上仍有 {shop} 的商品{items}，使用代碼 {code} 即可享 {percent}% 折扣。限用一次，有效期限至 {ends}。\n\n查看剩餘商品：{url}",
  "email.discount.items_one": "（{n} 件）",
  "email.discount.items_other": "（{n} 件）",
  "email.discount.heading": "清單上剩餘商品享 {percent}% 折扣",
  "email.discount.introHtml": "感謝您與 {shop} 一起建立「{title}」。針對您清單上仍有的 {shop} 商品，我們準備了一份謝禮。",
  "email.discount.noteHtml": "享 {percent}% 折扣，限用一次，有效期限至 {ends}。請在結帳時輸入。",
  "email.discount.cta": "查看剩餘商品",
};
