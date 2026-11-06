/**
 * Emails. `Html` keys hold markup: their {vars} are escaped by the caller (see
 * h() in app/lib/email.server.ts). Keys ending `.registry` / `.wishlist` are
 * written out in full for each noun, because "your registry" and "your wish
 * list" take different articles and genders in other languages.
 */
export const enEmail = {
  // Magic link to a registry
  "email.link.subject.registry": "Your {title} registry",
  "email.link.subject.wishlist": "Your wish list: {title}",
  "email.link.text.registry": "Open your registry: {url}\n\nThis link works for 90 days. Anyone with it can edit your registry, so keep it to yourself.",
  "email.link.text.wishlist": "Open your wish list: {url}\n\nThis link works for 90 days. Anyone with it can edit your wish list, so keep it to yourself.",
  "email.link.heading.registry": "Here's your registry",
  "email.link.heading.wishlist": "Here's your wish list",
  "email.link.useHtml": "Use this link whenever you want to add items or see what's been bought.",
  "email.link.noteHtml.registry": "The link works for 90 days, and anyone who has it can edit your registry — so keep it to yourself. The <em>share</em> link you send to guests is different and is view-only.",
  "email.link.noteHtml.wishlist": "The link works for 90 days, and anyone who has it can edit your wish list — so keep it to yourself. The <em>share</em> link you send to guests is different and is view-only.",
  "email.link.cta.registry": "Open my registry",
  "email.link.cta.wishlist": "Open my wish list",

  // My registries
  "email.account.defaultShop": "the store",
  "email.account.subject": "Your registries at {shop}",
  "email.account.text": "See all your registries at {shop}: {url}",
  "email.account.textNote": "This link works for 90 days. Anyone with it can edit these registries, so keep it to yourself.",
  "email.account.heading": "Your registries",
  "email.account.introHtml": "Here's one link to every registry you've started at {shop} with this email:",
  "email.account.noteHtml": "The link works for 90 days, and anyone who has it can edit these registries, so keep it to yourself. Registries you start later with this email show up there too.",
  "email.account.cta": "See my registries",

  // Partner added
  "email.partner.subject.named": "{name} added you to the {title} registry",
  "email.partner.subject.unnamed": "You've been added to the {title} registry",
  "email.partner.heading.named": "{name} added you to a registry",
  "email.partner.heading.unnamed": "You've been added to a registry",
  "email.partner.lead.named": "{name} added you to the {title} registry at {shop}.",
  "email.partner.lead.unnamed": "You've been added to the {title} registry at {shop}.",
  "email.partner.then": "You can add gifts and see what's been bought.",
  "email.partner.open": "Open the registry: {url}",
  "email.partner.textNote": "This link works for 90 days. Anyone with it can edit the registry, so keep it to yourself. If it expires, ask for a new one on the store's registry page with this email address.",
  "email.partner.noteHtml": "The link works for 90 days, and anyone who has it can edit the registry, so keep it to yourself. If it expires, ask for a new one on the store's registry page with this email address.",
  "email.partner.cta": "Open the registry",

  // Buyer line, shared by the gift emails
  "email.buyer.hidden": "We'll tell you who it was after the event.",
  "email.buyer.named": "From {name}.",
  "email.buyer.anonymous": "The buyer chose not to share their name.",
  "email.buyer.anonymousContribution": "They chose not to share their name.",

  // Someone bought a gift
  "email.purchased.subject": "Someone bought {item}",
  "email.purchased.text.registry": "{buyer}\n\n{item} — {qty} of {desired}\n\nSee your registry: {url}",
  "email.purchased.text.wishlist": "{buyer}\n\n{item} — {qty} of {desired}\n\nSee your wish list: {url}",
  "email.purchased.heading": "You've been given a gift",
  "email.purchased.cta.registry": "See your registry",
  "email.purchased.cta.wishlist": "See your wish list",

  // Someone chipped in
  "email.contribution.moneyFallback": "A gift card",
  "email.contribution.subject": "Someone chipped in toward {item}",
  "email.contribution.text.registry": "{money} toward {item}.\n\n{buyer}\n\n{where}\n\nSee your registry: {url}",
  "email.contribution.text.wishlist": "{money} toward {item}.\n\n{buyer}\n\n{where}\n\nSee your wish list: {url}",
  "email.contribution.heading": "Someone chipped in",
  "email.contribution.leadHtml": "{money} toward {item}.",
  "email.contribution.where.toRegistrant": "The gift card itself comes in a separate email from the store, usually to this address. If your guest paid with Shop Pay, it went to them instead, so they can pass it on to you.",
  "email.contribution.where.toGuest": "The gift card was emailed to your guest, so they can pass it on to you.",
  "email.contribution.cta.registry": "See your registry",
  "email.contribution.cta.wishlist": "See your wish list",

  // Guest clicked through to another retailer
  "email.followup.subject": "Did you buy {item}?",
  "email.followup.text": "You headed to {domain} for \"{item}\". Let us know so nobody buys it twice:\n\nYes, I bought it: {confirmUrl}\nNo, I didn't: {releaseUrl}",
  "email.followup.heading": "Did you end up buying it?",
  "email.followup.bodyHtml": "You headed to {domain} for {item}. We've held it on the registry so nobody buys it twice — but only for a little longer.",
  "email.followup.cta": "Yes, I bought it",
  "email.followup.release": "No, I didn't buy it — put it back",

  // Registrant, before the event
  "email.eventReminder.subject_one": "{title} — {n} item still unclaimed",
  "email.eventReminder.subject_other": "{title} — {n} items still unclaimed",
  "email.eventReminder.text_one": "Your event is coming up and {n} item hasn't been bought yet.\n\n{url}",
  "email.eventReminder.text_other": "Your event is coming up and {n} items haven't been bought yet.\n\n{url}",
  "email.eventReminder.heading": "Your event is coming up",
  "email.eventReminder.bodyHtml_one": "{n} item on your registry hasn't been bought yet. Now is a good time to share the link again, or trim anything you've changed your mind about.",
  "email.eventReminder.bodyHtml_other": "{n} items on your registry haven't been bought yet. Now is a good time to share the link again, or trim anything you've changed your mind about.",
  "email.eventReminder.cta": "Open my registry",

  // Guest who asked to be reminded
  "email.when.today": "today",
  "email.when.tomorrow": "tomorrow",
  "email.when.twoWeeks": "in two weeks",
  "email.when.days_one": "in {n} day",
  "email.when.days_other": "in {n} days",
  "email.guestReminder.subject": "{title} is {when}",
  "email.guestReminder.introHtml": "You asked us to remind you before the big day.",
  "email.guestReminder.left_one": "{n} gift is still on the registry.",
  "email.guestReminder.left_other": "{n} gifts are still on the registry.",
  "email.guestReminder.none": "Every gift on the registry has been taken care of.",
  "email.guestReminder.leftHtml_one": "{n} gift is still on the registry, so there's still time to pick something.",
  "email.guestReminder.leftHtml_other": "{n} gifts are still on the registry, so there's still time to pick something.",
  "email.guestReminder.noneHtml": "Every gift on the registry has been taken care of, but the list is still there if you'd like to look.",
  "email.guestReminder.text": "{title} is {when}. {left}\n\nSee the registry: {url}\n\nYou asked {shop} to remind you. Stop these emails: {unsubscribe}",
  "email.guestReminder.cta": "See the registry",
  "email.guestReminder.footerHtml": "You're getting this because you asked {shop} to remind you about this registry. {link}",
  "email.guestReminder.stop": "Stop these emails",

  // Registrant: most of the list is bought
  "email.mostGone.subject": "{fulfilled} of {total} gifts on {title} are taken care of",
  "email.mostGone.text.registry": "Most of your registry has been bought: {fulfilled} of {total} gifts. Guests who haven't chosen yet will have more to pick from if you add a few more items.\n\nOpen your registry: {url}",
  "email.mostGone.text.wishlist": "Most of your wish list has been bought: {fulfilled} of {total} gifts. Guests who haven't chosen yet will have more to pick from if you add a few more items.\n\nOpen your wish list: {url}",
  "email.mostGone.heading.registry": "Most of your registry is gone",
  "email.mostGone.heading.wishlist": "Most of your wish list is gone",
  "email.mostGone.countHtml.registry": "<strong>{fulfilled} of {total}</strong> gifts on your registry have been taken care of.",
  "email.mostGone.countHtml.wishlist": "<strong>{fulfilled} of {total}</strong> gifts on your wish list have been taken care of.",
  "email.mostGone.moreHtml": "Guests who haven't chosen yet will have more to pick from if you add a few more items now.",
  "email.mostGone.cta": "Add more items",

  // Registrant, after the event
  "email.thankYou.subject": "Time for thank-you notes",
  "email.thankYou.text": "Here's who gave what, so thank-you notes are easy:\n\n{list}{more}\n\nDownload the full list: {csvUrl}\nOpen your registry: {url}",
  "email.thankYou.more": "...and {n} more in the full list.",
  "email.thankYou.introHtml": "Here's who gave what from {title}, so the notes are easy.",
  "email.thankYou.open": "Open my registry",
  "email.thankYou.cta": "Download the full list",

  "email.discount.subject": "{percent}% off what's left on {title}",
  "email.discount.text": "Thanks for building {title} with {shop}. Use code {code} for {percent}% off the {shop} products still on your list{items}. It works once, until {ends}.\n\nSee what's left: {url}",
  "email.discount.items_one": " ({n} item)",
  "email.discount.items_other": " ({n} items)",
  "email.discount.heading": "{percent}% off what's left on your list",
  "email.discount.introHtml": "Thanks for building {title} with {shop}. Here's a thank-you for the {shop} products still on your list.",
  "email.discount.noteHtml": "{percent}% off, one use, until {ends}. Enter it at checkout.",
  "email.discount.cta": "See what's left",
} as const;
