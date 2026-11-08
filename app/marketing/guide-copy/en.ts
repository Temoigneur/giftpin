import type { GuideCopy } from "./types";

const CHROME = "https://chromewebstore.google.com/detail/giftpin-%E2%80%94-add-to-registry/hfmielpmefknpgpekhfehnfdlhiobdkk";

export const en: GuideCopy = {
  ui: {
    language: "Language",
    shotsNote: "",
    shopifyNote: "",
    finalCta: "Ready to give your customers a registry?",
  },

  setup: {
    eyebrow: "Setup guide",
    h1: `Set up Giftpin<br><span class="grad-text">in about ten minutes</span>`,
    lede: "Everything a merchant needs, from install to your first registry. Bold text is exactly what you'll see on screen.",
    metaTitle: "Giftpin setup guide for Shopify merchants",
    description:
      "How to install Giftpin, add the registry button and links to your Shopify theme, choose occasions and settings, find every Save button, and turn on Pro features.",
    sections: [
      {
        title: "Get started",
        steps: [
          {
            title: "Install Giftpin",
            items: [
              "Open Giftpin on the Shopify App Store and click <b>Install</b>.",
              "Approve the permissions screen. Giftpin opens on its <b>{{admin.nav.overview}}</b> page in your Shopify admin.",
            ],
          },
          {
            title: "Add Giftpin to your theme",
            items: [
              "On <b>{{admin.nav.overview}}</b>, go to <b>{{admin.theme.title}}</b> and pick a theme. You can set up an unpublished copy first.",
              "Click <b>{{admin.theme.btnAdd}}</b>. The theme editor opens with the Add to registry button already added. Drag it where you want it, then press <b>Save</b> at the top right of the theme editor.",
              "Back in Giftpin, click <b>{{admin.theme.linksAdd}}</b>. This adds Create, Find and Manage registry links under your header. Press <b>Save</b> in the theme editor.",
              "Optional, for a favourites list: click <b>{{admin.theme.heartAdd}}</b>. This opens the product page in the theme editor with a <b>Save for later</b> heart added. Press <b>Save</b>.",
              "Then click <b>{{admin.theme.savedAdd}}</b>. This adds a <b>Saved items</b> list to your cart page, so shoppers can find what they hearted. Press <b>Save</b>.",
              "These two are not switched on automatically. Until you add them in the theme editor and press <b>Save</b>, shoppers won't see a heart. Hearts are kept in the shopper's own browser, with no account, so the list is empty on a new device.",
              "Prefer to place them by hand? In the theme editor, open the page, click <b>Add block</b> (or <b>Add section</b>), open the <b>Apps</b> group and choose <b>Save for later</b> or <b>Saved items</b>.",
              "Using a vintage (pre-Online Store 2.0) theme? The blocks won't work there, but your registry pages still do: add a menu item pointing to <b>/apps/registry</b> in <b>Online Store → Navigation</b>.",
            ],
            img: [
              { src: "/guides/m1-overview.png", alt: "Giftpin's Overview page with the Add Giftpin to your theme card, the Add button to product pages and Add registry links buttons" },
              { src: "/guides/m2-theme-editor.png", alt: "The Shopify theme editor with the Add to registry block selected on a product page" },
            ],
          },
          {
            title: "Check your registry pages",
            items: [
              "On <b>{{admin.nav.overview}}</b>, under <b>{{admin.ov.pages}}</b>, click <b>{{admin.ov.create}}</b> to see the page your customers use.",
              "Create a test registry, add a product with the Add to registry button, and open the guest link to see what guests see.",
              "Every registry your customers create shows up under <b>{{admin.nav.registries}}</b> in Giftpin's menu.",
            ],
            img: [
              { src: "/guides/m3-product-page.png", alt: "A storefront product page with the Add to registry button under Buy it now, and the Create, Find and Manage registry links above" },
              { src: "/guides/m7-registries.png", alt: "Giftpin's Registries page listing two wedding registries with their items and progress" },
            ],
          },
        ],
      },
      {
        title: "Where the Save buttons are",
        lede: "Changes only count once you save them, and each screen puts the button somewhere different. This is the full list.",
        tint: true,
        steps: [
          {
            title: "In the Shopify theme editor",
            items: [
              "<b>Save</b> is at the top right of the theme editor. Adding, moving or changing a Giftpin block does nothing on your live store until you press it.",
              "The Giftpin buttons on <b>{{admin.nav.overview}}</b> only open the editor with the block added. They don't save it for you.",
            ],
          },
          {
            title: "On Giftpin's Settings page",
            items: [
              "<b>{{admin.set.save}}</b> is at the top right of the page, in the header. It saves everything from <b>{{admin.set.occasions}}</b> down to <b>{{admin.set.emails}}</b>.",
              "The same <b>{{admin.set.save}}</b> button appears again at the bottom of that block, right under <b>{{admin.set.emails}}</b>. Both do the same thing, so use whichever is closest.",
              "You'll see the message <b>{{admin.set.toast}}</b> at the bottom of the screen, and <b>{{admin.set.saved}}</b> beside the lower button.",
              "<b>{{admin.set.funds}}</b>, with <b>{{admin.set.sell}}</b> inside it, has its own <b>{{admin.set.save}}</b> button at the bottom of that section. The header button does not save it: if you change anything there, press the one inside the section.",
              "<b>{{admin.set.runNow}}</b> is an action, not a setting, so there is nothing to save.",
            ],
          },
          {
            title: "On Giftpin's other pages",
            items: [
              "<b>{{admin.nav.promotions}}</b>: fill in <b>{{admin.promo.new}}</b> and click <b>{{admin.promo.createBtn}}</b> at the bottom of that form. <b>{{admin.promo.pause}}</b>, <b>{{admin.promo.resume}}</b> and <b>{{admin.promo.delete}}</b> in the list act straight away.",
              "<b>{{admin.nav.inStore}}</b>: click <b>{{admin.ins.create}}</b> at the bottom of <b>{{admin.ins.start}}</b>.",
              "<b>{{admin.reg.import}}</b>: choose your file, click the button that checks it, read what it will do, then click the Import button that appears.",
              "<b>{{admin.nav.registries}}</b>, <b>{{admin.nav.analytics}}</b> and <b>{{admin.nav.overview}}</b> only show information, so they have nothing to save.",
            ],
          },
          {
            title: "On a registrant's manage page",
            items: [
              "Registrants have their own page, opened from the private link in their email. Tell them where to save, because a registry only keeps what was saved.",
              "<b>{{manage.prefs.save}}</b> is at the bottom of <b>{{manage.prefs.settings}}</b>, inside <b>{{manage.prefs.open}}</b> near the bottom of the page. It saves the name, occasion, date, note, language and who can see it.",
              "<b>{{manage.save}}</b> inside <b>{{manage.ship.title}}</b> saves the shipping address. It is a separate button from the one above.",
              "<b>{{manage.item.update}}</b> on an item saves that item's quantity, note and category.",
              "During first-time setup the buttons are <b>{{manage.setup.saveContinue}}</b> and <b>{{manage.setup.skip}}</b>.",
            ],
          },
        ],
      },
      {
        title: "Make it yours",
        lede: "All in Giftpin's Settings page.",
        steps: [
          {
            title: "Choose your occasions",
            items: [
              "Open <b>{{admin.nav.settings}}</b>. Under <b>{{admin.set.occasions}}</b>, tick the kinds of registry customers can create: weddings, baby showers, birthdays, graduations, housewarmings and more.",
              "Tick <b>{{event.wishlist}}</b> for a shareable list with no event date, such as a holiday wish list. It is off until you switch it on.",
              "Press <b>{{admin.set.save}}</b> (top right).",
            ],
            img: { src: "/guides/m5-occasions.png", alt: "Giftpin Settings showing the Occasions checklist and the Items from other stores choices" },
          },
          {
            title: "Decide on items from other stores",
            items: [
              "Under <b>{{admin.set.ext}}</b>, choose <b>{{admin.set.extOn}}</b>, <b>{{admin.set.extCapped}}</b> or <b>{{admin.set.extOff}}</b>.",
              "Allowing them is what makes customers pick your registry as their main one. Giftpin suggests your closest matching product beside each outside item.",
            ],
          },
          {
            title: "Decide what happens when a product sells out",
            items: [
              "Under <b>{{admin.set.soldOut}}</b>, choose <b>{{admin.set.soldOutShow}}</b> or <b>{{admin.set.soldOutHide}}</b>.",
              "Giftpin checks your live stock each time a guest opens a registry. The item always stays on the registry, so it comes back by itself when you restock.",
            ],
          },
          {
            title: "Match your store's look and language",
            items: [
              "Under <b>{{admin.set.appearance}}</b>, set the <b>{{admin.set.buttonLabel}}</b> and <b>{{admin.set.accent}}</b>.",
              "<b>{{admin.set.langLabel}}</b> picks the language guests see on registry pages and in registry emails: English, French, Spanish, German or Brazilian Portuguese.",
              "The Add to registry button and registry links have their own settings in the theme editor: label, icon, colours, size and spacing.",
              "To let shoppers who keep their registry somewhere else use your button too, tick <b>Also offer Babylist</b> or <b>Also offer \"Another registry\"</b> (copies the product link for sites like Zola) in the button's settings. The button then asks which registry.",
              "With Pro, <b>{{admin.set.branding}}</b> adds your logo (<b>{{admin.set.logo}}</b>), colours and font to registry pages and removes the Powered by Giftpin credit.",
            ],
            img: { src: "/guides/m6-appearance.png", alt: "Giftpin Settings Appearance section with the Button label and Accent colour fields" },
          },
          {
            title: "Set privacy",
            items: [
              "Under <b>{{admin.set.privacy}}</b>, choose whether to <b>{{admin.set.hideBuyer}}</b>, and whether to turn on the public find-a-registry page (<b>{{admin.set.find}}</b>). Only registries whose owners opt in are listed there. It is off until you tick it: until then, the Find link on your storefront asks visitors for the registry link instead.",
            ],
          },
          {
            title: "Offer registry perks (Pro)",
            items: [
              "Under <b>{{admin.set.perks}}</b>, write what you offer people who register with you, one per line, in <b>{{admin.set.perksLabel}}</b>: free gift wrapping, a gift when the registry reaches a total, and so on.",
              "Registrants see them while they create a registry. Press <b>{{admin.set.save}}</b>.",
            ],
          },
        ],
      },
      {
        title: "Pro",
        lede: "Optional extras for stores that want more.",
        steps: [
          {
            title: "Start Pro",
            items: [
              "Open <b>{{admin.nav.plan}}</b> in Giftpin's menu and click the upgrade button. You get a {{trialDays}}-day free trial, then {{proName}} is {{price}}/month. <b>{{admin.bill.cancel}}</b> is on the same page.",
            ],
          },
          {
            title: "Group gifts and funds",
            items: [
              "In your Shopify admin, go to <b>Products → Gift cards → Add a gift card product</b>, with a few amounts such as $25, $50 and $100.",
              "In <b>Settings → General → Order processing</b>, choose <b>Automatically fulfill only the gift cards</b>. Shopify only sends a gift card once its order is fulfilled.",
              "In Giftpin, open <b>{{admin.nav.settings}}</b>. Under <b>{{admin.set.funds}}</b>, pick that gift card in <b>{{admin.set.fundsPick}}</b> and press that section's own <b>{{admin.set.save}}</b>. Guests can now chip in toward a big item or a cash fund.",
            ],
          },
          {
            id: "gift-cards",
            title: "Sell gift cards on giftpin.app",
            items: [
              "Set up the gift card in the step above first. The listing uses the same gift card, in amounts up to $500.",
              "In Giftpin, open <b>{{admin.nav.settings}}</b>. Under <b>{{admin.set.sell}}</b>, tick <b>{{admin.set.listMine}}</b>, add <b>{{admin.set.blurb}}</b>, and press that section's <b>{{admin.set.save}}</b>.",
              "Your store now appears at <a href=\"/gift-cards\">giftpin.app/gift-cards</a>, under your country, and your registry pages get a <b>Rather give a gift card?</b> link. Shoppers buy your gift card at your own checkout, so you keep the money and any unspent balance. Gift cards sold this way show up in Giftpin's <b>{{admin.nav.analytics}}</b>.",
              "Giftpin charges {{feePct}}% of each gift card sold this way, on your Shopify bill, {{holdDays}} days after the sale so a refunded card is never charged. There's no fee during your free trial.",
            ],
          },
          {
            title: "After-event discount and automatic emails",
            items: [
              "Under <b>{{admin.set.after}}</b>, turn on <b>{{admin.set.discount}}</b>, and set <b>{{admin.set.discountPct}}</b> and <b>{{admin.set.discountDays}}</b>.",
              "Under <b>{{admin.set.emails}}</b>, choose <b>{{admin.set.guestRemind}}</b>, <b>{{admin.set.mostGone}}</b> and <b>{{admin.set.thanks}}</b>.",
              "Press <b>{{admin.set.save}}</b> (top right). To try them without waiting a day, use <b>{{admin.set.runNow}}</b> at the bottom of Settings.",
            ],
          },
          {
            title: "Registry promotions",
            items: [
              "Open <b>{{admin.nav.promotions}}</b>. Under <b>{{admin.promo.new}}</b>, choose <b>{{admin.promo.typeSale}}</b> or <b>{{admin.promo.typeCoupon}}</b>, set the discount and dates, and click <b>{{admin.promo.createBtn}}</b>.",
              "A promotion only applies to gifts added to the cart from a registry page. The same product bought the usual way keeps its normal price.",
              "Promotions also appear on Shopify's Discounts page, starting with “Giftpin:”.",
            ],
          },
          {
            title: "Analytics and sales report",
            items: [
              "Open <b>{{admin.nav.analytics}}</b> for registries created, items added and gifts bought over time, where gifts were bought, and a month-by-month sales report. <b>{{admin.an.csv}}</b> exports the report.",
              "Under <b>{{admin.nav.registries}}</b>, <b>{{admin.reg.csvRegs}}</b> and <b>{{admin.reg.csvPurch}}</b> export registries and purchases.",
            ],
          },
          {
            title: "In-store mode and Shopify POS",
            items: [
              "Open <b>{{admin.nav.inStore}}</b> in Giftpin's menu to find a customer's registry or start one for them at the counter.",
              "To ring up registry gifts in Shopify POS, add the Giftpin tile: in your Shopify admin, open <b>Point of Sale</b>, then the POS editor, choose <b>Add tile → Embedded Apps</b> and pick Giftpin. Products must be published to the Point of Sale channel.",
              "Registrants can also scan a product's barcode with their phone in your shop to add it: they open <b>{{manage.scan.open}}</b> on their manage page. This needs barcodes (or SKUs) on your products, and it works best with a clear, full-frame view of one barcode.",
            ],
          },
        ],
      },
      {
        title: "More tools",
        lede: "Smaller features you may not have noticed.",
        tint: true,
        steps: [
          {
            title: "Move registries over from another app",
            items: [
              "Open <b>{{admin.nav.registries}}</b> and click <b>{{admin.reg.import}}</b>. Export your registries from your old registry app as a CSV with one row per item, and choose it under <b>{{admin.imp.fileLabel}}</b>.",
              "Giftpin matches each item to your products by SKU or barcode and shows what it will do before anything changes. Tick <b>{{admin.imp.email}}</b> only if your customers expect to hear from you about the move.",
            ],
          },
          {
            title: "Registry panels in the Shopify admin",
            items: [
              "On an order, a customer or a product page in your Shopify admin, open <b>More actions → Giftpin registry</b> to see which registry it belongs to, whether that person has one, or which registries include the product.",
              "If you don't see it, the extensions need <code>shopify app deploy</code> once from the app's code.",
            ],
          },
          {
            title: "Shopify Flow (Pro)",
            items: [
              "Giftpin adds three triggers to Shopify Flow: <b>Registry created</b>, <b>Registry event coming up</b> and <b>Registry gift bought</b>. Use them to email the registrant, tag a customer or tell your team.",
              "Registrant emails are for messages about their own registry. Marketing to them still needs their consent.",
            ],
          },
          {
            title: "Languages",
            items: [
              "Guests and registrants see registry pages and emails in the language you pick under <b>{{admin.set.appearance}}</b> → <b>{{admin.set.langLabel}}</b>. Giftpin's own admin pages follow your Shopify admin language where Shopify shares it with the app, and otherwise your browser's language.",
              "The names and notes people type, and your product titles, stay as they were written.",
            ],
          },
        ],
      },
    ],
    faqTitle: "Common questions",
    faq: [
      {
        q: "Where do I see my customers' registries?",
        a: "Open Registries in Giftpin's menu. Overview shows registry revenue, new customers and gifts given.",
      },
      {
        q: "Do registrants or guests need an account?",
        a: "No. Registrants get a private manage link by email, and guests only need the registry link.",
      },
      {
        q: "I changed a setting and nothing happened.",
        a: "Check that you pressed Save. In the theme editor it is at the top right. On Giftpin's Settings page it is at the top right and again below Automatic emails, and Group gifts and funds has its own Save.",
      },
      {
        q: "What happens to the theme blocks if I uninstall?",
        a: "Shopify removes both Giftpin blocks from your themes automatically.",
      },
      {
        q: "I'm stuck. Who do I contact?",
        a: "Email support@giftpin.app with your store's .myshopify.com address and what you were trying to do.",
      },
    ],
  },

  registry: {
    eyebrow: "Registry guide",
    h1: `Create your gift registry<br><span class="grad-text">and share one link</span>`,
    lede: "How to start a Giftpin registry, add gifts from this store and anywhere else, and share it with your guests. Bold text is exactly what you'll see on screen.",
    metaTitle: "How to create a gift registry with Giftpin",
    description:
      "How to start a Giftpin gift registry on a store, add gifts from that store and any other website, share it with guests, save your changes and have gifts shipped to you.",
    sections: [
      {
        title: "Get started",
        steps: [
          {
            title: "Start your registry",
            items: [
              "On the store's website, click <b>Create a gift registry</b> (usually under the header or in the menu). You can also press <b>Add to registry</b> on any product, and you'll be asked to start one.",
              "Choose the occasion under <b>{{create.occasion}}</b>, then fill in <b>{{create.name}}</b>, <b>{{create.when}}</b>, <b>{{create.yourName}}</b> and <b>{{create.yourEmail}}</b>.",
              "Under <b>{{create.country}}</b>, pick your guests' country. Giftpin uses it to suggest stores for things this store doesn't sell.",
              "Optionally write <b>{{create.note}}</b>, then click <b>{{create.submit}}</b>.",
            ],
            img: { src: "/guides/r1-start.png", alt: "The Start a registry form with the occasion, registry name, date, name, email and country filled in" },
          },
          {
            title: "Keep your private link",
            items: [
              "Giftpin emails you a private link to manage your registry. You don't need an account or a password: that link is your way in, so keep the email. It works for 90 days.",
              "Lost it, or it stopped working? On the store's create-a-registry page, under <b>Already have one?</b>, enter your email and click <b>{{create.resendButton}}</b>. The link you get lists every registry you've started with that email.",
              "Never share this link. Anyone who has it can edit your registry. Guests get a different link (see Share it below).",
            ],
            img: { src: "/guides/r2-manage-link.png", alt: "The email Giftpin sends, with the Open my registry button" },
          },
        ],
      },
      {
        title: "Add your gifts",
        lede: "From this store, and from any other website.",
        tint: true,
        steps: [
          {
            title: "Add this store's products",
            items: [
              "Browse the store and click <b>Add to registry</b> on any product page. You'll see <b>Added to your registry</b> and a <b>Back to your registry</b> link.",
              "Pressing it again on the same product asks how many you'd like in total, so nothing gets added twice by accident.",
              "Using a different phone or computer? Open your private link from the email there first, so the button knows which registry is yours.",
            ],
            img: { src: "/guides/r4-added.png", alt: "A product page after pressing Add to registry, showing Added to your registry and a Back to your registry link" },
          },
          {
            title: "Add gifts from any other website",
            items: [
              "On your registry, go to <b>{{manage.addItems}}</b>, paste the product's address into <b>{{manage.productLink}}</b> and click <b>{{manage.lookUp}}</b>. Giftpin fills in the name, photo and price.",
              "Some big stores block this. If that happens, type the <b>{{manage.name}}</b> and <b>{{manage.price}}</b> yourself and click <b>{{manage.addToReg}}</b>.",
              "Giftpin may show something similar from this store. Click <b>{{manage.match.swap}}</b> to see it, or keep your original.",
            ],
            img: { src: "/guides/r5-paste-link.png", alt: "The Add items box with a Target link looked up, showing the photo, name and price it found" },
          },
          {
            title: "Or use the Chrome extension",
            items: [
              `On a computer, install <a href="${CHROME}" target="_blank" rel="noopener">the Giftpin extension for Chrome</a>.`,
              "On your registry, under <b>{{manage.ext.title}}</b>, click <b>{{manage.ext.copy}}</b>. Open the extension, paste it into <b>Manage link</b> and click <b>Connect</b>. You only do this once.",
              "Now, on any product page on any website, open the extension, choose the <b>Quantity</b> and click <b>Add to registry</b>.",
            ],
            img: { src: "/guides/r6-extension.png", alt: "The Giftpin extension on a Walmart product page, with the quantity and Add to registry button" },
          },
          {
            title: "In the shop? Scan a barcode",
            items: [
              "If the store offers it, open your private link on your phone and tap <b>{{manage.scan.open}}</b>. Point the camera at a barcode on a tag or box, and the product is added to your list.",
              "Allow the camera when your phone asks. If it can't open, type the number under the barcode into <b>{{manage.scan.codeLabel}}</b> and tap <b>{{manage.scan.lookUp}}</b>.",
              "Fill the screen with one barcode, so a neighbouring one isn't read by mistake.",
            ],
          },
          {
            title: "Fine-tune your list",
            items: [
              "Under <b>{{manage.yourList}}</b>, open any item to change <b>{{manage.item.qty}}</b>, add a <b>{{manage.item.noteLabel}}</b> (a size or colour, say) or pick a <b>{{manage.item.category}}</b>, then click <b>{{manage.item.update}}</b>.",
              "Not sure what to add? Tap <b>{{manage.ideas.open}}</b> for ideas for your occasion.",
            ],
            img: { src: "/guides/r7-item.png", alt: "An item on the list opened for editing, with a note for guests, the quantity and the category" },
          },
        ],
      },
      {
        title: "Share it",
        steps: [
          {
            title: "Share it with guests",
            items: [
              "At the top of your registry, click <b>{{manage.shareBtn}}</b> and send the link by email, text message, WhatsApp or Facebook, or click <b>{{manage.copyLink}}</b>.",
              "Prefer a code on an invitation or a sign? Click <b>{{manage.qr}}</b> beside the share buttons, then <b>{{manage.qr.download}}</b>. Guests point their phone camera at it to open your registry.",
              "Guests see your gifts and what's still needed. They never see your email or address, and they don't need an account.",
            ],
            img: [
              { src: "/guides/r3-share.png", alt: "The share link with Copy link, Email, Text message, WhatsApp and Facebook buttons" },
              { src: "/guides/r10-guest-view.png", alt: "What guests see: the registry with a store item, a gift already taken care of, and an item from Walmart" },
            ],
          },
          {
            title: "Plan it with someone",
            items: [
              "Right after you create your registry we ask <b>{{manage.setup.partnerTitle}}</b>. You can also do it later: click <b>{{manage.prefs.open}}</b>, scroll to <b>{{manage.partner.title}}</b>, enter <b>{{manage.partner.name}}</b> and <b>{{manage.partner.email}}</b>, then click <b>{{manage.partner.add}}</b>.",
              "They get their own private link. They can add gifts, see what's been bought and change settings. Their email is never shown to guests, and <b>{{manage.partner.remove}}</b> turns their link off straight away.",
            ],
          },
          {
            title: "Choose who can see it",
            items: [
              "At the bottom of your registry, click <b>{{manage.prefs.open}}</b>. Under <b>{{manage.prefs.settings}}</b>, use <b>{{manage.prefs.who}}</b>: <b>{{manage.prefs.priv.unlisted}}</b>, <b>{{manage.prefs.priv.password}}</b>, or <b>{{manage.prefs.priv.public}}</b> on the store's <b>Find a gift registry</b> page.",
              "Click <b>{{manage.prefs.save}}</b>. The same section lets you change the name, occasion, date and note. If the store allows it, there is also <b>{{manage.lang.label}}</b>.",
            ],
            img: { src: "/guides/r9-privacy.png", alt: "The Who can see this menu with its three choices" },
          },
          {
            title: "Have gifts shipped to you",
            items: [
              "Right after you create your registry, we ask <b>{{manage.setup.shipTitle}}</b> Tick the box and enter your shipping address, or skip it for now.",
              "To change it later, click <b>{{manage.prefs.open}}</b>, then under <b>{{manage.ship.title}}</b> tick the box, enter your address and click <b>{{manage.save}}</b>. Guests can then ship gifts from this store straight to you.",
              "Each guest decides when they add a gift to their cart: ship it to you, or send it to themselves. Guests never see your address.",
            ],
            img: { src: "/guides/r8-ship.png", alt: "The Let guests ship gifts to me section with the box ticked and a shipping address filled in" },
          },
        ],
      },
      {
        title: "Where to press Save",
        lede: "A registry only keeps what you save. Each part of the page has its own button.",
        tint: true,
        steps: [
          {
            title: "Which button saves what",
            items: [
              "<b>{{manage.prefs.save}}</b> is at the end of <b>{{manage.prefs.settings}}</b>, inside <b>{{manage.prefs.open}}</b> near the bottom of the page. It saves the name, occasion, date, note and who can see it. If you changed something and left without it, the change is lost.",
              "<b>{{manage.save}}</b> inside <b>{{manage.ship.title}}</b>, just below it in the same panel, saves your shipping address. It is separate from the button above, so press both if you changed both.",
              "<b>{{manage.partner.add}}</b> in <b>{{manage.partner.title}}</b>, below that, sends your partner their link and saves them.",
              "<b>{{manage.item.update}}</b> on an item saves that item's quantity, note and category.",
              "<b>{{manage.addToReg}}</b> saves a new item as soon as you click it.",
              "You'll see <b>{{manage.flash.saved}}</b> near the top of the page once it worked.",
            ],
          },
        ],
      },
    ],
    faqTitle: "Common questions",
    faq: [
      {
        q: "How do guests avoid buying the same thing?",
        a: "Orders from this store update your registry automatically. For gifts from other websites, guests tap I bought this after buying, and the item shows as taken. Guests who change their mind can undo it for 24 hours.",
      },
      {
        q: "How do I know who gave me what?",
        a: "Your registry has a Who gave what list for your thank-you notes, and Giftpin emails you when someone buys a gift.",
      },
      {
        q: "Can guests chip in toward something big?",
        a: "If the store offers it, yes. Your registry can turn an item into a group gift, or hold a cash fund for a honeymoon or a house, paid as the store's gift cards.",
      },
      {
        q: "I changed something and it didn't stick.",
        a: "Press the Save button for that part of the page: Save changes in Edit registry & preferences, Save under Let guests ship gifts to me, or Update on an item.",
      },
      {
        q: "Can I delete my registry?",
        a: "Yes. Click Edit registry & preferences at the bottom of your registry, then Delete registry. This removes every item and the record of who bought what, and it can't be undone.",
      },
    ],
  },
};
