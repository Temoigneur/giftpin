import type { LandingCopy } from "./landing-en";

/** Deutsch (Sie-Form). Reiner Text (die Seite maskiert ihn). Siehe landing-en.ts. */
export const landingDe: LandingCopy = {
  faqTitle: "Fragen von Händlern",

  wedding: {
    title: "Universelle Hochzeitsliste als App für Shopify-Shops | Giftpin",
    description:
      "Bieten Sie Brautpaaren in Ihrem Shopify-Shop eine universelle Hochzeitsliste: Geschenke aus jedem Shop auf einer Liste, Ihre Produkte zuerst vorgeschlagen, keine doppelten Geschenke und korrekte Zuordnung mit Shop Pay, Apple Pay und Google Pay.",
    eyebrow: "Hochzeitslisten für Shopify",
    h1a: "Eine universelle Hochzeitsliste,",
    h1b: "die in Ihrem Shop beginnt.",
    lede: "Brautpaare wollen eine Liste für alles: das Geschirr von Ihnen, die Küchenmaschine von woanders, das Reisegepäck für die Flitterwochen aus einem dritten Shop. Giftpin gibt ihnen das, auf der Domain Ihres Shops und mit Ihren Produkten als erstem Vorschlag.",
    sections: [
      {
        title: "Warum Brautpaare eine universelle Liste wählen",
        lede: "Die meisten Paare legen Wunschlisten an mehreren Orten an. Eine Liste, die auf einen Katalog beschränkt ist, schickt sie dazu, anderswo eine zweite Liste aufzubauen.",
        cards: [
          { title: "Jedes Geschenk auf einer Liste", detail: "Paare fügen den Link aus fast jedem Online-Shop ein, und Giftpin ergänzt Foto, Name und Preis." },
          { title: "Ein Link für die Gäste", detail: "Für die Hochzeitswebsite, die Einladung oder den Gruppenchat. Ohne Konto, nichts zu installieren." },
          { title: "Ideen für jeden Raum", detail: "Ein Ideenführer für Hochzeiten hilft Paaren, ihre Liste zu füllen, mit Ihren Produkten nur einen Tipp entfernt." },
        ],
      },
      {
        title: "Warum das gut für Ihren Shop ist",
        lede: "Hochzeitsgäste kommen kaufbereit. Giftpin hält sie bei Ihren Produkten.",
        cards: [
          { title: "Ihr Produkt, zuerst vorgeschlagen", detail: "Wenn ein Paar etwas aus einem anderen Shop hinzufügt, zeigt Giftpin Ihr ähnlichstes Produkt daneben, mit einem Tipp austauschbar." },
          { title: "Zuordnung beim Express-Checkout", detail: "Shop Pay, Apple Pay, Google Pay und die Shop-App überspringen den Warenkorb. Giftpin ordnet trotzdem jedes Geschenk der richtigen Liste zu." },
          { title: "Geschenke gehen zum Brautpaar", detail: "Gäste können Geschenke aus dem Shop direkt an die vom Paar gespeicherte Adresse schicken, die Gäste nie sehen." },
        ],
      },
      {
        title: "Keine doppelten Hochzeitsgeschenke",
        lede: "",
        cards: [
          { title: "Reserviert, während ein Gast kauft", detail: "Die Liste zeigt „Jemand kauft das vielleicht gerade“ und gibt das Geschenk wieder frei, wenn der Gast den Kauf nicht abschließt." },
          { title: "Klarer Fortschritt", detail: "Gäste sehen auf einen Blick, was verfügbar, vielleicht vergeben und schon geschenkt ist." },
          { title: "Dankesliste inklusive", detail: "Das Paar erhält eine Liste, wer was geschenkt hat, als Tabelle herunterladbar." },
        ],
      },
    ],
    faq: [
      { q: "Was ist eine universelle Hochzeitsliste?", a: "Eine einzige Liste, in der ein Paar Geschenke aus jedem Online-Shop hinzufügen kann, statt einer eigenen Liste in jedem Geschäft. Die Gäste bekommen einen einzigen Link für alles." },
      { q: "Kann ein Shopify-Shop eine universelle Hochzeitsliste anbieten?", a: "Ja. Mit Giftpin legen Paare ihre Liste in Ihrem Shop an, fügen Ihre Produkte und Geschenke von überall hinzu und teilen einen Link. Ihre passenden Produkte werden neben allem vorgeschlagen, was aus anderen Shops hinzugefügt wurde." },
      { q: "Wie werden doppelte Hochzeitsgeschenke vermieden?", a: "Wenn ein Gast ein Geschenk kaufen will, zeigt die Liste „Jemand kauft das vielleicht gerade“. Bestellungen aus Ihrem Shop aktualisieren die Liste automatisch, auch Bestellungen mit Shop Pay, Apple Pay und Google Pay." },
    ],
    finalCta: "Geben Sie Ihren Brautpaaren eine Liste ohne Mauern.",
  },

  compare: {
    title: "Eine Geschenkelisten-App für Shopify auswählen: Giftpin im Vergleich zu Apps nur für den eigenen Katalog",
    description:
      "Wie sich Giftpin von Listen-Apps unterscheidet, die auf Ihren eigenen Katalog beschränkt sind: Geschenke aus jedem Shop, Ihre Produkte zuerst vorgeschlagen, korrekte Zuordnung mit Shop Pay und Express-Checkouts und keine Konten für Gäste.",
    eyebrow: "Eine Listen-App auswählen",
    h1a: "Giftpin im Vergleich zu Listen-Apps",
    h1b: "nur für den eigenen Katalog",
    lede: "Viele Shopify-Listen-Apps lassen nur Ihre eigenen Produkte zu. Das ist einfach, aber so legen Menschen ihre Listen nicht an. Das ändert sich, wenn die Liste alles aufnehmen kann.",
    sections: [{ title: "Im direkten Vergleich", lede: "", cards: [] }],
    table: {
      aria: "Vergleich",
      colCatalog: "Listen-Apps nur für den eigenen Katalog",
      colGiftpin: "Giftpin",
      rows: [
        { label: "Geschenke aus anderen Shops", catalogOnly: "Meist nicht: nur Ihr Katalog", giftpin: "Ja, eingefügt aus fast jedem Online-Shop" },
        { label: "Ihre Produkte, wenn ein Geschenk von woanders kommt", catalogOnly: "Das Paar legt die Liste woanders an", giftpin: "Ihr ähnlichstes Produkt wird daneben vorgeschlagen" },
        { label: "Zuordnung von Bestellungen mit Shop Pay, Apple Pay und Google Pay", catalogOnly: "Unterschiedlich", giftpin: "Ja, jedes Geschenk wird dem richtigen Artikel zugeordnet" },
        { label: "Schutz vor Doppelkäufen bei Geschenken von anderswo", catalogOnly: "Nicht zutreffend", giftpin: "Reserviert, während ein Gast kauft" },
        { label: "Kundinnen und Kunden mit Liste auf einer anderen Seite", catalogOnly: "Meist nicht bedient", giftpin: "Ihr Button kann zu Babylist hinzufügen oder den Link für jede Liste kopieren, die einen annimmt" },
        { label: "Listenseiten auf Ihrer eigenen Domain", catalogOnly: "Unterschiedlich", giftpin: "Ja" },
        { label: "Konten für Listenersteller und Gäste", catalogOnly: "Oft erforderlich", giftpin: "Nicht nötig" },
      ],
      note: "„Nur für den eigenen Katalog“ beschreibt Listen-Apps, mit denen nur die Produkte des jeweiligen Shops hinzugefügt werden können. Die Funktionen unterscheiden sich von App zu App, prüfen Sie daher jeden Eintrag.",
    },
    faq: [
      { q: "Worauf sollte ich bei einer Listen-App für Shopify achten?", a: "Ob Paare Geschenke aus anderen Shops hinzufügen können, ob Express-Checkouts wie Shop Pay der richtigen Liste zugeordnet werden, wie doppelte Geschenke verhindert werden und ob die Preisgestaltung einen Anteil Ihrer Verkäufe einbehält." },
      { q: "Verliere ich nicht Umsatz, wenn Listenersteller Produkte anderer Shops hinzufügen dürfen?", a: "Wer nicht alles hinzufügen kann, baut meist woanders eine zweite Liste auf und schickt die Gäste dorthin. Giftpin hält die ganze Liste in Ihrem Shop und schlägt Ihr passendes Produkt neben jedem externen Geschenk vor." },
      { q: "Was kostet Giftpin?", a: "Der kostenlose Tarif umfasst unbegrenzt viele Listen, Artikel und Gäste. {pro} kostet {price} im Monat, mit dem Angebot „{trial}“. Keiner der Tarife behält einen Anteil Ihrer Produktverkäufe ein." },
    ],
    finalCta: "Sehen Sie, was eine Liste ohne Mauern für Ihren Shop tut.",
  },

  app: {
    title: "Geschenkelisten-App für Shopify-Shops | Giftpin",
    description:
      "Giftpin ist eine Geschenkelisten-App für Shopify, die neue Kundschaft in Ihren Shop bringt: Listen auf Ihrer eigenen Domain, Geschenke aus jedem Shop auf einer Liste, Ihre Produkte zuerst vorgeschlagen und keine doppelten Geschenke.",
    eyebrow: "Geschenkelisten-App für Shopify",
    h1a: "Eine Geschenkeliste für Ihren Shop,",
    h1b: "die neue Kundschaft bringt.",
    lede: "Jede Liste, die Ihre Kundinnen und Kunden teilen, schickt deren Freunde und Familie in Ihren Shop. Giftpin gibt ihnen eine Liste für jedes Geschenk, stellt Ihre Produkte in den Vordergrund und verhindert doppelte Geschenke.",
    sections: [
      {
        title: "Wie eine Liste Ihnen Kundschaft bringt",
        lede: "Wer die Liste anlegt, teilt einen Link. Alle, die ihn öffnen, landen in Ihrem Shop, bereit zum Kaufen.",
        cards: [
          { title: "Ein Link, viele Gäste", detail: "Listenersteller teilen ihre Liste per Nachricht, in einer Einladung oder auf einer Hochzeitswebsite. Jeder Gast ist ein Kunde, den Sie nicht bezahlen mussten." },
          { title: "Auf Ihrer eigenen Domain", detail: "Die Listenseiten liegen in Ihrem Shop und führen Gäste direkt zu Ihren Produkten und Ihrer Kasse." },
          { title: "Listenersteller kommen wieder", detail: "Mit {pro} erhalten Listenersteller nach ihrem Ereignis einen Einmal-Rabatt für Ihre Produkte, die noch auf ihrer Liste stehen." },
        ],
      },
      {
        title: "Gemacht dafür, wie Menschen wirklich Listen anlegen",
        lede: "Listenersteller wollen alles auf einer Liste. Giftpin erlaubt das und stellt Ihren Katalog an die erste Stelle.",
        cards: [
          { title: "Geschenke aus jedem Shop", detail: "Sie fügen den Link aus fast jedem Online-Shop ein oder nehmen ihn mit der Giftpin-Chrome-Erweiterung auf." },
          { title: "Ihr Produkt, zuerst vorgeschlagen", detail: "Wenn ein Geschenk aus einem anderen Shop kommt, zeigt Giftpin Ihr ähnlichstes Produkt daneben, mit einem Tipp austauschbar." },
          { title: "Keine doppelten Geschenke", detail: "Die Liste zeigt „Jemand kauft das vielleicht gerade“, während ein Gast bezahlt, und gibt das Geschenk frei, wenn er es nicht tut." },
        ],
      },
      {
        title: "In Minuten eingerichtet",
        lede: "",
        cards: [
          { title: "Theme-Blöcke, ohne Code", detail: "Fügen Sie den Add-to-registry-Button und die Listen-Links im Theme-Editor hinzu." },
          { title: "Jeder Bezahlvorgang wird zugeordnet", detail: "Bestellungen mit Shop Pay, Apple Pay, Google Pay und der Shop-App werden dem richtigen Listenartikel zugeordnet." },
          { title: "Ihre Anlässe", detail: "Schalten Sie Hochzeiten, Babypartys, Geburtstage und mehr für Ihren Shop ein oder aus." },
        ],
      },
    ],
    faq: [
      { q: "Was bringt eine Geschenkelisten-App einem Shopify-Shop?", a: "Sie lässt Kundinnen und Kunden eine Liste der Geschenke anlegen, die sie sich für einen Anlass wünschen, und einen Link mit Freunden und Familie teilen. Die Gäste kaufen in Ihrem Shop, und die meisten sind Neukunden." },
      { q: "Welche Anlässe unterstützt Giftpin?", a: "Hochzeiten, Babypartys, Geburtstage, Abschlüsse, Einweihungsfeiern, Feiertage, neue Haustiere und mehr. Sie wählen in den Giftpin-Einstellungen, welche Ihr Shop anbietet." },
      { q: "Muss ich den Code meines Themes bearbeiten?", a: "Nein. Giftpin fügt einen Add-to-registry-Button und Listen-Links als Theme-Blöcke hinzu, die Sie im Theme-Editor platzieren, und die Listenseiten liegen auf der Domain Ihres eigenen Shops." },
      { q: "Was kostet es?", a: "Der kostenlose Tarif umfasst unbegrenzt viele Listen, Artikel und Gäste. {pro} kostet {price} im Monat, mit dem Angebot „{trial}“. Keiner der Tarife behält einen Anteil Ihrer Produktverkäufe ein." },
    ],
    finalCta: "Machen Sie aus jeder Liste neue Kundschaft.",
  },

  baby: {
    title: "Babyliste als App für Shopify-Shops | Giftpin",
    description:
      "Bieten Sie werdenden Eltern in Ihrem Shopify-Shop eine Babyliste: Geschenke aus jedem Shop auf einer Liste, Ihre Produkte zuerst vorgeschlagen, Geschenke direkt an die Eltern und keine doppelten Geschenke.",
    eyebrow: "Babylisten für Shopify",
    h1a: "Eine Babyliste,",
    h1b: "die in Ihrem Shop beginnt.",
    lede: "Werdende Eltern brauchen viel, vom Kinderbett bis zum Schlafsack, und finden selten alles in einem Shop. Mit Giftpin legen sie eine Babyliste mit Ihren Produkten und allem anderen an, was sie brauchen, und teilen einen einzigen Link.",
    sections: [
      {
        title: "Warum Eltern sie wählen",
        lede: "",
        cards: [
          { title: "Alles, was das Baby braucht, auf einer Liste", detail: "Eltern fügen den Link aus fast jedem Online-Shop ein, und Giftpin ergänzt Foto, Name und Preis." },
          { title: "Ideen nach dem, was das Baby braucht", detail: "Ein Ideenführer für die Babyliste deckt Schlafen, Füttern, Baden und mehr ab." },
          { title: "Geschenke gehen nach Hause", detail: "Gäste können Geschenke aus Ihrem Shop direkt an die von den Eltern gespeicherte Adresse schicken." },
        ],
      },
      {
        title: "Warum das gut für Ihren Shop ist",
        lede: "Gäste einer Babyparty sind oft Verwandte, die mehr als ein Geschenk kaufen. Giftpin hält sie bei Ihren Produkten.",
        cards: [
          { title: "Ihr Produkt, zuerst vorgeschlagen", detail: "Wenn Eltern etwas aus einem anderen Shop hinzufügen, zeigt Giftpin Ihr ähnlichstes Produkt daneben, mit einem Tipp austauschbar." },
          { title: "Keine doppelten Geschenke", detail: "Die Liste zeigt „Jemand kauft das vielleicht gerade“, während ein Gast bezahlt." },
          { title: "Dankesliste inklusive", detail: "Die Eltern erhalten eine Liste, wer was geschenkt hat, als Tabelle herunterladbar." },
          { title: "Schon bei Babylist? Trotzdem willkommen", detail: "Ihr Add-to-registry-Button kann Which registry? fragen und Ihr Produkt zur Babylist-Liste der Eltern hinzufügen, sodass sie so oder so bei Ihnen einkaufen." },
          { title: "Keine Überraschungen durch Ausverkauftes", detail: "Ausverkaufte Produkte werden auf den Listen markiert oder bis zum Nachschub ausgeblendet." },
          { title: "Sie wechseln die Listen-App?", detail: "Importieren Sie die Listen aus der Tabelle Ihrer alten App. Bereits gekaufte Geschenke bleiben gekauft." },
        ],
      },
    ],
    faq: [
      { q: "Kann mein Shopify-Shop eine Babyliste anbieten?", a: "Ja. Mit Giftpin legen werdende Eltern in Ihrem Shop eine Babyliste an, fügen Ihre Produkte und alles, was sie sonst aus anderen Shops brauchen, hinzu und teilen einen Link mit Familie und Freunden." },
      { q: "Können Geschenke direkt an die Eltern geliefert werden?", a: "Ja. Die Eltern speichern einmal eine Lieferadresse, und Gäste können Geschenke aus Ihrem Shop direkt an sie schicken. Gäste sehen die Adresse nie." },
      { q: "Und Eltern, die schon eine Babylist-Liste haben?", a: "Ihr Add-to-registry-Button kann sie anbieten. Schalten Sie in den Einstellungen des Buttons Also offer Babylist ein, und Kundinnen und Kunden haben die Wahl: die Liste Ihres Shops oder die eigene Babylist-Liste, hinzugefügt über das Add-to-Babylist-Skript von Babylist. Giftpin ist nicht mit Babylist verbunden und verfolgt keine Käufe aus Babylist-Listen." },
      { q: "Hilft Giftpin den Eltern bei der Entscheidung, was sie hinzufügen?", a: "Ja. Ein Ideenführer für die Babyliste nennt, was ein Neugeborenes braucht, von Schlafen und Füttern bis zur Badezeit, mit Ihren Produkten nur einen Tipp entfernt." },
    ],
    finalCta: "Geben Sie werdenden Eltern eine Liste für alles.",
  },

  home: {
    title: "Hochzeitslisten-App für Haushaltswaren- und Küchenshops | Giftpin",
    description:
      "Bieten Sie Hochzeits- und Einweihungslisten in Ihrem Shopify-Shop für Haushaltswaren oder Küche an: Paare fügen zuerst Ihre Produkte hinzu, alles andere aus anderen Shops, und die Gäste kaufen bei Ihnen.",
    eyebrow: "Listen für Haushaltswarenshops",
    h1a: "Eine Hochzeitsliste für Ihren",
    h1b: "Küchen- und Haushaltsshop.",
    lede: "Paare legen sich Wünsche für das an, was Sie verkaufen: Kochgeschirr, Geschirr, Wäsche, Deko. Mit Giftpin bauen sie diese Liste in Ihrem Shop auf, damit ihre Gäste bei Ihnen einkaufen.",
    sections: [
      {
        title: "Warum Haushaltswarenshops gut passen",
        lede: "Hochzeits- und Einweihungslisten bestehen größtenteils aus Haushaltswaren. Heute bauen Paare sie woanders auf.",
        cards: [
          { title: "Ein Link, viele Gäste", detail: "Jede Liste schickt Freunde und Familie des Paares in Ihren Shop, bereit zum Kaufen." },
          { title: "Auf Ihrer eigenen Domain", detail: "Die Listenseiten liegen in Ihrem Shop und führen Gäste zu Ihren Produkten und Ihrer Kasse." },
          { title: "Keine doppelten Geschenke", detail: "Die Liste zeigt „Jemand kauft das vielleicht gerade“, während ein Gast bezahlt." },
        ],
      },
      {
        title: "Ihre Produkte kommen zuerst",
        lede: "Paare können weiterhin hinzufügen, was Sie nicht führen, und Sie bleiben oben auf der Liste.",
        cards: [
          { title: "Ihr ähnlichstes Produkt, vorgeschlagen", detail: "Wenn ein Paar einen Artikel aus einem anderen Shop hinzufügt, zeigt Giftpin Ihr nächstliegendes Produkt daneben." },
          { title: "Eine vollständige Liste", detail: "Paare behalten alles auf einer Liste, sodass sie keinen Grund haben, zu einer größeren Liste zu wechseln." },
          { title: "Kein Theme-Code", detail: "Fügen Sie den Add-to-registry-Button und die Listen-Links als Theme-Blöcke im Theme-Editor hinzu." },
        ],
      },
    ],
    faq: [
      { q: "Kann ein Haushaltswaren- oder Küchenshop auf Shopify Hochzeitslisten anbieten?", a: "Ja. Mit Giftpin legen Paare in Ihrem Shop eine Hochzeits- oder Einweihungsliste an, fügen Ihr Kochgeschirr, Ihre Wäsche und Ihr Geschirr hinzu und teilen einen Link mit ihren Gästen." },
      { q: "Was, wenn ein Paar etwas möchte, das ich nicht führe?", a: "Es kann es aus einem anderen Shop hinzufügen, damit die Liste vollständig bleibt. Giftpin zeigt Ihr ähnlichstes Produkt daneben, mit einem Tipp austauschbar, sodass Ihre Produkte zuerst kommen." },
      { q: "Brauchen Gäste ein Konto?", a: "Nein. Gäste öffnen den Link, sehen, was schon vergeben ist, und bezahlen in Ihrem Shop." },
      { q: "Was kostet es?", a: "Der kostenlose Tarif umfasst unbegrenzt viele Listen, Artikel und Gäste. {pro} kostet {price} im Monat, mit dem Angebot „{trial}“. Keiner der Tarife behält einen Anteil Ihrer Produktverkäufe ein." },
    ],
    finalCta: "Geben Sie Paaren eine Liste, die in Ihrem Shop beginnt.",
  },

  holiday: {
    title: "Wunschlisten zu den Feiertagen für Shopify-Shops für Geschenke und Wohnen | Giftpin",
    description:
      "Lassen Sie Kundinnen und Kunden in Ihrem Shopify-Shop eine teilbare Weihnachts- oder Feiertags-Wunschliste anlegen. Die Familie kauft über einen Link, Geschenke werden als gekauft markiert, damit niemand doppelt kauft, und der Umsatz kommt zu Ihnen.",
    eyebrow: "Wunschlisten zu den Feiertagen",
    h1a: "Weihnachtslisten, die",
    h1b: "die Familie in Ihren Shop schicken.",
    lede: "Lassen Sie Kundinnen und Kunden in Ihrem Shop eine Wunschliste für die Feiertage anlegen und einen Link mit der ganzen Familie teilen. Jedes Geschenk wird beim Kauf markiert, damit niemand doppelt kauft, und eingekauft wird an Ihrer Kasse.",
    sections: [
      {
        title: "Warum das für Geschenke- und Wohnshops funktioniert",
        lede: "Listen zu den Feiertagen werden an Eltern, Großeltern, Tanten und Freunde weitergereicht. Jede ist ein Grund, Ihren Shop zu besuchen.",
        cards: [
          { title: "Ein Link für die ganze Familie", detail: "Kundinnen und Kunden teilen ihre Liste per Nachricht, WhatsApp oder E-Mail. Die Familie öffnet sie auf jedem Handy, ohne sich anzumelden." },
          { title: "Keine doppelten Geschenke", detail: "Während jemand bezahlt, zeigt die Liste „Jemand kauft das vielleicht gerade“. Sobald es gekauft ist, wird es als vergeben markiert." },
          { title: "Ihre Produkte zuerst", detail: "Die Liste liegt auf der Domain Ihres Shops, und Ihre Produkte stehen oben, mit einem Tipp kaufbar." },
        ],
      },
      {
        title: "In Minuten eingerichtet",
        lede: "Kein Theme-Code. Wenn Sie Giftpin schon für Listen nutzen, ist es ein Häkchen.",
        cards: [
          { title: "Wunschliste ankreuzen", detail: "Öffnen Sie in Giftpin die Einstellungen und haken Sie unter Anlässe Wunschliste an. Sie hat kein Ereignisdatum und passt daher zu Weihnachten, Chanukka, Diwali oder jeder anderen Zeit des Jahres." },
          { title: "Button hinzufügen", detail: "Der Add-to-registry-Button kommt als Theme-Block auf Ihre Produktseiten, damit Kundinnen und Kunden Ihre Produkte beim Stöbern hinzufügen." },
          { title: "Platz für alles", detail: "Erlauben Sie Artikel aus anderen Shops, und die Liste bleibt vollständig, mit Ihrem ähnlichsten Produkt neben jedem davon." },
        ],
      },
      {
        title: "Bereit vor Ihrem Code-Freeze zu den Feiertagen",
        lede: "Viele Shops ändern ihr Theme vor dem Black Friday nicht mehr. Wunschlisten einzuschalten ist eine App-Einstellung plus ein Theme-Block, daher lohnt es sich, es jetzt zu tun, vor dem Ansturm.",
        cards: [],
      },
    ],
    faq: [
      { q: "Ist das ein Wunschlisten-Button zum Merken von Produkten für später?", a: "Nein. Giftpin-Wunschlisten sind zum Teilen gemacht: Ein Kunde legt eine Liste an, schickt einen Link an Familie und Freunde, und die Geschenke werden beim Kauf markiert. Wenn Sie einen Herz-Button zum Merken von Produkten für den eigenen späteren Kauf möchten, passt eine eigene Wunschlisten-App besser." },
      { q: "Wie schalte ich Wunschlisten ein?", a: "Öffnen Sie in Giftpin die Einstellungen, haken Sie unter Anlässe Wunschliste an und speichern Sie. Sie ist aus, bis Sie sie einschalten. Kundinnen und Kunden wählen dann beim Anlegen einer Liste Wunschliste, und es ist kein Ereignisdatum auszufüllen." },
      { q: "Kann eine Liste Artikel aus anderen Shops enthalten?", a: "Ja, wenn Sie in den Einstellungen Artikel aus anderen Shops erlauben. Ihre eigenen Produkte bleiben oben auf der Liste, und Giftpin schlägt Ihr ähnlichstes Produkt neben allem vor, was von woanders hinzugefügt wurde." },
      { q: "Brauchen Familienmitglieder ein Konto?", a: "Nein. Sie öffnen den Link, sehen, was schon vergeben ist, und kaufen in Ihrem Shop mit Ihrem normalen Checkout, auch mit Shop Pay." },
      { q: "Was kostet es?", a: "Wunschlisten gehören zum kostenlosen Tarif, mit unbegrenzt vielen Listen, Artikeln und Gästen. {pro} kostet {price} im Monat, mit dem Angebot „{trial}“. Keiner der Tarife behält einen Anteil Ihrer Produktverkäufe ein." },
    ],
    finalCta: "Geben Sie Ihrer Kundschaft eine Feiertagsliste, die in Ihrem Shop beginnt.",
  },

  giftCards: {
    title: "Geschenkkarten von unabhängigen Shopify-Shops | Giftpin",
    description: "Kaufen Sie eine Geschenkkarte bei einem unabhängigen Shop, der Giftpin nutzt. Betrag wählen, an der Kasse des Shops bezahlen und die Karte per E-Mail verschicken.",
    eyebrow: "Geschenkkarten",
    h1a: "Geschenkkarten von",
    h1b: "unabhängigen Shops.",
    lede: "Wählen Sie einen Shop, einen Betrag bis zu {max} und bezahlen Sie an der Kasse des Shops. Der Shop schickt die Geschenkkarte per E-Mail, an Sie oder direkt an die Person, der Sie sie schenken.",
    emptyH: "Noch keine Shops eingetragen",
    emptyP: "Schauen Sie bald wieder vorbei. Sie betreiben einen Shopify-Shop? Sie könnten der Erste sein.",
    buy: "Geschenkkarte kaufen",
    otherCountries: "Andere Länder",
    questions: "Fragen",
    merchantLine: 'Sie betreiben einen Shopify-Shop? <a href="/setup#gift-cards">So tragen Sie Ihre Geschenkkarten ein</a>.',
    faq: [
      { q: "Wer verkauft die Geschenkkarte?", a: "Der Shop. Sie bezahlen an der Kasse dieses Shops, und der Shop schickt die Geschenkkarte per E-Mail. Sie kann nur in diesem Shop eingelöst werden." },
      { q: "Kann ich sie direkt an jemanden schicken?", a: "Ja. Haken Sie „Direkt per E-Mail an jemanden senden“ an und tragen Sie die E-Mail-Adresse ein. Nutzen Sie dafür den normalen Bezahlen-Button des Shops, denn Shopify schickt die Karte an den Käufer, wenn Sie mit Shop Pay bezahlen." },
      { q: "Wie trage ich meinen Shop hier ein?", a: "Installieren Sie Giftpin in Ihrem Shopify-Shop, fügen Sie ein Geschenkkarten-Produkt hinzu und haken Sie in den Giftpin-Einstellungen „Meine Geschenkkarten auf giftpin.app listen“ an. Das gehört zu {pro}, mit einer Gebühr von {fee} % auf so verkaufte Geschenkkarten (keine während Ihrer Testphase). Das Geld und jedes nicht verbrauchte Guthaben bleiben bei Ihnen." },
    ],
  },
};
