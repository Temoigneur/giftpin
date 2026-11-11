import type { RawGuideCopy } from "./types";

const CHROME = "https://chromewebstore.google.com/detail/giftpin-%E2%80%94-add-to-registry/hfmielpmefknpgpekhfehnfdlhiobdkk";

export const de: RawGuideCopy = {
  ui: {
    language: "Sprache",
    shotsNote: "Die Screenshots zeigen die englische Version der Bildschirme.",
    shopifyNote:
      "Die Namen von Shopify-Bildschirmen (zum Beispiel Content → Menus) stehen auf Englisch, wie im englischen Shopify-Admin. In Ihrer Sprache können sie übersetzt erscheinen.",
    finalCta: "Bereit, Ihren Kunden eine Geschenkliste anzubieten?",
  },

  setup: {
    eyebrow: "Einrichtungsanleitung",
    h1: `Giftpin einrichten<br><span class="grad-text">in etwa zehn Minuten</span>`,
    lede: "Alles, was ein Händler braucht, von der Installation bis zur ersten Liste. Fettgedruckter Text ist genau das, was Sie auf dem Bildschirm sehen.",
    metaTitle: "Giftpin-Einrichtungsanleitung für Shopify-Händler",
    description:
      "So installieren Sie Giftpin, fügen den Listen-Button und die Links zu Ihrem Shopify-Theme hinzu, wählen Anlässe und Einstellungen, finden jeden Speichern-Button und aktivieren die Pro-Funktionen.",
    sections: [
      {
        title: "Los geht's",
        steps: [
          {
            title: "Giftpin installieren",
            items: [
              "Öffnen Sie Giftpin im Shopify App Store und klicken Sie auf <b>Install</b>.",
              "Bestätigen Sie die Berechtigungen. Giftpin öffnet sich auf der Seite <b>{{admin.nav.overview}}</b> in Ihrem Shopify-Admin.",
            ],
          },
          {
            title: "Giftpin zu Ihrem Theme hinzufügen",
            items: [
              "Gehen Sie auf <b>{{admin.nav.overview}}</b> zu <b>{{admin.theme.title}}</b> und wählen Sie ein Theme. Sie können zuerst eine unveröffentlichte Kopie einrichten.",
              "Klicken Sie auf <b>{{admin.theme.btnAdd}}</b>. Der Theme-Editor öffnet sich mit dem bereits hinzugefügten Add-to-registry-Button. Ziehen Sie ihn an die gewünschte Stelle und drücken Sie oben rechts im Theme-Editor auf <b>Save</b>.",
              "Klicken Sie zurück in Giftpin auf <b>{{admin.theme.linksAdd}}</b>. Das fügt unter Ihrem Header Links zum Erstellen, Finden und Verwalten von Listen hinzu. Drücken Sie im Theme-Editor auf <b>Save</b>.",
              "Optional, für eine Merkliste: Klicken Sie auf <b>{{admin.theme.heartAdd}}</b>. Die Produktseite öffnet sich im Theme-Editor mit einem hinzugefügten <b>Save for later</b>-Herz. Drücken Sie auf <b>Save</b>.",
              "Klicken Sie dann auf <b>{{admin.theme.savedAdd}}</b>. Das fügt Ihrer Warenkorbseite eine <b>Saved items</b>-Liste hinzu, damit Käufer wiederfinden, was sie mit dem Herz markiert haben. Drücken Sie auf <b>Save</b>.",
              "Diese beiden werden nicht automatisch aktiviert. Solange Sie sie nicht im Theme-Editor hinzugefügt und auf <b>Save</b> gedrückt haben, sehen Käufer kein Herz. Die Herzen werden im eigenen Browser des Käufers gespeichert, ohne Konto, daher ist die Liste auf einem neuen Gerät leer.",
              "Lieber von Hand platzieren? Öffnen Sie im Theme-Editor die Seite, klicken Sie auf <b>Add block</b> (oder <b>Add section</b>), öffnen Sie die Gruppe <b>Apps</b> und wählen Sie <b>Save for later</b> oder <b>Saved items</b>.",
              "Sie nutzen ein altes Theme (vor Online Store 2.0)? Die Blöcke funktionieren dort nicht, Ihre Listenseiten aber schon: Fügen Sie unter <b>Content → Menus</b> einen Menüpunkt hinzu, der auf <b>/apps/registry</b> verweist.",
            ],
            alts: [
              "Die Giftpin-Übersicht mit der Karte „Giftpin zu Ihrem Theme hinzufügen“ und den Buttons zum Hinzufügen des Buttons zu Produktseiten und der Listen-Links",
              "Der Shopify-Theme-Editor mit ausgewähltem Add-to-registry-Block auf einer Produktseite",
            ],
          },
          {
            title: "Ihre Listenseiten prüfen",
            items: [
              "Klicken Sie auf <b>{{admin.nav.overview}}</b> unter <b>{{admin.ov.pages}}</b> auf <b>{{admin.ov.create}}</b>, um die Seite zu sehen, die Ihre Kunden nutzen.",
              "Erstellen Sie eine Testliste, fügen Sie mit dem Add-to-registry-Button ein Produkt hinzu und öffnen Sie den Gästelink, um zu sehen, was Gäste sehen.",
              "Jede Liste, die Ihre Kunden erstellen, erscheint im Giftpin-Menü unter <b>{{admin.nav.registries}}</b>.",
            ],
            alts: [
              "Eine Produktseite im Shop mit dem Add-to-registry-Button unter „Jetzt kaufen“ und den Links zum Erstellen, Finden und Verwalten von Listen darüber",
              "Die Giftpin-Seite „Listen“ mit zwei Hochzeitslisten, ihren Artikeln und dem Fortschritt",
            ],
          },
        ],
      },
      {
        title: "Wo die Speichern-Buttons sind",
        lede: "Änderungen zählen erst, wenn Sie sie speichern, und jeder Bildschirm platziert den Button woanders. Hier ist die vollständige Liste.",
        tint: true,
        steps: [
          {
            title: "Im Shopify-Theme-Editor",
            items: [
              "<b>Save</b> befindet sich oben rechts im Theme-Editor. Einen Giftpin-Block hinzuzufügen, zu verschieben oder zu ändern, bewirkt in Ihrem Live-Shop nichts, bis Sie darauf drücken.",
              "Die Giftpin-Buttons auf <b>{{admin.nav.overview}}</b> öffnen nur den Editor mit dem hinzugefügten Block. Sie speichern ihn nicht für Sie.",
            ],
          },
          {
            title: "Auf der Giftpin-Seite Einstellungen",
            items: [
              "<b>{{admin.set.save}}</b> befindet sich oben rechts auf der Seite, in der Kopfzeile. Es speichert alles von <b>{{admin.set.occasions}}</b> bis <b>{{admin.set.emails}}</b>.",
              "Derselbe Button <b>{{admin.set.save}}</b> erscheint noch einmal am Ende dieses Blocks, direkt unter <b>{{admin.set.emails}}</b>. Beide tun dasselbe, nutzen Sie also den, der näher ist.",
              "Sie sehen die Meldung <b>{{admin.set.toast}}</b> unten auf dem Bildschirm und <b>{{admin.set.saved}}</b> neben dem unteren Button.",
              "<b>{{admin.set.funds}}</b>, das <b>{{admin.set.sell}}</b> enthält, hat am Ende des Abschnitts einen eigenen <b>{{admin.set.save}}</b>-Button. Der Button in der Kopfzeile speichert ihn nicht: Wenn Sie dort etwas ändern, drücken Sie den im Abschnitt.",
              "<b>{{admin.set.runNow}}</b> ist eine Aktion, keine Einstellung, es gibt also nichts zu speichern.",
            ],
          },
          {
            title: "Auf den anderen Giftpin-Seiten",
            items: [
              "<b>{{admin.nav.promotions}}</b>: Füllen Sie <b>{{admin.promo.new}}</b> aus und klicken Sie unten im Formular auf <b>{{admin.promo.createBtn}}</b>. <b>{{admin.promo.pause}}</b>, <b>{{admin.promo.resume}}</b> und <b>{{admin.promo.delete}}</b> in der Liste wirken sofort.",
              "<b>{{admin.nav.inStore}}</b>: Klicken Sie unten bei <b>{{admin.ins.start}}</b> auf <b>{{admin.ins.create}}</b>.",
              "<b>{{admin.reg.import}}</b>: Wählen Sie Ihre Datei, klicken Sie auf den Button, der sie prüft, lesen Sie, was passieren wird, und klicken Sie dann auf den erscheinenden Import-Button.",
              "<b>{{admin.nav.registries}}</b>, <b>{{admin.nav.analytics}}</b> und <b>{{admin.nav.overview}}</b> zeigen nur Informationen, es gibt also nichts zu speichern.",
            ],
          },
          {
            title: "Auf der Verwaltungsseite der Listenersteller",
            items: [
              "Listenersteller haben eine eigene Seite, die sich über den privaten Link in ihrer E-Mail öffnet. Sagen Sie ihnen, wo sie speichern müssen: Eine Liste behält nur, was gespeichert wurde.",
              "<b>{{manage.prefs.save}}</b> befindet sich am Ende von <b>{{manage.prefs.settings}}</b>, innerhalb von <b>{{manage.prefs.open}}</b> im unteren Seitenbereich. Es speichert Name, Anlass, Datum, Nachricht, Sprache und wer die Liste sehen darf.",
              "<b>{{manage.save}}</b> in <b>{{manage.ship.title}}</b> speichert die Lieferadresse. Es ist ein eigener Button, getrennt von dem darüber.",
              "<b>{{manage.item.update}}</b> an einem Artikel speichert Menge, Notiz und Kategorie dieses Artikels.",
              "Bei der Ersteinrichtung heißen die Buttons <b>{{manage.setup.saveContinue}}</b> und <b>{{manage.setup.skip}}</b>. Schritt 2, zum Partner, hat stattdessen <b>{{manage.partner.add}}</b> und <b>{{manage.partner.notNow}}</b>.",
            ],
          },
        ],
      },
      {
        title: "Machen Sie es zu Ihrem",
        lede: "Alles auf der Giftpin-Seite Einstellungen.",
        steps: [
          {
            title: "Anlässe auswählen",
            items: [
              "Öffnen Sie <b>{{admin.nav.settings}}</b>. Markieren Sie unter <b>{{admin.set.occasions}}</b>, welche Arten von Listen Kunden erstellen können: Hochzeiten, Babypartys, Geburtstage, Abschlussfeiern, Einweihungsfeiern und mehr.",
              "Markieren Sie <b>{{event.wishlist}}</b> für eine teilbare Liste ohne Termin, etwa eine Weihnachts-Wunschliste. Sie ist ausgeschaltet, bis Sie sie aktivieren.",
              "Drücken Sie auf <b>{{admin.set.save}}</b> (oben rechts).",
            ],
            alts: ["Die Giftpin-Einstellungen mit der Anlassliste und den Optionen für Artikel aus anderen Shops"],
          },
          {
            title: "Artikel aus anderen Shops festlegen",
            items: [
              "Wählen Sie unter <b>{{admin.set.ext}}</b> zwischen <b>{{admin.set.extOn}}</b>, <b>{{admin.set.extCapped}}</b> und <b>{{admin.set.extOff}}</b>.",
              "Sie zu erlauben, ist der Grund, warum Kunden Ihre Liste als ihre Hauptliste wählen. Giftpin schlägt neben jedem fremden Artikel Ihr ähnlichstes Produkt vor.",
            ],
          },
          {
            title: "Festlegen, was bei ausverkauften Produkten passiert",
            items: [
              "Wählen Sie unter <b>{{admin.set.soldOut}}</b> zwischen <b>{{admin.set.soldOutShow}}</b> und <b>{{admin.set.soldOutHide}}</b>.",
              "Giftpin prüft Ihren Lagerbestand live, jedes Mal wenn ein Gast eine Liste öffnet. Der Artikel bleibt immer auf der Liste, kommt also von selbst zurück, wenn Sie nachbestellen.",
            ],
          },
          {
            title: "Aussehen und Sprache an Ihren Shop anpassen",
            items: [
              "Legen Sie unter <b>{{admin.set.appearance}}</b> <b>{{admin.set.buttonLabel}}</b> und <b>{{admin.set.accent}}</b> fest.",
              "<b>{{admin.set.langLabel}}</b> bestimmt die Sprache, die Gäste auf Listenseiten und in E-Mails sehen: Englisch, Französisch, Spanisch, Deutsch oder brasilianisches Portugiesisch.",
              "Der Add-to-registry-Button und die Listen-Links haben im Theme-Editor eigene Einstellungen: Beschriftung, Symbol, Farben, Größe und Abstände.",
              "Damit auch Käufer, die ihre Liste woanders führen, Ihren Button nutzen können, markieren Sie in den Button-Einstellungen <b>Also offer Babylist</b> oder <b>Also offer \"Another registry\"</b> (kopiert den Produktlink für Seiten wie Zola). Der Button fragt dann, welche Liste gemeint ist.",
              "Mit Pro fügt <b>{{admin.set.branding}}</b> Ihr Logo (<b>{{admin.set.logo}}</b>), Ihre Farben und Schrift zu den Listenseiten hinzu und entfernt den Hinweis Powered by Giftpin.",
            ],
            alts: ["Der Abschnitt Erscheinungsbild der Giftpin-Einstellungen mit den Feldern für Button-Beschriftung und Akzentfarbe"],
          },
          {
            title: "Datenschutz festlegen",
            items: [
              "Wählen Sie unter <b>{{admin.set.privacy}}</b>, ob Sie <b>{{admin.set.hideBuyer}}</b> möchten und ob Sie die öffentliche Seite zum Finden von Listen einschalten (<b>{{admin.set.find}}</b>). Dort erscheinen nur Listen, deren Besitzer zugestimmt haben. Sie ist aus, bis Sie sie markieren: Bis dahin fragt der Suchlink in Ihrem Shop die Besucher nach dem Link zur Liste. Eine Liste erscheint dort nur, wenn ihr Besitzer auf seiner Verwaltungsseite unter <b>{{manage.prefs.who}}</b> auch <b>{{manage.vis.public}}</b> wählt.",
            ],
          },
          {
            title: "Vorteile für Listenersteller anbieten (Pro)",
            items: [
              "Schreiben Sie unter <b>{{admin.set.perks}}</b> in <b>{{admin.set.perksLabel}}</b>, was Sie Menschen anbieten, die bei Ihnen eine Liste erstellen, eine Zeile pro Vorteil: kostenlose Geschenkverpackung, ein Geschenk ab einem bestimmten Listenwert und so weiter.",
              "Listenersteller sehen sie beim Erstellen ihrer Liste. Drücken Sie auf <b>{{admin.set.save}}</b>.",
            ],
          },
        ],
      },
      {
        title: "Pro",
        lede: "Optionale Extras für Shops, die mehr wollen.",
        steps: [
          {
            title: "Pro starten",
            items: [
              "Öffnen Sie <b>{{admin.nav.plan}}</b> im Giftpin-Menü und klicken Sie auf den Upgrade-Button. Sie erhalten {{trialDays}} Tage kostenlos zum Testen, danach kostet {{proName}} {{price}} im Monat. <b>{{admin.bill.cancel}}</b> finden Sie auf derselben Seite.",
            ],
          },
          {
            title: "Gruppengeschenke und Fonds",
            items: [
              "Gehen Sie in Ihrem Shopify-Adminbereich zu <b>Products → Gift cards</b> und klicken Sie auf <b>Add a gift card product</b>.",
              "Geben Sie ihr einen Titel und einige Beträge, etwa 25, 50 und 100. Damit sie auf giftpin.app verkauft werden kann, muss mindestens ein Betrag 500 oder weniger in Ihrer Shopwährung sein. Lassen Sie <b>Online Store</b> unter <b>Sales channels and apps</b> aktiviert und klicken Sie auf <b>Save gift card product</b>.",
              "Wählen Sie unter <b>Settings → General → Order processing</b> die Option <b>Automatically fulfill only the gift cards</b>. Shopify verschickt eine Geschenkkarte erst, wenn ihre Bestellung erfüllt ist.",
              "Öffnen Sie in Giftpin <b>{{admin.nav.settings}}</b>. War die Seite schon offen, laden Sie sie neu, damit die neue Geschenkkarte erscheint. Wählen Sie unter <b>{{admin.set.funds}}</b> Ihre Geschenkkarte bei <b>{{admin.set.fundsPick}}</b> und drücken Sie den <b>{{admin.set.save}}</b>-Button dieses Abschnitts.",
              "Registrierende können jetzt auf ihrer Verwaltungsseite einen Geldfonds anlegen: Unter <b>{{manage.fund.title}}</b> geben sie einen Namen und ein Ziel ein und tippen auf <b>{{manage.fund.add}}</b>. Gäste beteiligen sich mit den Beträgen Ihrer Geschenkkarte, für einen Fonds oder ein großes Geschenk.",
            ],
            alts: ["Die Shopify-Seite Create gift card product mit dem Titel Redwood Essentials gift card und Beträgen von 10, 25, 50 und 100", "Giftpin-Einstellungen, Gruppengeschenke und Fonds, mit gewählter Geschenkkarte und markiertem Kästchen zum Listen auf giftpin.app", "Der Bereich Ein Geldfonds auf der Verwaltungsseite einer Liste, mit Feldern für Name, Ziel und Notiz und dem Button Fonds hinzufügen"],
          },
          {
            id: "gift-cards",
            title: "Geschenkkarten auf giftpin.app verkaufen",
            items: [
              "Dafür brauchen Sie Pro und die Geschenkkarte aus dem Schritt davor, ausgewählt bei <b>{{admin.set.fundsPick}}</b>. Steht dort noch <b>{{admin.set.off}}</b>, wird Ihr Shop nicht gelistet und Giftpin zeigt beim Speichern eine Warnung.",
              "Öffnen Sie in Giftpin <b>{{admin.nav.settings}}</b>. Markieren Sie unter <b>{{admin.set.sell}}</b> <b>{{admin.set.listMine}}</b>, ergänzen Sie <b>{{admin.set.blurb}}</b> und drücken Sie den <b>{{admin.set.save}}</b>-Button dieses Abschnitts.",
              "Ihr Shop erscheint nun auf <a href=\"/gift-cards?lang=de\">giftpin.app/gift-cards</a> unter Ihrem Land, und Ihre Listenseiten erhalten einen Link <b>Rather give a gift card?</b>. Käufer erwerben Ihre Geschenkkarte an Ihrer eigenen Kasse, Sie behalten also das Geld und jedes nicht eingelöste Guthaben. So verkaufte Geschenkkarten erscheinen in <b>{{admin.nav.analytics}}</b>.",
              "Giftpin berechnet {{feePct}} % jeder so verkauften Geschenkkarte, über Ihre Shopify-Rechnung, {{holdDays}} Tage nach dem Verkauf, damit eine erstattete Karte nie berechnet wird. Während Ihrer kostenlosen Testphase fällt keine Gebühr an.",
            ],
            alts: ["Die Geschenkkartenseite eines Shops mit Beträgen von 25 $, 50 $, 100 $ und 250 $, einem Feld zum direkten Versand per E-Mail und dem Button In den Warenkorb"],
          },
          {
            title: "Rabatt nach dem Ereignis und automatische E-Mails",
            items: [
              "Schalten Sie unter <b>{{admin.set.after}}</b> <b>{{admin.set.discount}}</b> ein und legen Sie <b>{{admin.set.discountPct}}</b> und <b>{{admin.set.discountDays}}</b> fest.",
              "Wählen Sie unter <b>{{admin.set.emails}}</b> <b>{{admin.set.guestRemind}}</b>, <b>{{admin.set.mostGone}}</b> und <b>{{admin.set.thanks}}</b>.",
              "Drücken Sie auf <b>{{admin.set.save}}</b> (oben rechts). Um sie auszuprobieren, ohne einen Tag zu warten, nutzen Sie <b>{{admin.set.runNow}}</b> am Ende der Einstellungen.",
            ],
          },
          {
            title: "Listen-Aktionen",
            items: [
              "Öffnen Sie <b>{{admin.nav.promotions}}</b>. Wählen Sie unter <b>{{admin.promo.new}}</b> <b>{{admin.promo.typeSale}}</b> oder <b>{{admin.promo.typeCoupon}}</b>, legen Sie Rabatt und Zeitraum fest und klicken Sie auf <b>{{admin.promo.createBtn}}</b>.",
              "Eine Aktion gilt nur für Geschenke, die von einer Listenseite in den Warenkorb gelegt wurden. Dasselbe Produkt, auf dem üblichen Weg gekauft, behält seinen normalen Preis.",
              "Aktionen erscheinen auch auf der Shopify-Seite Discounts, mit einem Namen, der mit „Giftpin:“ beginnt.",
            ],
          },
          {
            title: "Auswertungen und Verkaufsbericht",
            items: [
              "Öffnen Sie <b>{{admin.nav.analytics}}</b> für erstellte Listen, hinzugefügte Artikel und gekaufte Geschenke im Zeitverlauf, wo die Geschenke gekauft wurden, und einen Verkaufsbericht Monat für Monat. <b>{{admin.an.csv}}</b> exportiert den Bericht.",
              "Unter <b>{{admin.nav.registries}}</b> exportieren <b>{{admin.reg.csvRegs}}</b> und <b>{{admin.reg.csvPurch}}</b> Listen und Käufe.",
            ],
          },
          {
            title: "Ladenmodus und Shopify POS",
            items: [
              "Öffnen Sie <b>{{admin.nav.inStore}}</b> im Giftpin-Menü, um die Liste eines Kunden zu finden oder direkt an der Kasse eine für ihn zu erstellen.",
              "Um Listengeschenke in Shopify POS zu kassieren, fügen Sie die Giftpin-Kachel hinzu: Öffnen Sie in Ihrem Shopify-Admin <b>Point of Sale</b>, dann den POS-Editor, wählen Sie <b>Add tile → Apps</b> und Giftpin. Die Produkte müssen im Vertriebskanal Point of Sale veröffentlicht sein. Klicken Sie danach oben rechts auf dem Bildschirm auf <b>Save</b>, sonst erscheint die Kachel nicht.",
              "Listenersteller können in Ihrem Geschäft auch mit dem Smartphone den Barcode eines Produkts scannen, um es hinzuzufügen: Sie öffnen dazu <b>{{manage.scan.open}}</b> auf ihrer Verwaltungsseite. Dafür brauchen Ihre Produkte Barcodes (oder SKUs), und es klappt am besten, wenn ein einzelner Barcode das Bild füllt.",
            ],
          },
        ],
      },
      {
        title: "Weitere Werkzeuge",
        lede: "Kleinere Funktionen, die Ihnen vielleicht noch nicht aufgefallen sind.",
        tint: true,
        steps: [
          {
            title: "Listen aus einer anderen App übernehmen",
            items: [
              "Öffnen Sie <b>{{admin.nav.registries}}</b> und klicken Sie auf <b>{{admin.reg.import}}</b>. Exportieren Sie Ihre Listen aus Ihrer alten App als CSV mit einer Zeile pro Artikel und wählen Sie die Datei unter <b>{{admin.imp.fileLabel}}</b>.",
              "Giftpin ordnet jeden Artikel Ihren Produkten per SKU oder Barcode zu und zeigt vorab, was passieren wird, bevor etwas geändert wird. Markieren Sie <b>{{admin.imp.email}}</b> nur, wenn Ihre Kunden wegen des Wechsels von Ihnen hören wollen.",
            ],
          },
          {
            title: "Listen-Panels im Shopify-Admin",
            items: [
              "Öffnen Sie bei einer Bestellung, einem Kunden oder einer Produktseite in Ihrem Shopify-Admin <b>More actions → Giftpin registry</b>, um zu sehen, zu welcher Liste sie gehört, ob die Person eine hat oder welche Listen das Produkt enthalten.",
              "Wenn Sie es nicht sehen, brauchen die Erweiterungen einmalig ein <code>shopify app deploy</code> aus dem Code der App.",
            ],
          },
          {
            title: "Shopify Flow (Pro)",
            items: [
              "Giftpin fügt Shopify Flow drei Auslöser hinzu: <b>Registry created</b>, <b>Registry event coming up</b> und <b>Registry gift bought</b>. Nutzen Sie sie, um dem Listenersteller zu schreiben, einen Kunden zu markieren oder Ihr Team zu informieren.",
              "Die E-Mail-Adressen der Listenersteller sind für Nachrichten zu ihrer eigenen Liste gedacht. Für Marketing an sie brauchen Sie weiterhin ihre Einwilligung.",
            ],
          },
          {
            title: "Sprachen",
            items: [
              "Gäste und Listenersteller sehen Listenseiten und E-Mails in der Sprache, die Sie unter <b>{{admin.set.appearance}}</b> → <b>{{admin.set.langLabel}}</b> wählen. Giftpins eigene Admin-Seiten folgen der Sprache Ihres Shopify-Admins, wenn Shopify sie an die App weitergibt, sonst der Sprache Ihres Browsers.",
              "Namen und Nachrichten, die Menschen eingeben, sowie Ihre Produkttitel bleiben so, wie sie geschrieben wurden.",
            ],
          },
        ],
      },
    ],
    faqTitle: "Häufige Fragen",
    faq: [
      {
        q: "Wo sehe ich die Listen meiner Kunden?",
        a: "Öffnen Sie Listen im Giftpin-Menü. Übersicht zeigt Umsatz aus Listen, neue Kunden und verschenkte Geschenke.",
      },
      {
        q: "Brauchen Listenersteller oder Gäste ein Konto?",
        a: "Nein. Listenersteller erhalten per E-Mail einen privaten Verwaltungslink, und Gäste brauchen nur den Link zur Liste.",
      },
      {
        q: "Ich habe eine Einstellung geändert und nichts ist passiert.",
        a: "Prüfen Sie, ob Sie auf Speichern gedrückt haben. Im Theme-Editor ist es oben rechts. In den Giftpin-Einstellungen ist es oben rechts und noch einmal unter Automatische E-Mails, und Gruppengeschenke und Fonds hat einen eigenen Speichern-Button.",
      },
      {
        q: "Was passiert mit den Theme-Blöcken, wenn ich deinstalliere?",
        a: "Shopify entfernt beide Giftpin-Blöcke automatisch aus Ihren Themes.",
      },
      {
        q: "Ich komme nicht weiter. Wen kontaktiere ich?",
        a: "Schreiben Sie an support@giftpin.app mit der .myshopify.com-Adresse Ihres Shops und dem, was Sie versucht haben.",
      },
    ],
  },

  registry: {
    eyebrow: "Anleitung zur Liste",
    h1: `Erstellen Sie Ihre Geschenkliste<br><span class="grad-text">und teilen Sie einen einzigen Link</span>`,
    lede: "So erstellen Sie eine Giftpin-Liste, fügen Geschenke aus diesem Shop und von überall sonst hinzu und teilen sie mit Ihren Gästen. Fettgedruckter Text ist genau das, was Sie auf dem Bildschirm sehen.",
    metaTitle: "So erstellen Sie eine Geschenkliste mit Giftpin",
    description:
      "So starten Sie eine Giftpin-Geschenkliste in einem Shop, fügen Geschenke aus diesem Shop und von jeder anderen Website hinzu, teilen sie mit Gästen, speichern Ihre Änderungen und lassen sich Geschenke nach Hause liefern.",
    sections: [
      {
        title: "Los geht's",
        steps: [
          {
            title: "Ihre Liste starten",
            items: [
              "Klicken Sie auf der Website des Shops auf den Link zum Erstellen einer Geschenkliste (standardmäßig <b>Create a gift registry</b>, meist unter dem Header oder im Menü; der Shop kann den Text geändert haben). Sie können auch bei jedem Produkt auf den Add-to-registry-Button (standardmäßig <b>Add to registry</b>) drücken, dann werden Sie gefragt, ob Sie eine starten möchten.",
              "Wählen Sie den Anlass unter <b>{{create.occasion}}</b> und füllen Sie <b>{{create.name}}</b>, <b>{{create.when}}</b>, <b>{{create.yourName}}</b> und <b>{{create.yourEmail}}</b> aus.",
              "Wählen Sie unter <b>{{create.country}}</b> das Land Ihrer Gäste. Giftpin nutzt es, um Shops für Dinge vorzuschlagen, die dieser Shop nicht verkauft.",
              "Schreiben Sie optional <b>{{create.note}}</b> und klicken Sie auf <b>{{create.submit}}</b>.",
            ],
            alts: ["Das Formular zum Erstellen einer Liste mit ausgefülltem Anlass, Listenname, Datum, Name, E-Mail und Land"],
          },
          {
            title: "Bewahren Sie Ihren privaten Link auf",
            items: [
              "Giftpin schickt Ihnen per E-Mail einen privaten Link zur Verwaltung Ihrer Liste. Sie brauchen kein Konto und kein Passwort: Dieser Link ist Ihr Zugang, bewahren Sie die E-Mail also auf. Er funktioniert 90 Tage.",
              "Verloren oder funktioniert er nicht mehr? Geben Sie auf der Seite zum Erstellen einer Liste im Shop unter <b>Schon eine Liste?</b> Ihre E-Mail-Adresse ein und klicken Sie auf <b>{{create.resendButton}}</b>. Der Link, den Sie erhalten, listet alle Listen auf, die Sie mit dieser E-Mail erstellt haben.",
              "Teilen Sie diesen Link nie. Jeder, der ihn hat, kann Ihre Liste bearbeiten. Gäste bekommen einen anderen Link (siehe Teilen unten).",
            ],
            alts: ["Die E-Mail von Giftpin mit dem Button zum Öffnen meiner Liste"],
          },
        ],
      },
      {
        title: "Geschenke hinzufügen",
        lede: "Aus diesem Shop und von jeder anderen Website.",
        tint: true,
        steps: [
          {
            title: "Produkte aus diesem Shop hinzufügen",
            items: [
              "Stöbern Sie im Shop und klicken Sie auf einer beliebigen Produktseite auf <b>Add to registry</b>. Sie sehen <b>Added to your registry</b> und einen Link <b>Back to your registry</b>.",
              "Drücken Sie ihn beim selben Produkt noch einmal, werden Sie gefragt, wie viele Sie insgesamt möchten, damit nichts versehentlich doppelt hinzukommt.",
              "Nutzen Sie ein anderes Smartphone oder einen anderen Computer? Öffnen Sie dort zuerst Ihren privaten Link aus der E-Mail, damit der Button weiß, welche Liste Ihre ist.",
            ],
            alts: ["Eine Produktseite nach dem Drücken von Add to registry mit Added to your registry und einem Link Back to your registry"],
          },
          {
            title: "Geschenke von jeder anderen Website hinzufügen",
            items: [
              "Gehen Sie in Ihrer Liste zu <b>{{manage.addItems}}</b>, fügen Sie die Adresse des Produkts bei <b>{{manage.productLink}}</b> ein und klicken Sie auf <b>{{manage.lookUp}}</b>. Giftpin füllt Name, Foto und Preis aus.",
              "Manche großen Shops blockieren das. Dann geben Sie <b>{{manage.name}}</b> und <b>{{manage.price}}</b> selbst ein und klicken auf <b>{{manage.addToReg}}</b>.",
              "Giftpin zeigt eventuell etwas Ähnliches aus diesem Shop. Klicken Sie auf <b>{{manage.match.swap}}</b>, um es anzusehen, oder behalten Sie Ihren ursprünglichen Artikel.",
            ],
            alts: ["Das Feld Artikel hinzufügen mit einem nachgeschlagenen Target-Link, das Foto, Name und Preis zeigt"],
          },
          {
            title: "Oder die Chrome-Erweiterung nutzen",
            items: [
              `Installieren Sie auf einem Computer <a href="${CHROME}" target="_blank" rel="noopener">die Giftpin-Erweiterung für Chrome</a>.`,
              "Klicken Sie in Ihrer Liste unter <b>{{manage.ext.title}}</b> auf <b>{{manage.ext.copy}}</b>. Öffnen Sie die Erweiterung, fügen Sie den Link bei <b>Manage link</b> ein und klicken Sie auf <b>Connect</b>. Das ist nur einmal nötig.",
              "Öffnen Sie danach auf jeder Produktseite jeder Website die Erweiterung, wählen Sie die <b>Quantity</b> und klicken Sie auf <b>Add to registry</b>.",
            ],
            alts: ["Die Giftpin-Erweiterung auf einer Walmart-Produktseite mit Menge und Add-to-registry-Button"],
          },
          {
            title: "Im Geschäft? Barcode scannen",
            items: [
              "Wenn der Shop es anbietet, öffnen Sie Ihren privaten Link auf dem Smartphone und tippen Sie auf <b>{{manage.scan.open}}</b>. Richten Sie die Kamera auf einen Barcode auf einem Etikett oder einer Verpackung, und das Produkt wird zu Ihrer Liste hinzugefügt.",
              "Erlauben Sie die Kamera, wenn Ihr Smartphone danach fragt. Wenn sie sich nicht öffnet, geben Sie die Nummer unter dem Barcode bei <b>{{manage.scan.codeLabel}}</b> ein und tippen Sie auf <b>{{manage.scan.lookUp}}</b>.",
              "Füllen Sie den Bildschirm mit einem einzelnen Barcode, damit nicht versehentlich ein benachbarter gelesen wird.",
            ],
          },
          {
            title: "Ihre Liste feinabstimmen",
            items: [
              "Öffnen Sie unter <b>{{manage.yourList}}</b> einen beliebigen Artikel, um <b>{{manage.item.qty}}</b> zu ändern, <b>{{manage.item.noteLabel}}</b> hinzuzufügen (etwa eine Größe oder Farbe) oder eine <b>{{manage.item.category}}</b> zu wählen, und klicken Sie dann auf <b>{{manage.item.update}}</b>.",
              "Nicht sicher, was Sie hinzufügen sollen? Tippen Sie auf <b>{{manage.ideas.open}}</b> für Ideen passend zu Ihrem Anlass.",
            ],
            alts: ["Ein Artikel der Liste im Bearbeitungsmodus mit einer Notiz für Gäste, der Menge und der Kategorie"],
          },
        ],
      },
      {
        title: "Teilen",
        steps: [
          {
            title: "Mit Gästen teilen",
            items: [
              "Klicken Sie oben in Ihrer Liste auf <b>{{manage.shareBtn}}</b> und senden Sie den Link per E-Mail, SMS, WhatsApp oder Facebook, oder klicken Sie auf <b>{{manage.copyLink}}</b>.",
              "Lieber einen Code für eine Einladung oder ein Schild? Klicken Sie neben den Teilen-Buttons auf <b>{{manage.qr}}</b> und dann auf <b>{{manage.qr.download}}</b>. Gäste richten die Smartphone-Kamera darauf und öffnen Ihre Liste.",
              "Gäste sehen Ihre Geschenke und was noch gebraucht wird. Sie sehen nie Ihre E-Mail-Adresse oder Anschrift und brauchen kein Konto.",
            ],
            alts: [
              "Der Teilen-Link mit den Buttons Link kopieren, E-Mail, SMS, WhatsApp und Facebook",
              "Was Gäste sehen: die Liste mit einem Shop-Artikel, einem bereits vergebenen Geschenk und einem Artikel von Walmart",
            ],
          },
          {
            title: "Gemeinsam mit jemandem planen",
            items: [
              "Direkt nach dem Erstellen Ihrer Liste fragen wir <b>{{manage.setup.partnerTitle}}</b> Sie können es auch später tun: Klicken Sie auf <b>{{manage.prefs.open}}</b>, scrollen Sie zu <b>{{manage.partner.title}}</b>, geben Sie <b>{{manage.partner.name}}</b> und <b>{{manage.partner.email}}</b> ein und klicken Sie auf <b>{{manage.partner.add}}</b>.",
              "Diese Person erhält einen eigenen privaten Link. Sie kann Geschenke hinzufügen, sehen, was gekauft wurde, und Einstellungen ändern. Ihre E-Mail-Adresse wird Gästen nie angezeigt, und <b>{{manage.partner.remove}}</b> schaltet ihren Link sofort ab.",
            ],
          },
          {
            title: "Festlegen, wer sie sehen darf",
            items: [
              "Klicken Sie unten in Ihrer Liste auf <b>{{manage.prefs.open}}</b>. Nutzen Sie unter <b>{{manage.prefs.settings}}</b> <b>{{manage.prefs.who}}</b>: <b>{{manage.prefs.priv.unlisted}}</b>, <b>{{manage.prefs.priv.password}}</b> oder <b>{{manage.prefs.priv.public}}</b> auf der Seite des Shops zum Finden von Listen (standardmäßig <b>Find a gift registry</b>).",
              "Klicken Sie auf <b>{{manage.prefs.save}}</b>. Im selben Abschnitt können Sie Name, Anlass, Datum und Nachricht ändern. Wenn der Shop es erlaubt, gibt es auch <b>{{manage.lang.label}}</b>.",
            ],
            alts: ["Das Menü Wer darf das sehen mit seinen drei Auswahlmöglichkeiten"],
          },
          {
            title: "Geschenke zu sich nach Hause liefern lassen",
            items: [
              "Direkt nach dem Erstellen Ihrer Liste fragen wir <b>{{manage.setup.shipTitle}}</b> Setzen Sie das Häkchen und geben Sie Ihre Lieferadresse ein, oder überspringen Sie es vorerst.",
              "Um sie später zu ändern, klicken Sie auf <b>{{manage.prefs.open}}</b>, setzen unter <b>{{manage.ship.title}}</b> das Häkchen, geben Ihre Adresse ein und klicken auf <b>{{manage.save}}</b>. Gäste können Geschenke aus diesem Shop dann direkt zu Ihnen schicken.",
              "Jeder Gast entscheidet beim Hinzufügen eines Geschenks zum Warenkorb: zu Ihnen schicken oder an sich selbst senden. Gäste sehen nie Ihre Adresse.",
            ],
            alts: ["Der Abschnitt Gäste dürfen Geschenke an mich senden mit gesetztem Häkchen und ausgefüllter Lieferadresse"],
          },
        ],
      },
      {
        title: "Wo Sie auf Speichern drücken",
        lede: "Eine Liste behält nur, was Sie speichern. Jeder Teil der Seite hat seinen eigenen Button.",
        tint: true,
        steps: [
          {
            title: "Welcher Button was speichert",
            items: [
              "<b>{{manage.prefs.save}}</b> befindet sich am Ende von <b>{{manage.prefs.settings}}</b>, innerhalb von <b>{{manage.prefs.open}}</b> im unteren Seitenbereich. Es speichert Name, Anlass, Datum, Nachricht und wer die Liste sehen darf. Haben Sie etwas geändert und die Seite ohne ihn verlassen, ist die Änderung verloren.",
              "<b>{{manage.save}}</b> in <b>{{manage.ship.title}}</b>, direkt darunter im selben Bereich, speichert Ihre Lieferadresse. Er ist vom Button darüber getrennt, drücken Sie also beide, wenn Sie beides geändert haben.",
              "<b>{{manage.partner.add}}</b> in <b>{{manage.partner.title}}</b>, weiter unten, schickt Ihrem Partner seinen Link und speichert ihn.",
              "<b>{{manage.item.update}}</b> an einem Artikel speichert Menge, Notiz und Kategorie dieses Artikels.",
              "<b>{{manage.addToReg}}</b> speichert einen neuen Artikel, sobald Sie klicken.",
              "Sie sehen <b>{{manage.flash.saved}}</b> weit oben auf der Seite, wenn es geklappt hat.",
            ],
          },
        ],
      },
    ],
    faqTitle: "Häufige Fragen",
    faq: [
      {
        q: "Wie vermeiden Gäste, dasselbe zu kaufen?",
        a: "Bestellungen aus diesem Shop aktualisieren Ihre Liste automatisch. Bei Geschenken von anderen Websites tippen Gäste nach dem Kauf auf Ich habe das gekauft, und der Artikel gilt als vergeben. Wer seine Meinung ändert, kann das 24 Stunden lang rückgängig machen.",
      },
      {
        q: "Woher weiß ich, wer mir was geschenkt hat?",
        a: "Ihre Liste hat eine Übersicht Wer hat was geschenkt für Ihre Dankeskarten, und Giftpin schreibt Ihnen, wenn jemand ein Geschenk kauft.",
      },
      {
        q: "Können sich Gäste an etwas Großem beteiligen?",
        a: "Wenn der Shop es anbietet, ja. Ihre Liste kann einen Artikel in ein Gruppengeschenk verwandeln oder einen Geldfonds für Flitterwochen oder ein Haus führen, bezahlt als Geschenkkarten des Shops.",
      },
      {
        q: "Ich habe etwas geändert, und es wurde nicht übernommen.",
        a: "Drücken Sie den Speichern-Button für diesen Teil der Seite: Änderungen speichern unter Liste & Einstellungen bearbeiten, Speichern unter Gäste dürfen Geschenke an mich senden oder Aktualisieren an einem Artikel.",
      },
      {
        q: "Kann ich meine Liste löschen?",
        a: "Ja. Klicken Sie unten in Ihrer Liste auf Liste & Einstellungen bearbeiten und dann auf Liste löschen. Das entfernt alle Artikel und den Nachweis, wer was gekauft hat, und lässt sich nicht rückgängig machen.",
      },
    ],
  },
};
