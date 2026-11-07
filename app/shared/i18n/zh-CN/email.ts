import type { enEmail } from "../en/email";

export const zhCNEmail: { [K in keyof typeof enEmail]: string } = {
  // Magic link to a registry
  "email.link.subject.registry": "您的礼物清单：{title}",
  "email.link.subject.wishlist": "您的心愿单：{title}",
  "email.link.text.registry": "打开您的礼物清单：{url}\n\n此链接 90 天内有效。任何拿到链接的人都可以编辑您的礼物清单，请妥善保管。",
  "email.link.text.wishlist": "打开您的心愿单：{url}\n\n此链接 90 天内有效。任何拿到链接的人都可以编辑您的心愿单，请妥善保管。",
  "email.link.heading.registry": "这是您的礼物清单",
  "email.link.heading.wishlist": "这是您的心愿单",
  "email.link.useHtml": "想添加商品或查看哪些已被购买时，随时使用此链接。",
  "email.link.noteHtml.registry": "此链接 90 天内有效，任何拿到链接的人都可以编辑您的礼物清单，请妥善保管。您发给宾客的<em>分享</em>链接与此不同，只能查看。",
  "email.link.noteHtml.wishlist": "此链接 90 天内有效，任何拿到链接的人都可以编辑您的心愿单，请妥善保管。您发给宾客的<em>分享</em>链接与此不同，只能查看。",
  "email.link.cta.registry": "打开我的礼物清单",
  "email.link.cta.wishlist": "打开我的心愿单",

  // My registries
  "email.account.defaultShop": "本店",
  "email.account.subject": "您在 {shop} 的礼物清单",
  "email.account.text": "查看您在 {shop} 的所有礼物清单：{url}",
  "email.account.textNote": "此链接 90 天内有效。任何拿到链接的人都可以编辑这些清单，请妥善保管。",
  "email.account.heading": "您的礼物清单",
  "email.account.introHtml": "这是一个链接，包含您使用此邮箱在 {shop} 创建的所有清单：",
  "email.account.noteHtml": "此链接 90 天内有效，任何拿到链接的人都可以编辑这些清单，请妥善保管。您之后用此邮箱创建的清单也会显示在其中。",
  "email.account.cta": "查看我的清单",

  // Partner added
  "email.partner.subject.named": "{name} 已将您添加到礼物清单「{title}」",
  "email.partner.subject.unnamed": "您已被添加到礼物清单「{title}」",
  "email.partner.heading.named": "{name} 已将您添加到一份礼物清单",
  "email.partner.heading.unnamed": "您已被添加到一份礼物清单",
  "email.partner.lead.named": "{name} 已将您添加到 {shop} 的礼物清单「{title}」。",
  "email.partner.lead.unnamed": "您已被添加到 {shop} 的礼物清单「{title}」。",
  "email.partner.then": "您可以添加礼物，并查看哪些已被购买。",
  "email.partner.open": "打开清单：{url}",
  "email.partner.textNote": "此链接 90 天内有效。任何拿到链接的人都可以编辑这份清单，请妥善保管。如果链接过期，请使用此邮箱地址在店铺的清单页面重新获取。",
  "email.partner.noteHtml": "此链接 90 天内有效，任何拿到链接的人都可以编辑这份清单，请妥善保管。如果链接过期，请使用此邮箱地址在店铺的清单页面重新获取。",
  "email.partner.cta": "打开清单",

  // Buyer line, shared by the gift emails
  "email.buyer.hidden": "活动结束后，我们会告诉您是谁送的。",
  "email.buyer.named": "来自 {name}。",
  "email.buyer.anonymous": "购买者选择不透露姓名。",
  "email.buyer.anonymousContribution": "对方选择不透露姓名。",

  // Someone bought a gift
  "email.purchased.subject": "有人购买了 {item}",
  "email.purchased.text.registry": "{buyer}\n\n{item} — {desired} 件中的 {qty} 件\n\n查看您的礼物清单：{url}",
  "email.purchased.text.wishlist": "{buyer}\n\n{item} — {desired} 件中的 {qty} 件\n\n查看您的心愿单：{url}",
  "email.purchased.heading": "您收到了一份礼物",
  "email.purchased.cta.registry": "查看我的礼物清单",
  "email.purchased.cta.wishlist": "查看我的心愿单",

  // Someone chipped in
  "email.contribution.moneyFallback": "一张礼品卡",
  "email.contribution.subject": "有人为 {item} 凑了份子",
  "email.contribution.text.registry": "{money}，用于 {item}。\n\n{buyer}\n\n{where}\n\n查看您的礼物清单：{url}",
  "email.contribution.text.wishlist": "{money}，用于 {item}。\n\n{buyer}\n\n{where}\n\n查看您的心愿单：{url}",
  "email.contribution.heading": "有人凑了份子",
  "email.contribution.leadHtml": "{money}，用于 {item}。",
  "email.contribution.where.toRegistrant": "礼品卡本身会由店铺另行发送邮件，通常发到此邮箱。如果您的宾客使用 Shop Pay 付款，礼品卡会发给对方，由对方转交给您。",
  "email.contribution.where.toGuest": "礼品卡已发送到您宾客的邮箱，由对方转交给您。",
  "email.contribution.cta.registry": "查看我的礼物清单",
  "email.contribution.cta.wishlist": "查看我的心愿单",

  // Guest clicked through to another retailer
  "email.followup.subject": "您买了 {item} 吗？",
  "email.followup.text": "您前往 {domain} 查看了“{item}”。请告诉我们结果，避免重复购买：\n\n是的，我买了：{confirmUrl}\n没有，我没买：{releaseUrl}",
  "email.followup.heading": "您最后买了吗？",
  "email.followup.bodyHtml": "您前往 {domain} 查看了 {item}。我们已在清单上为它保留，避免重复购买，但保留时间不会太久。",
  "email.followup.cta": "是的，我买了",
  "email.followup.release": "没有，我没买，请放回清单",

  // Registrant, before the event
  "email.eventReminder.subject_one": "{title} — 还有 {n} 件商品无人预订",
  "email.eventReminder.subject_other": "{title} — 还有 {n} 件商品无人预订",
  "email.eventReminder.text_one": "您的活动即将到来，还有 {n} 件商品尚未被购买。\n\n{url}",
  "email.eventReminder.text_other": "您的活动即将到来，还有 {n} 件商品尚未被购买。\n\n{url}",
  "email.eventReminder.heading": "您的活动即将到来",
  "email.eventReminder.bodyHtml_one": "您的清单上还有 {n} 件商品尚未被购买。现在正适合再次分享链接，或者删掉您改变主意的商品。",
  "email.eventReminder.bodyHtml_other": "您的清单上还有 {n} 件商品尚未被购买。现在正适合再次分享链接，或者删掉您改变主意的商品。",
  "email.eventReminder.cta": "打开我的清单",

  // Guest who asked to be reminded
  "email.when.today": "今天",
  "email.when.tomorrow": "明天",
  "email.when.twoWeeks": "两周后",
  "email.when.days_one": "{n} 天后",
  "email.when.days_other": "{n} 天后",
  "email.guestReminder.subject": "{title} 将在{when}举行",
  "email.guestReminder.introHtml": "您曾请我们在大日子之前提醒您。",
  "email.guestReminder.left_one": "清单上还有 {n} 份礼物。",
  "email.guestReminder.left_other": "清单上还有 {n} 份礼物。",
  "email.guestReminder.none": "清单上的每份礼物都已经有人处理了。",
  "email.guestReminder.leftHtml_one": "清单上还有 {n} 份礼物，现在还来得及挑选。",
  "email.guestReminder.leftHtml_other": "清单上还有 {n} 份礼物，现在还来得及挑选。",
  "email.guestReminder.noneHtml": "清单上的每份礼物都已经有人处理了，不过您仍然可以去看看这份清单。",
  "email.guestReminder.text": "{title} 将在{when}举行。{left}\n\n查看清单：{url}\n\n您曾请 {shop} 提醒您。退订这些邮件：{unsubscribe}",
  "email.guestReminder.cta": "查看清单",
  "email.guestReminder.footerHtml": "您收到这封邮件，是因为您请 {shop} 提醒您这份清单的相关事宜。{link}",
  "email.guestReminder.stop": "退订这些邮件",

  // Registrant: most of the list is bought
  "email.mostGone.subject": "{title} 上的 {total} 份礼物中，{fulfilled} 份已有人处理",
  "email.mostGone.text.registry": "您的礼物清单大部分已被购买：{total} 份礼物中有 {fulfilled} 份。如果您再添加一些商品，还没有选好的宾客会有更多选择。\n\n打开您的礼物清单：{url}",
  "email.mostGone.text.wishlist": "您的心愿单大部分已被购买：{total} 份礼物中有 {fulfilled} 份。如果您再添加一些商品，还没有选好的宾客会有更多选择。\n\n打开您的心愿单：{url}",
  "email.mostGone.heading.registry": "您的礼物清单快被买完了",
  "email.mostGone.heading.wishlist": "您的心愿单快被买完了",
  "email.mostGone.countHtml.registry": "您礼物清单上的 {total} 份礼物中，<strong>{fulfilled} 份</strong>已有人处理。",
  "email.mostGone.countHtml.wishlist": "您心愿单上的 {total} 份礼物中，<strong>{fulfilled} 份</strong>已有人处理。",
  "email.mostGone.moreHtml": "如果您现在再添加一些商品，还没有选好的宾客会有更多选择。",
  "email.mostGone.cta": "添加更多商品",

  // Registrant, after the event
  "email.thankYou.subject": "该写感谢信了",
  "email.thankYou.text": "这是谁送了什么，方便您轻松写感谢信：\n\n{list}{more}\n\n下载完整名单：{csvUrl}\n打开您的礼物清单：{url}",
  "email.thankYou.more": "……完整名单中还有 {n} 条。",
  "email.thankYou.introHtml": "这是 {title} 中谁送了什么，方便您轻松写感谢信。",
  "email.thankYou.open": "打开我的清单",
  "email.thankYou.cta": "下载完整名单",

  "email.discount.subject": "{title} 上剩余商品享 {percent}% 折扣",
  "email.discount.text": "感谢您通过 {shop} 创建 {title}。使用优惠码 {code}，清单上仍有的 {shop} 商品可享 {percent}% 折扣{items}。限用一次，有效期至 {ends}。\n\n查看剩余商品：{url}",
  "email.discount.items_one": "（{n} 件商品）",
  "email.discount.items_other": "（{n} 件商品）",
  "email.discount.heading": "清单上剩余商品享 {percent}% 折扣",
  "email.discount.introHtml": "感谢您通过 {shop} 创建 {title}。清单上仍有的 {shop} 商品，我们为您准备了一份谢礼。",
  "email.discount.noteHtml": "{percent}% 折扣，限用一次，有效期至 {ends}。请在结账时输入。",
  "email.discount.cta": "查看剩余商品",
};
