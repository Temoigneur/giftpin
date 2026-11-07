import type { enEmail } from "../en/email";

export const jaEmail: { [K in keyof typeof enEmail]: string } = {
  // Magic link to a registry
  "email.link.subject.registry": "ギフトリスト「{title}」",
  "email.link.subject.wishlist": "ほしいものリスト：{title}",
  "email.link.text.registry": "ギフトリストを開く：{url}\n\nこのリンクは90日間有効です。リンクを知っている人は誰でもギフトリストを編集できるため、他の人には教えないでください。",
  "email.link.text.wishlist": "ほしいものリストを開く：{url}\n\nこのリンクは90日間有効です。リンクを知っている人は誰でもほしいものリストを編集できるため、他の人には教えないでください。",
  "email.link.heading.registry": "ギフトリストはこちらです",
  "email.link.heading.wishlist": "ほしいものリストはこちらです",
  "email.link.useHtml": "商品を追加したり、購入状況を確認したりするときは、いつでもこのリンクをご利用ください。",
  "email.link.noteHtml.registry": "このリンクは90日間有効で、リンクを知っている人は誰でもギフトリストを編集できます。他の人には教えないでください。ゲストに送る<em>共有</em>リンクは別のもので、閲覧のみ可能です。",
  "email.link.noteHtml.wishlist": "このリンクは90日間有効で、リンクを知っている人は誰でもほしいものリストを編集できます。他の人には教えないでください。ゲストに送る<em>共有</em>リンクは別のもので、閲覧のみ可能です。",
  "email.link.cta.registry": "ギフトリストを開く",
  "email.link.cta.wishlist": "ほしいものリストを開く",

  // My registries
  "email.account.defaultShop": "ストア",
  "email.account.subject": "{shop}のギフトリスト",
  "email.account.text": "{shop}のすべてのギフトリストを見る：{url}",
  "email.account.textNote": "このリンクは90日間有効です。リンクを知っている人は誰でもこれらのリストを編集できるため、他の人には教えないでください。",
  "email.account.heading": "あなたのギフトリスト",
  "email.account.introHtml": "このメールアドレスで{shop}に作成したすべてのギフトリストへのリンクです：",
  "email.account.noteHtml": "このリンクは90日間有効で、リンクを知っている人は誰でもこれらのリストを編集できます。他の人には教えないでください。このメールアドレスであとから作成したリストも、そこに表示されます。",
  "email.account.cta": "マイギフトリストを見る",

  // Partner added
  "email.partner.subject.named": "{name}さんがあなたをギフトリスト「{title}」に追加しました",
  "email.partner.subject.unnamed": "ギフトリスト「{title}」に追加されました",
  "email.partner.heading.named": "{name}さんがあなたをギフトリストに追加しました",
  "email.partner.heading.unnamed": "ギフトリストに追加されました",
  "email.partner.lead.named": "{name}さんが、{shop}のギフトリスト「{title}」にあなたを追加しました。",
  "email.partner.lead.unnamed": "{shop}のギフトリスト「{title}」に追加されました。",
  "email.partner.then": "ギフトの追加や、購入状況の確認ができます。",
  "email.partner.open": "ギフトリストを開く：{url}",
  "email.partner.textNote": "このリンクは90日間有効です。リンクを知っている人は誰でもギフトリストを編集できるため、他の人には教えないでください。期限が切れた場合は、ストアのギフトリストページでこのメールアドレスを使って新しいリンクを請求してください。",
  "email.partner.noteHtml": "このリンクは90日間有効で、リンクを知っている人は誰でもギフトリストを編集できます。他の人には教えないでください。期限が切れた場合は、ストアのギフトリストページでこのメールアドレスを使って新しいリンクを請求してください。",
  "email.partner.cta": "ギフトリストを開く",

  // Buyer line, shared by the gift emails
  "email.buyer.hidden": "どなたからかは、イベントの後にお伝えします。",
  "email.buyer.named": "{name}さんからです。",
  "email.buyer.anonymous": "購入者はお名前を伏せることを選びました。",
  "email.buyer.anonymousContribution": "お名前を伏せることを選ばれました。",

  // Someone bought a gift
  "email.purchased.subject": "{item}が購入されました",
  "email.purchased.text.registry": "{buyer}\n\n{item} — {desired}個中{qty}個\n\nギフトリストを見る：{url}",
  "email.purchased.text.wishlist": "{buyer}\n\n{item} — {desired}個中{qty}個\n\nほしいものリストを見る：{url}",
  "email.purchased.heading": "ギフトが届きます",
  "email.purchased.cta.registry": "ギフトリストを見る",
  "email.purchased.cta.wishlist": "ほしいものリストを見る",

  // Someone chipped in
  "email.contribution.moneyFallback": "ギフトカード",
  "email.contribution.subject": "{item}への協力がありました",
  "email.contribution.text.registry": "{item}に{money}。\n\n{buyer}\n\n{where}\n\nギフトリストを見る：{url}",
  "email.contribution.text.wishlist": "{item}に{money}。\n\n{buyer}\n\n{where}\n\nほしいものリストを見る：{url}",
  "email.contribution.heading": "協力がありました",
  "email.contribution.leadHtml": "{item}に{money}。",
  "email.contribution.where.toRegistrant": "ギフトカード本体は、ストアから別のメールで届きます（通常はこのアドレス宛です）。ゲストがShop Payで支払った場合は、ゲスト宛に届くため、ゲストから受け取ってください。",
  "email.contribution.where.toGuest": "ギフトカードはゲストにメールで送られたため、ゲストから受け取ってください。",
  "email.contribution.cta.registry": "ギフトリストを見る",
  "email.contribution.cta.wishlist": "ほしいものリストを見る",

  // Guest clicked through to another retailer
  "email.followup.subject": "{item}は購入しましたか？",
  "email.followup.text": "「{item}」を探しに{domain}へ移動されました。重複購入を防ぐため、お知らせください：\n\n購入しました：{confirmUrl}\n購入していません：{releaseUrl}",
  "email.followup.heading": "購入されましたか？",
  "email.followup.bodyHtml": "{item}を探しに{domain}へ移動されました。重複購入を防ぐため、ギフトリスト上で確保していますが、あと少しの間だけです。",
  "email.followup.cta": "はい、購入しました",
  "email.followup.release": "いいえ、購入していません（リストに戻す）",

  // Registrant, before the event
  "email.eventReminder.subject_one": "{title} — まだ{n}個が未購入です",
  "email.eventReminder.subject_other": "{title} — まだ{n}個が未購入です",
  "email.eventReminder.text_one": "イベントが近づいていますが、{n}個の商品がまだ購入されていません。\n\n{url}",
  "email.eventReminder.text_other": "イベントが近づいていますが、{n}個の商品がまだ購入されていません。\n\n{url}",
  "email.eventReminder.heading": "イベントが近づいています",
  "email.eventReminder.bodyHtml_one": "ギフトリストの{n}個の商品がまだ購入されていません。リンクをもう一度共有したり、気が変わった商品を整理したりするのにちょうどよいタイミングです。",
  "email.eventReminder.bodyHtml_other": "ギフトリストの{n}個の商品がまだ購入されていません。リンクをもう一度共有したり、気が変わった商品を整理したりするのにちょうどよいタイミングです。",
  "email.eventReminder.cta": "ギフトリストを開く",

  // Guest who asked to be reminded
  "email.when.today": "今日",
  "email.when.tomorrow": "明日",
  "email.when.twoWeeks": "2週間後",
  "email.when.days_one": "{n}日後",
  "email.when.days_other": "{n}日後",
  "email.guestReminder.subject": "{title}は{when}です",
  "email.guestReminder.introHtml": "大切な日の前にお知らせするよう、ご依頼いただいていました。",
  "email.guestReminder.left_one": "ギフトリストには、まだ{n}個のギフトが残っています。",
  "email.guestReminder.left_other": "ギフトリストには、まだ{n}個のギフトが残っています。",
  "email.guestReminder.none": "ギフトリストのすべてのギフトが対応済みです。",
  "email.guestReminder.leftHtml_one": "ギフトリストにはまだ{n}個のギフトが残っているので、今からでも間に合います。",
  "email.guestReminder.leftHtml_other": "ギフトリストにはまだ{n}個のギフトが残っているので、今からでも間に合います。",
  "email.guestReminder.noneHtml": "ギフトリストのすべてのギフトが対応済みですが、リストはご覧いただけます。",
  "email.guestReminder.text": "{title}は{when}です。{left}\n\nギフトリストを見る：{url}\n\n{shop}にリマインダーをご依頼いただきました。配信停止：{unsubscribe}",
  "email.guestReminder.cta": "ギフトリストを見る",
  "email.guestReminder.footerHtml": "このギフトリストについて{shop}にリマインダーをご依頼いただいたため、このメールをお送りしています。{link}",
  "email.guestReminder.stop": "このメールの配信を停止",

  // Registrant: most of the list is bought
  "email.mostGone.subject": "{title}のギフト{total}個中{fulfilled}個が対応済みです",
  "email.mostGone.text.registry": "ギフトリストのほとんどが購入されました：{total}個中{fulfilled}個。まだ選んでいないゲストのために、商品を少し追加すると選択肢が増えます。\n\nギフトリストを開く：{url}",
  "email.mostGone.text.wishlist": "ほしいものリストのほとんどが購入されました：{total}個中{fulfilled}個。まだ選んでいないゲストのために、商品を少し追加すると選択肢が増えます。\n\nほしいものリストを開く：{url}",
  "email.mostGone.heading.registry": "ギフトリストのほとんどが購入されました",
  "email.mostGone.heading.wishlist": "ほしいものリストのほとんどが購入されました",
  "email.mostGone.countHtml.registry": "ギフトリストの<strong>{total}個中{fulfilled}個</strong>のギフトが対応済みです。",
  "email.mostGone.countHtml.wishlist": "ほしいものリストの<strong>{total}個中{fulfilled}個</strong>のギフトが対応済みです。",
  "email.mostGone.moreHtml": "今、商品を少し追加すると、まだ選んでいないゲストの選択肢が増えます。",
  "email.mostGone.cta": "商品を追加する",

  // Registrant, after the event
  "email.thankYou.subject": "お礼状の時期です",
  "email.thankYou.text": "お礼状を書きやすいよう、誰が何を贈ってくれたかをまとめました：\n\n{list}{more}\n\n全リストをダウンロード：{csvUrl}\nギフトリストを開く：{url}",
  "email.thankYou.more": "...ほか{n}件は全リストでご確認ください。",
  "email.thankYou.introHtml": "お礼状を書きやすいよう、{title}で誰が何を贈ってくれたかをまとめました。",
  "email.thankYou.open": "ギフトリストを開く",
  "email.thankYou.cta": "全リストをダウンロード",

  "email.discount.subject": "{title}の残りが{percent}%オフ",
  "email.discount.text": "{shop}で{title}をつくってくださりありがとうございます。リストに残っている{shop}の商品{items}が{percent}%オフになるコード{code}をご利用ください。1回限り、{ends}まで有効です。\n\n残りを見る：{url}",
  "email.discount.items_one": "（{n}個）",
  "email.discount.items_other": "（{n}個）",
  "email.discount.heading": "リストの残りが{percent}%オフ",
  "email.discount.introHtml": "{shop}で{title}をつくってくださりありがとうございます。リストに残っている{shop}の商品に、お礼の特典をご用意しました。",
  "email.discount.noteHtml": "{percent}%オフ、1回限り、{ends}まで。チェックアウト時に入力してください。",
  "email.discount.cta": "残りを見る",
};
