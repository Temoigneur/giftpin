import type { enEmail } from "../en/email";

export const hiEmail: { [K in keyof typeof enEmail]: string } = {
  // Magic link to a registry
  "email.link.subject.registry": "आपकी {title} गिफ्ट रजिस्ट्री",
  "email.link.subject.wishlist": "आपकी विश लिस्ट: {title}",
  "email.link.text.registry": "अपनी गिफ्ट रजिस्ट्री खोलें: {url}\n\nयह लिंक 90 दिन तक चलता है। जिसके पास भी यह है, वह आपकी रजिस्ट्री बदल सकता है, इसलिए इसे अपने पास रखें।",
  "email.link.text.wishlist": "अपनी विश लिस्ट खोलें: {url}\n\nयह लिंक 90 दिन तक चलता है। जिसके पास भी यह है, वह आपकी विश लिस्ट बदल सकता है, इसलिए इसे अपने पास रखें।",
  "email.link.heading.registry": "यह रही आपकी गिफ्ट रजिस्ट्री",
  "email.link.heading.wishlist": "यह रही आपकी विश लिस्ट",
  "email.link.useHtml": "आइटम जोड़ने या यह देखने के लिए कि क्या खरीदा गया है, जब चाहें इस लिंक का इस्तेमाल करें।",
  "email.link.noteHtml.registry": "यह लिंक 90 दिन तक चलता है, और जिसके पास भी यह है वह आपकी रजिस्ट्री बदल सकता है — इसलिए इसे अपने पास रखें। मेहमानों को भेजा जाने वाला <em>शेयर</em> लिंक अलग होता है और उसमें सिर्फ देखा जा सकता है।",
  "email.link.noteHtml.wishlist": "यह लिंक 90 दिन तक चलता है, और जिसके पास भी यह है वह आपकी विश लिस्ट बदल सकता है — इसलिए इसे अपने पास रखें। मेहमानों को भेजा जाने वाला <em>शेयर</em> लिंक अलग होता है और उसमें सिर्फ देखा जा सकता है।",
  "email.link.cta.registry": "मेरी रजिस्ट्री खोलें",
  "email.link.cta.wishlist": "मेरी विश लिस्ट खोलें",

  // My registries
  "email.account.defaultShop": "स्टोर",
  "email.account.subject": "{shop} पर आपकी रजिस्ट्री",
  "email.account.text": "{shop} पर अपनी सभी रजिस्ट्री देखें: {url}",
  "email.account.textNote": "यह लिंक 90 दिन तक चलता है। जिसके पास भी यह है, वह इन रजिस्ट्री को बदल सकता है, इसलिए इसे अपने पास रखें।",
  "email.account.heading": "आपकी रजिस्ट्री",
  "email.account.introHtml": "इस ईमेल से आपने {shop} पर जितनी भी रजिस्ट्री बनाई हैं, उन सबका एक लिंक यह है:",
  "email.account.noteHtml": "यह लिंक 90 दिन तक चलता है, और जिसके पास भी यह है वह इन रजिस्ट्री को बदल सकता है, इसलिए इसे अपने पास रखें। इसी ईमेल से आप आगे जो रजिस्ट्री बनाएंगे, वे भी वहाँ दिखेंगी।",
  "email.account.cta": "मेरी रजिस्ट्री देखें",

  // Partner added
  "email.partner.subject.named": "{name} ने आपको {title} रजिस्ट्री में जोड़ा",
  "email.partner.subject.unnamed": "आपको {title} रजिस्ट्री में जोड़ा गया है",
  "email.partner.heading.named": "{name} ने आपको एक रजिस्ट्री में जोड़ा",
  "email.partner.heading.unnamed": "आपको एक रजिस्ट्री में जोड़ा गया है",
  "email.partner.lead.named": "{name} ने आपको {shop} पर {title} रजिस्ट्री में जोड़ा है।",
  "email.partner.lead.unnamed": "आपको {shop} पर {title} रजिस्ट्री में जोड़ा गया है।",
  "email.partner.then": "आप उपहार जोड़ सकते हैं और देख सकते हैं कि क्या खरीदा गया है।",
  "email.partner.open": "रजिस्ट्री खोलें: {url}",
  "email.partner.textNote": "यह लिंक 90 दिन तक चलता है। जिसके पास भी यह है, वह रजिस्ट्री बदल सकता है, इसलिए इसे अपने पास रखें। अगर यह एक्सपायर हो जाए, तो स्टोर के रजिस्ट्री पेज पर इसी ईमेल पते से नया लिंक मंगवाएं।",
  "email.partner.noteHtml": "यह लिंक 90 दिन तक चलता है, और जिसके पास भी यह है वह रजिस्ट्री बदल सकता है, इसलिए इसे अपने पास रखें। अगर यह एक्सपायर हो जाए, तो स्टोर के रजिस्ट्री पेज पर इसी ईमेल पते से नया लिंक मंगवाएं।",
  "email.partner.cta": "रजिस्ट्री खोलें",

  // Buyer line, shared by the gift emails
  "email.buyer.hidden": "कार्यक्रम के बाद हम आपको बताएंगे कि यह किसने दिया।",
  "email.buyer.named": "{name} की ओर से।",
  "email.buyer.anonymous": "खरीदने वाले ने अपना नाम साझा न करने का फ़ैसला किया है।",
  "email.buyer.anonymousContribution": "उन्होंने अपना नाम साझा न करने का फ़ैसला किया है।",

  // Someone bought a gift
  "email.purchased.subject": "किसी ने {item} खरीदा",
  "email.purchased.text.registry": "{buyer}\n\n{item} — {desired} में से {qty}\n\nअपनी रजिस्ट्री देखें: {url}",
  "email.purchased.text.wishlist": "{buyer}\n\n{item} — {desired} में से {qty}\n\nअपनी विश लिस्ट देखें: {url}",
  "email.purchased.heading": "आपको एक उपहार मिला है",
  "email.purchased.cta.registry": "अपनी रजिस्ट्री देखें",
  "email.purchased.cta.wishlist": "अपनी विश लिस्ट देखें",

  // Someone chipped in
  "email.contribution.moneyFallback": "एक गिफ्ट कार्ड",
  "email.contribution.subject": "किसी ने {item} के लिए योगदान दिया",
  "email.contribution.text.registry": "{item} के लिए {money}।\n\n{buyer}\n\n{where}\n\nअपनी रजिस्ट्री देखें: {url}",
  "email.contribution.text.wishlist": "{item} के लिए {money}।\n\n{buyer}\n\n{where}\n\nअपनी विश लिस्ट देखें: {url}",
  "email.contribution.heading": "किसी ने योगदान दिया",
  "email.contribution.leadHtml": "{item} के लिए {money}।",
  "email.contribution.where.toRegistrant": "गिफ्ट कार्ड स्टोर की ओर से एक अलग ईमेल में आता है, आमतौर पर इसी पते पर। अगर आपके मेहमान ने Shop Pay से पेमेंट किया था, तो वह उन्हें चला गया है, ताकि वे इसे आप तक पहुँचा सकें।",
  "email.contribution.where.toGuest": "गिफ्ट कार्ड आपके मेहमान को ईमेल किया गया है, ताकि वे इसे आप तक पहुँचा सकें।",
  "email.contribution.cta.registry": "अपनी रजिस्ट्री देखें",
  "email.contribution.cta.wishlist": "अपनी विश लिस्ट देखें",

  // Guest clicked through to another retailer
  "email.followup.subject": "क्या आपने {item} खरीदा?",
  "email.followup.text": "आप \"{item}\" के लिए {domain} गए थे। हमें बताएं ताकि इसे कोई दोबारा न खरीदे:\n\nहाँ, मैंने खरीद लिया: {confirmUrl}\nनहीं, मैंने नहीं खरीदा: {releaseUrl}",
  "email.followup.heading": "क्या आपने इसे खरीद लिया?",
  "email.followup.bodyHtml": "आप {item} के लिए {domain} गए थे। हमने इसे रजिस्ट्री में रोक रखा है ताकि इसे कोई दोबारा न खरीदे — लेकिन बस थोड़ी देर और।",
  "email.followup.cta": "हाँ, मैंने खरीद लिया",
  "email.followup.release": "नहीं, मैंने नहीं खरीदा — वापस रख दें",

  // Registrant, before the event
  "email.eventReminder.subject_one": "{title} — {n} आइटम अब भी आरक्षित नहीं हुआ",
  "email.eventReminder.subject_other": "{title} — {n} आइटम अब भी आरक्षित नहीं हुए",
  "email.eventReminder.text_one": "आपका कार्यक्रम नज़दीक है और {n} आइटम अभी तक नहीं खरीदा गया है।\n\n{url}",
  "email.eventReminder.text_other": "आपका कार्यक्रम नज़दीक है और {n} आइटम अभी तक नहीं खरीदे गए हैं।\n\n{url}",
  "email.eventReminder.heading": "आपका कार्यक्रम नज़दीक है",
  "email.eventReminder.bodyHtml_one": "आपकी रजिस्ट्री का {n} आइटम अभी तक नहीं खरीदा गया है। यह लिंक दोबारा शेयर करने का अच्छा समय है, या जो चीज़ें अब नहीं चाहिए उन्हें हटा दें।",
  "email.eventReminder.bodyHtml_other": "आपकी रजिस्ट्री के {n} आइटम अभी तक नहीं खरीदे गए हैं। यह लिंक दोबारा शेयर करने का अच्छा समय है, या जो चीज़ें अब नहीं चाहिए उन्हें हटा दें।",
  "email.eventReminder.cta": "मेरी रजिस्ट्री खोलें",

  // Guest who asked to be reminded
  "email.when.today": "आज",
  "email.when.tomorrow": "कल",
  "email.when.twoWeeks": "दो हफ्ते में",
  "email.when.days_one": "{n} दिन में",
  "email.when.days_other": "{n} दिन में",
  "email.guestReminder.subject": "{title} {when} है",
  "email.guestReminder.introHtml": "आपने बड़े दिन से पहले याद दिलाने को कहा था।",
  "email.guestReminder.left_one": "रजिस्ट्री में अब भी {n} उपहार बाकी है।",
  "email.guestReminder.left_other": "रजिस्ट्री में अब भी {n} उपहार बाकी हैं।",
  "email.guestReminder.none": "रजिस्ट्री का हर उपहार पूरा हो चुका है।",
  "email.guestReminder.leftHtml_one": "रजिस्ट्री में अब भी {n} उपहार बाकी है, इसलिए कुछ चुनने के लिए अभी समय है।",
  "email.guestReminder.leftHtml_other": "रजिस्ट्री में अब भी {n} उपहार बाकी हैं, इसलिए कुछ चुनने के लिए अभी समय है।",
  "email.guestReminder.noneHtml": "रजिस्ट्री का हर उपहार पूरा हो चुका है, लेकिन अगर आप देखना चाहें तो लिस्ट अब भी वहाँ है।",
  "email.guestReminder.text": "{title} {when} है। {left}\n\nरजिस्ट्री देखें: {url}\n\nआपने {shop} से याद दिलाने को कहा था। ये ईमेल बंद करें: {unsubscribe}",
  "email.guestReminder.cta": "रजिस्ट्री देखें",
  "email.guestReminder.footerHtml": "आपको यह इसलिए मिल रहा है क्योंकि आपने {shop} से इस रजिस्ट्री के बारे में याद दिलाने को कहा था। {link}",
  "email.guestReminder.stop": "ये ईमेल बंद करें",

  // Registrant: most of the list is bought
  "email.mostGone.subject": "{title} के {total} में से {fulfilled} उपहार पूरे हो चुके हैं",
  "email.mostGone.text.registry": "आपकी ज़्यादातर रजिस्ट्री खरीदी जा चुकी है: {total} में से {fulfilled} उपहार। अगर आप कुछ और आइटम जोड़ें, तो जिन मेहमानों ने अभी चुना नहीं है उनके पास ज़्यादा विकल्प होंगे।\n\nअपनी रजिस्ट्री खोलें: {url}",
  "email.mostGone.text.wishlist": "आपकी ज़्यादातर विश लिस्ट खरीदी जा चुकी है: {total} में से {fulfilled} उपहार। अगर आप कुछ और आइटम जोड़ें, तो जिन मेहमानों ने अभी चुना नहीं है उनके पास ज़्यादा विकल्प होंगे।\n\nअपनी विश लिस्ट खोलें: {url}",
  "email.mostGone.heading.registry": "आपकी ज़्यादातर रजिस्ट्री खरीदी जा चुकी है",
  "email.mostGone.heading.wishlist": "आपकी ज़्यादातर विश लिस्ट खरीदी जा चुकी है",
  "email.mostGone.countHtml.registry": "आपकी रजिस्ट्री के {total} में से <strong>{fulfilled}</strong> उपहार पूरे हो चुके हैं।",
  "email.mostGone.countHtml.wishlist": "आपकी विश लिस्ट के {total} में से <strong>{fulfilled}</strong> उपहार पूरे हो चुके हैं।",
  "email.mostGone.moreHtml": "अगर आप अभी कुछ और आइटम जोड़ें, तो जिन मेहमानों ने अभी चुना नहीं है उनके पास ज़्यादा विकल्प होंगे।",
  "email.mostGone.cta": "और आइटम जोड़ें",

  // Registrant, after the event
  "email.thankYou.subject": "धन्यवाद संदेश भेजने का समय",
  "email.thankYou.text": "यह रहा कि किसने क्या दिया, ताकि धन्यवाद संदेश लिखना आसान हो:\n\n{list}{more}\n\nपूरी लिस्ट डाउनलोड करें: {csvUrl}\nअपनी रजिस्ट्री खोलें: {url}",
  "email.thankYou.more": "...और पूरी लिस्ट में {n} और।",
  "email.thankYou.introHtml": "{title} में किसने क्या दिया, यह यहाँ है, ताकि संदेश लिखना आसान हो।",
  "email.thankYou.open": "मेरी रजिस्ट्री खोलें",
  "email.thankYou.cta": "पूरी लिस्ट डाउनलोड करें",

  "email.discount.subject": "{title} में बचे आइटम पर {percent}% की छूट",
  "email.discount.text": "{shop} के साथ {title} बनाने के लिए धन्यवाद। आपकी लिस्ट में बचे {shop} के प्रोडक्ट{items} पर {percent}% की छूट पाने के लिए कोड {code} इस्तेमाल करें। यह एक बार चलेगा और {ends} तक मान्य है।\n\nदेखें क्या बचा है: {url}",
  "email.discount.items_one": " ({n} आइटम)",
  "email.discount.items_other": " ({n} आइटम)",
  "email.discount.heading": "आपकी लिस्ट में बचे आइटम पर {percent}% की छूट",
  "email.discount.introHtml": "{shop} के साथ {title} बनाने के लिए धन्यवाद। आपकी लिस्ट में बचे {shop} के प्रोडक्ट के लिए यह हमारी ओर से धन्यवाद है।",
  "email.discount.noteHtml": "{percent}% की छूट, एक बार इस्तेमाल के लिए, {ends} तक। इसे चेकआउट पर डालें।",
  "email.discount.cta": "देखें क्या बचा है",
};
