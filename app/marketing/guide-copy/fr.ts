import type { RawGuideCopy } from "./types";

const CHROME = "https://chromewebstore.google.com/detail/giftpin-%E2%80%94-add-to-registry/hfmielpmefknpgpekhfehnfdlhiobdkk";

export const fr: RawGuideCopy = {
  ui: {
    language: "Langue",
    shotsNote: "Les captures d'écran montrent la version anglaise des écrans.",
    shopifyNote:
      "Les noms des écrans de Shopify (par exemple Content → Menus) sont indiqués en anglais, comme dans l'administration Shopify en anglais. Dans votre langue, ils peuvent apparaître traduits.",
    finalCta: "Prêt à offrir une liste de cadeaux à vos clients ?",
  },

  setup: {
    eyebrow: "Guide d'installation",
    h1: `Configurez Giftpin<br><span class="grad-text">en une dizaine de minutes</span>`,
    lede: "Tout ce dont un marchand a besoin, de l'installation à la première liste. Le texte en gras est exactement ce que vous verrez à l'écran.",
    metaTitle: "Guide d'installation de Giftpin pour les marchands Shopify",
    description:
      "Comment installer Giftpin, ajouter le bouton et les liens de liste à votre thème Shopify, choisir les occasions et les réglages, trouver chaque bouton Enregistrer et activer les fonctions Pro.",
    sections: [
      {
        title: "Pour commencer",
        steps: [
          {
            title: "Installer Giftpin",
            items: [
              "Ouvrez Giftpin dans la boutique d'applications Shopify et cliquez sur <b>Install</b>.",
              "Approuvez l'écran des autorisations. Giftpin s'ouvre sur sa page <b>{{admin.nav.overview}}</b> dans votre administration Shopify.",
            ],
          },
          {
            title: "Ajouter Giftpin à votre thème",
            items: [
              "Sur <b>{{admin.nav.overview}}</b>, allez à <b>{{admin.theme.title}}</b> et choisissez un thème. Vous pouvez d'abord configurer une copie non publiée.",
              "Cliquez sur <b>{{admin.theme.btnAdd}}</b>. L'éditeur de thème s'ouvre avec le bouton Add to registry déjà ajouté. Faites-le glisser où vous voulez, puis appuyez sur <b>Save</b> en haut à droite de l'éditeur de thème.",
              "De retour dans Giftpin, cliquez sur <b>{{admin.theme.linksAdd}}</b>. Cela ajoute sous votre en-tête les liens pour créer, trouver et gérer une liste. Appuyez sur <b>Save</b> dans l'éditeur de thème.",
              "Facultatif, pour une liste de favoris : cliquez sur <b>{{admin.theme.heartAdd}}</b>. La page produit s'ouvre dans l'éditeur de thème avec un cœur <b>Save for later</b> ajouté. Appuyez sur <b>Save</b>.",
              "Cliquez ensuite sur <b>{{admin.theme.savedAdd}}</b>. Cela ajoute une liste <b>Saved items</b> à votre page panier, pour que les clients retrouvent ce qu'ils ont mis en favori. Appuyez sur <b>Save</b>.",
              "Ces deux blocs ne s'activent pas automatiquement. Tant que vous ne les avez pas ajoutés dans l'éditeur de thème et appuyé sur <b>Save</b>, vos clients ne verront pas de cœur. Les cœurs sont conservés dans le navigateur du client, sans compte : la liste est donc vide sur un nouvel appareil.",
              "Vous préférez les placer vous-même ? Dans l'éditeur de thème, ouvrez la page, cliquez sur <b>Add block</b> (ou <b>Add section</b>), ouvrez le groupe <b>Apps</b> et choisissez <b>Save for later</b> ou <b>Saved items</b>.",
              "Votre thème est ancien (antérieur à Online Store 2.0) ? Les blocs n'y fonctionneront pas, mais vos pages de liste, si : ajoutez un élément de menu qui pointe vers <b>/apps/registry</b> dans <b>Content → Menus</b>.",
            ],
            alts: [
              "La page Aperçu de Giftpin avec la carte Ajouter Giftpin à votre thème et les boutons pour ajouter le bouton aux pages produit et les liens de liste",
              "L'éditeur de thème Shopify avec le bloc Add to registry sélectionné sur une page produit",
            ],
          },
          {
            title: "Vérifier vos pages de liste",
            items: [
              "Sur <b>{{admin.nav.overview}}</b>, sous <b>{{admin.ov.pages}}</b>, cliquez sur <b>{{admin.ov.create}}</b> pour voir la page que vos clients utilisent.",
              "Créez une liste d'essai, ajoutez un produit avec le bouton Add to registry, puis ouvrez le lien invité pour voir ce que voient vos invités.",
              "Chaque liste créée par vos clients apparaît sous <b>{{admin.nav.registries}}</b> dans le menu de Giftpin.",
            ],
            alts: [
              "Une page produit de la boutique avec le bouton Add to registry sous Acheter maintenant, et les liens pour créer, trouver et gérer une liste au-dessus",
              "La page Listes de Giftpin avec deux listes de mariage, leurs articles et leur progression",
            ],
          },
        ],
      },
      {
        title: "Où se trouvent les boutons Enregistrer",
        lede: "Vos changements ne comptent qu'une fois enregistrés, et chaque écran place le bouton à un endroit différent. Voici la liste complète.",
        tint: true,
        steps: [
          {
            title: "Dans l'éditeur de thème Shopify",
            items: [
              "<b>Save</b> se trouve en haut à droite de l'éditeur de thème. Ajouter, déplacer ou modifier un bloc Giftpin ne change rien sur votre boutique en ligne tant que vous n'avez pas appuyé dessus.",
              "Les boutons Giftpin de <b>{{admin.nav.overview}}</b> ouvrent seulement l'éditeur avec le bloc ajouté. Ils ne l'enregistrent pas à votre place.",
            ],
          },
          {
            title: "Sur la page Réglages de Giftpin",
            items: [
              "<b>{{admin.set.save}}</b> se trouve en haut à droite de la page, dans l'en-tête. Il enregistre tout, de <b>{{admin.set.occasions}}</b> jusqu'à <b>{{admin.set.emails}}</b>.",
              "Le même bouton <b>{{admin.set.save}}</b> réapparaît en bas de ce bloc, juste sous <b>{{admin.set.emails}}</b>. Les deux font la même chose : utilisez celui qui est le plus proche.",
              "Vous verrez le message <b>{{admin.set.toast}}</b> en bas de l'écran, et <b>{{admin.set.saved}}</b> à côté du bouton du bas.",
              "<b>{{admin.set.funds}}</b>, qui contient <b>{{admin.set.sell}}</b>, a son propre bouton <b>{{admin.set.save}}</b> au bas de cette section. Le bouton de l'en-tête ne l'enregistre pas : si vous y changez quelque chose, appuyez sur celui de la section.",
              "<b>{{admin.set.runNow}}</b> est une action, pas un réglage : il n'y a rien à enregistrer.",
            ],
          },
          {
            title: "Sur les autres pages de Giftpin",
            items: [
              "<b>{{admin.nav.promotions}}</b> : remplissez <b>{{admin.promo.new}}</b> et cliquez sur <b>{{admin.promo.createBtn}}</b> au bas du formulaire. <b>{{admin.promo.pause}}</b>, <b>{{admin.promo.resume}}</b> et <b>{{admin.promo.delete}}</b> dans la liste agissent immédiatement.",
              "<b>{{admin.nav.inStore}}</b> : cliquez sur <b>{{admin.ins.create}}</b> au bas de <b>{{admin.ins.start}}</b>.",
              "<b>{{admin.reg.import}}</b> : choisissez votre fichier, cliquez sur le bouton qui le vérifie, lisez ce qui va se passer, puis cliquez sur le bouton Importer qui apparaît.",
              "<b>{{admin.nav.registries}}</b>, <b>{{admin.nav.analytics}}</b> et <b>{{admin.nav.overview}}</b> n'affichent que de l'information : il n'y a rien à enregistrer.",
            ],
          },
          {
            title: "Sur la page de gestion d'un inscrit",
            items: [
              "Les inscrits ont leur propre page, ouverte depuis le lien privé reçu par courriel. Dites-leur où enregistrer : une liste ne conserve que ce qui a été enregistré.",
              "<b>{{manage.prefs.save}}</b> se trouve à la fin de <b>{{manage.prefs.settings}}</b>, dans <b>{{manage.prefs.open}}</b>, vers le bas de la page. Il enregistre le nom, l'occasion, la date, le mot, la langue et qui peut voir la liste.",
              "<b>{{manage.save}}</b> dans <b>{{manage.ship.title}}</b> enregistre l'adresse de livraison. C'est un bouton distinct de celui du dessus.",
              "<b>{{manage.item.update}}</b> sur un article enregistre la quantité, la note et la catégorie de cet article.",
              "Pendant la configuration initiale, les boutons sont <b>{{manage.setup.saveContinue}}</b> et <b>{{manage.setup.skip}}</b>. L'étape 2, sur un partenaire, propose plutôt <b>{{manage.partner.add}}</b> et <b>{{manage.partner.notNow}}</b>.",
            ],
          },
        ],
      },
      {
        title: "Personnalisez Giftpin",
        lede: "Tout se passe dans la page Réglages de Giftpin.",
        steps: [
          {
            title: "Choisir vos occasions",
            items: [
              "Ouvrez <b>{{admin.nav.settings}}</b>. Sous <b>{{admin.set.occasions}}</b>, cochez les types de listes que vos clients peuvent créer : mariages, fêtes de naissance, anniversaires, remises de diplômes, pendaisons de crémaillère et plus encore.",
              "Cochez <b>{{event.wishlist}}</b> pour une liste partageable sans date d'événement, comme une liste de souhaits des Fêtes. Elle est désactivée tant que vous ne l'activez pas.",
              "Appuyez sur <b>{{admin.set.save}}</b> (en haut à droite).",
            ],
            alts: ["Les réglages de Giftpin avec la liste des occasions et les choix pour les articles d'autres boutiques"],
          },
          {
            title: "Décider des articles d'autres boutiques",
            items: [
              "Sous <b>{{admin.set.ext}}</b>, choisissez <b>{{admin.set.extOn}}</b>, <b>{{admin.set.extCapped}}</b> ou <b>{{admin.set.extOff}}</b>.",
              "Les autoriser, c'est ce qui pousse les clients à choisir votre liste comme liste principale. Giftpin suggère votre produit le plus proche à côté de chaque article d'ailleurs.",
            ],
          },
          {
            title: "Décider quoi faire quand un produit est épuisé",
            items: [
              "Sous <b>{{admin.set.soldOut}}</b>, choisissez <b>{{admin.set.soldOutShow}}</b> ou <b>{{admin.set.soldOutHide}}</b>.",
              "Giftpin vérifie votre stock en direct chaque fois qu'un invité ouvre une liste. L'article reste toujours sur la liste : il revient donc tout seul quand vous réapprovisionnez.",
            ],
          },
          {
            title: "Adapter l'apparence et la langue à votre boutique",
            items: [
              "Sous <b>{{admin.set.appearance}}</b>, définissez <b>{{admin.set.buttonLabel}}</b> et <b>{{admin.set.accent}}</b>.",
              "<b>{{admin.set.langLabel}}</b> choisit la langue que voient les invités sur les pages de liste et dans les courriels : anglais, français, espagnol, allemand ou portugais du Brésil.",
              "Le bouton Add to registry et les liens de liste ont leurs propres réglages dans l'éditeur de thème : texte, icône, couleurs, taille et espacement.",
              "Pour permettre aux clients qui gardent leur liste ailleurs d'utiliser aussi votre bouton, cochez <b>Also offer Babylist</b> ou <b>Also offer \"Another registry\"</b> (copie le lien du produit pour des sites comme Zola) dans les réglages du bouton. Le bouton demande alors dans quelle liste ajouter.",
              "Avec Pro, <b>{{admin.set.branding}}</b> ajoute votre logo (<b>{{admin.set.logo}}</b>), vos couleurs et votre police aux pages de liste et retire la mention Powered by Giftpin.",
            ],
            alts: ["La section Apparence des réglages de Giftpin avec les champs pour le texte du bouton et la couleur d'accent"],
          },
          {
            title: "Régler la confidentialité",
            items: [
              "Sous <b>{{admin.set.privacy}}</b>, choisissez si vous voulez <b>{{admin.set.hideBuyer}}</b> et si vous activez la page publique de recherche de liste (<b>{{admin.set.find}}</b>). Seules les listes dont le propriétaire est d'accord y figurent. Elle est désactivée tant que vous ne la cochez pas : d'ici là, le lien de recherche de votre boutique demande plutôt aux visiteurs le lien de la liste. Une liste n'y apparaît que si son propriétaire choisit aussi <b>{{manage.vis.public}}</b> sous <b>{{manage.prefs.who}}</b> sur sa page de gestion.",
            ],
          },
          {
            title: "Offrir des avantages aux inscrits (Pro)",
            items: [
              "Sous <b>{{admin.set.perks}}</b>, écrivez ce que vous offrez à ceux qui s'inscrivent chez vous, un par ligne, dans <b>{{admin.set.perksLabel}}</b> : emballage-cadeau gratuit, un cadeau quand la liste atteint un certain total, et ainsi de suite.",
              "Les inscrits les voient pendant qu'ils créent leur liste. Appuyez sur <b>{{admin.set.save}}</b>.",
            ],
          },
        ],
      },
      {
        title: "Pro",
        lede: "Des options pour les boutiques qui veulent aller plus loin.",
        steps: [
          {
            title: "Passer à Pro",
            items: [
              "Ouvrez <b>{{admin.nav.plan}}</b> dans le menu de Giftpin et cliquez sur le bouton de mise à niveau. Vous bénéficiez d'un essai gratuit de {{trialDays}} jours, puis {{proName}} coûte {{price}} par mois. <b>{{admin.bill.cancel}}</b> se trouve sur la même page.",
            ],
          },
          {
            title: "Cadeaux de groupe et cagnottes",
            items: [
              "Dans votre administration Shopify, allez à <b>Products → Gift cards</b> et cliquez sur <b>Add a gift card product</b>.",
              "Donnez-lui un titre et quelques valeurs, comme 25, 50 et 100. Pour la vendre sur giftpin.app, au moins une valeur doit être de 500 ou moins, dans la devise de votre boutique. Laissez <b>Online Store</b> coché sous <b>Sales channels and apps</b> et cliquez sur <b>Save gift card product</b>.",
              "Dans <b>Settings → General → Order processing</b>, choisissez <b>Automatically fulfill only the gift cards</b>. Shopify n'envoie une carte-cadeau qu'une fois la commande traitée.",
              "Dans Giftpin, ouvrez <b>{{admin.nav.settings}}</b>. Si la page était déjà ouverte, rechargez-la pour que la nouvelle carte-cadeau apparaisse. Sous <b>{{admin.set.funds}}</b>, choisissez votre carte-cadeau dans <b>{{admin.set.fundsPick}}</b> et appuyez sur le <b>{{admin.set.save}}</b> de cette section.",
              "Les personnes inscrites peuvent maintenant ajouter une cagnotte depuis leur page de gestion : sous <b>{{manage.fund.title}}</b>, elles lui donnent un nom et un objectif, puis touchent <b>{{manage.fund.add}}</b>. Les invités participent avec les montants de votre carte-cadeau, pour une cagnotte ou un gros cadeau.",
            ],
            alts: ["La page Create gift card product de Shopify avec le titre Redwood Essentials gift card et des valeurs de 10, 25, 50 et 100", "Les réglages de Giftpin, Cadeaux de groupe et cagnottes, avec une carte-cadeau choisie et la case de liste sur giftpin.app cochée", "La section Une cagnotte de la page de gestion d'une liste, avec les champs nom, objectif et note et le bouton Ajouter la cagnotte"],
          },
          {
            id: "gift-cards",
            title: "Vendre des cartes-cadeaux sur giftpin.app",
            items: [
              "Il faut Pro et la carte-cadeau de l'étape précédente, choisie dans <b>{{admin.set.fundsPick}}</b>. Si ce champ indique encore <b>{{admin.set.off}}</b>, votre boutique n'est pas listée et Giftpin affiche un avertissement à l'enregistrement.",
              "Dans Giftpin, ouvrez <b>{{admin.nav.settings}}</b>. Sous <b>{{admin.set.sell}}</b>, cochez <b>{{admin.set.listMine}}</b>, ajoutez <b>{{admin.set.blurb}}</b> et appuyez sur le <b>{{admin.set.save}}</b> de cette section.",
              "Votre boutique apparaît maintenant sur <a href=\"/gift-cards?lang=fr\">giftpin.app/gift-cards</a>, sous votre pays, et vos pages de liste affichent un lien <b>Rather give a gift card?</b>. Les clients achètent votre carte-cadeau à votre propre caisse : vous gardez l'argent et tout solde non dépensé. Les cartes-cadeaux vendues ainsi apparaissent dans <b>{{admin.nav.analytics}}</b>.",
              "Giftpin facture {{feePct}} % de chaque carte-cadeau vendue de cette façon, sur votre facture Shopify, {{holdDays}} jours après la vente, pour qu'une carte remboursée ne soit jamais facturée. Aucuns frais pendant votre essai gratuit.",
            ],
            alts: ["La page carte-cadeau d'une boutique avec des montants de 25 $, 50 $, 100 $ et 250 $, une case pour l'envoyer par courriel et le bouton Ajouter au panier"],
          },
          {
            title: "Rabais après l'événement et courriels automatiques",
            items: [
              "Sous <b>{{admin.set.after}}</b>, activez <b>{{admin.set.discount}}</b> et définissez <b>{{admin.set.discountPct}}</b> et <b>{{admin.set.discountDays}}</b>.",
              "Sous <b>{{admin.set.emails}}</b>, choisissez <b>{{admin.set.guestRemind}}</b>, <b>{{admin.set.mostGone}}</b> et <b>{{admin.set.thanks}}</b>.",
              "Appuyez sur <b>{{admin.set.save}}</b> (en haut à droite). Pour les essayer sans attendre un jour, utilisez <b>{{admin.set.runNow}}</b> au bas des Réglages.",
            ],
          },
          {
            title: "Promotions de liste",
            items: [
              "Ouvrez <b>{{admin.nav.promotions}}</b>. Sous <b>{{admin.promo.new}}</b>, choisissez <b>{{admin.promo.typeSale}}</b> ou <b>{{admin.promo.typeCoupon}}</b>, réglez le rabais et les dates, puis cliquez sur <b>{{admin.promo.createBtn}}</b>.",
              "Une promotion ne s'applique qu'aux cadeaux ajoutés au panier depuis une page de liste. Le même produit acheté de la façon habituelle garde son prix normal.",
              "Les promotions apparaissent aussi dans la page Discounts de Shopify, avec un nom qui commence par « Giftpin: ».",
            ],
          },
          {
            title: "Statistiques et rapport des ventes",
            items: [
              "Ouvrez <b>{{admin.nav.analytics}}</b> pour voir les listes créées, les articles ajoutés et les cadeaux achetés dans le temps, où les cadeaux ont été achetés, et un rapport des ventes mois par mois. <b>{{admin.an.csv}}</b> exporte le rapport.",
              "Sous <b>{{admin.nav.registries}}</b>, <b>{{admin.reg.csvRegs}}</b> et <b>{{admin.reg.csvPurch}}</b> exportent les listes et les achats.",
            ],
          },
          {
            title: "Mode en magasin et Shopify POS",
            items: [
              "Ouvrez <b>{{admin.nav.inStore}}</b> dans le menu de Giftpin pour trouver la liste d'un client ou en créer une pour lui au comptoir.",
              "Pour encaisser des cadeaux de liste dans Shopify POS, ajoutez la tuile Giftpin : dans votre administration Shopify, ouvrez <b>Point of Sale</b>, puis l'éditeur POS, choisissez <b>Add tile → Apps</b> et sélectionnez Giftpin. Les produits doivent être publiés sur le canal Point of Sale. Cliquez ensuite sur <b>Save</b> en haut à droite de l'écran, sinon la tuile n'apparaîtra pas.",
              "Les inscrits peuvent aussi scanner le code-barres d'un produit avec leur téléphone dans votre magasin pour l'ajouter : ils ouvrent <b>{{manage.scan.open}}</b> sur leur page de gestion. Il faut des codes-barres (ou des UGS) sur vos produits, et cela fonctionne mieux avec un seul code-barres bien cadré.",
            ],
          },
        ],
      },
      {
        title: "Autres outils",
        lede: "De petites fonctions que vous n'avez peut-être pas remarquées.",
        tint: true,
        steps: [
          {
            title: "Transférer des listes depuis une autre application",
            items: [
              "Ouvrez <b>{{admin.nav.registries}}</b> et cliquez sur <b>{{admin.reg.import}}</b>. Exportez vos listes depuis votre ancienne application en CSV, une ligne par article, et choisissez le fichier sous <b>{{admin.imp.fileLabel}}</b>.",
              "Giftpin associe chaque article à vos produits par UGS ou code-barres et montre ce qui va se passer avant de rien modifier. Cochez <b>{{admin.imp.email}}</b> seulement si vos clients s'attendent à avoir de vos nouvelles au sujet du changement.",
            ],
          },
          {
            title: "Panneaux de listes dans l'administration Shopify",
            items: [
              "Sur une commande, un client ou une page produit de votre administration Shopify, ouvrez <b>More actions → Giftpin registry</b> pour voir à quelle liste elle appartient, si cette personne en a une, ou quelles listes contiennent le produit.",
              "Si vous ne le voyez pas, les extensions ont besoin d'un <code>shopify app deploy</code> unique, depuis le code de l'application.",
            ],
          },
          {
            title: "Shopify Flow (Pro)",
            items: [
              "Giftpin ajoute trois déclencheurs à Shopify Flow : <b>Registry created</b>, <b>Registry event coming up</b> et <b>Registry gift bought</b>. Utilisez-les pour écrire à l'inscrit, étiqueter un client ou prévenir votre équipe.",
              "Les courriels des inscrits servent aux messages sur leur propre liste. Leur envoyer du marketing exige toujours leur consentement.",
            ],
          },
          {
            title: "Langues",
            items: [
              "Les invités et les inscrits voient les pages de liste et les courriels dans la langue choisie sous <b>{{admin.set.appearance}}</b> → <b>{{admin.set.langLabel}}</b>. Les pages d'administration de Giftpin suivent la langue de votre administration Shopify lorsque Shopify la transmet à l'application, et sinon celle de votre navigateur.",
              "Les noms et les mots saisis par les gens, ainsi que les titres de vos produits, restent tels qu'ils ont été écrits.",
            ],
          },
        ],
      },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Où voir les listes de mes clients ?",
        a: "Ouvrez Listes dans le menu de Giftpin. Aperçu montre les revenus des listes, les nouveaux clients et les cadeaux offerts.",
      },
      {
        q: "Les inscrits ou les invités ont-ils besoin d'un compte ?",
        a: "Non. Les inscrits reçoivent par courriel un lien de gestion privé, et les invités n'ont besoin que du lien de la liste.",
      },
      {
        q: "J'ai changé un réglage et rien ne s'est passé.",
        a: "Vérifiez que vous avez appuyé sur Enregistrer. Dans l'éditeur de thème, le bouton est en haut à droite. Dans les Réglages de Giftpin, il est en haut à droite et de nouveau sous Courriels automatiques, et Cadeaux de groupe et cagnottes a son propre bouton Enregistrer.",
      },
      {
        q: "Que deviennent les blocs du thème si je désinstalle ?",
        a: "Shopify retire automatiquement les deux blocs Giftpin de vos thèmes.",
      },
      {
        q: "Je suis bloqué. Qui contacter ?",
        a: "Écrivez à support@giftpin.app avec l'adresse .myshopify.com de votre boutique et ce que vous essayiez de faire.",
      },
    ],
  },

  registry: {
    eyebrow: "Guide de la liste",
    h1: `Créez votre liste de cadeaux<br><span class="grad-text">et partagez un seul lien</span>`,
    lede: "Comment créer une liste Giftpin, y ajouter des cadeaux de cette boutique et de n'importe où ailleurs, et la partager avec vos invités. Le texte en gras est exactement ce que vous verrez à l'écran.",
    metaTitle: "Comment créer une liste de cadeaux avec Giftpin",
    description:
      "Comment créer une liste de cadeaux Giftpin dans une boutique, y ajouter des cadeaux de cette boutique et de tout autre site, la partager avec vos invités, enregistrer vos changements et vous faire livrer les cadeaux.",
    sections: [
      {
        title: "Pour commencer",
        steps: [
          {
            title: "Créer votre liste",
            items: [
              "Sur le site de la boutique, cliquez sur le lien pour créer une liste de cadeaux (par défaut <b>Create a gift registry</b>, souvent sous l'en-tête ou dans le menu ; la boutique peut avoir changé le texte). Vous pouvez aussi appuyer sur le bouton Add to registry (<b>Add to registry</b> par défaut) sur n'importe quel produit : on vous proposera d'en créer une.",
              "Choisissez l'occasion sous <b>{{create.occasion}}</b>, puis remplissez <b>{{create.name}}</b>, <b>{{create.when}}</b>, <b>{{create.yourName}}</b> et <b>{{create.yourEmail}}</b>.",
              "Sous <b>{{create.country}}</b>, choisissez le pays de vos invités. Giftpin s'en sert pour suggérer des boutiques pour ce que cette boutique ne vend pas.",
              "Écrivez au besoin <b>{{create.note}}</b>, puis cliquez sur <b>{{create.submit}}</b>.",
            ],
            alts: ["Le formulaire de création d'une liste, avec l'occasion, le nom de la liste, la date, le nom, le courriel et le pays remplis"],
          },
          {
            title: "Gardez votre lien privé",
            items: [
              "Giftpin vous envoie par courriel un lien privé pour gérer votre liste. Pas besoin de compte ni de mot de passe : ce lien est votre porte d'entrée, alors gardez le courriel. Il fonctionne pendant 90 jours.",
              "Vous l'avez perdu, ou il ne fonctionne plus ? Sur la page de création d'une liste de la boutique, sous <b>Vous en avez déjà une ?</b>, saisissez votre courriel et cliquez sur <b>{{create.resendButton}}</b>. Le lien reçu affiche toutes les listes que vous avez créées avec ce courriel.",
              "Ne partagez jamais ce lien. Quiconque l'a peut modifier votre liste. Vos invités reçoivent un autre lien (voir Partager plus bas).",
            ],
            alts: ["Le courriel envoyé par Giftpin, avec le bouton pour ouvrir ma liste"],
          },
        ],
      },
      {
        title: "Ajoutez vos cadeaux",
        lede: "Depuis cette boutique, et depuis n'importe quel autre site.",
        tint: true,
        steps: [
          {
            title: "Ajouter les produits de cette boutique",
            items: [
              "Parcourez la boutique et cliquez sur <b>Add to registry</b> sur n'importe quelle page produit. Vous verrez <b>Added to your registry</b> et un lien <b>Back to your registry</b>.",
              "Si vous le pressez de nouveau sur le même produit, on vous demande combien vous en voulez au total : rien n'est ajouté deux fois par accident.",
              "Vous utilisez un autre téléphone ou ordinateur ? Ouvrez-y d'abord votre lien privé reçu par courriel, pour que le bouton sache quelle liste est la vôtre.",
            ],
            alts: ["Une page produit après avoir appuyé sur Add to registry, avec Added to your registry et un lien Back to your registry"],
          },
          {
            title: "Ajouter des cadeaux de n'importe quel autre site",
            items: [
              "Sur votre liste, allez à <b>{{manage.addItems}}</b>, collez l'adresse du produit dans <b>{{manage.productLink}}</b> et cliquez sur <b>{{manage.lookUp}}</b>. Giftpin remplit le nom, la photo et le prix.",
              "Certaines grandes boutiques bloquent cette lecture. Dans ce cas, saisissez vous-même <b>{{manage.name}}</b> et <b>{{manage.price}}</b>, puis cliquez sur <b>{{manage.addToReg}}</b>.",
              "Giftpin peut proposer un produit semblable de cette boutique. Cliquez sur <b>{{manage.match.swap}}</b> pour le voir, ou gardez votre article d'origine.",
            ],
            alts: ["La zone Ajouter des articles avec un lien Target consulté, montrant la photo, le nom et le prix trouvés"],
          },
          {
            title: "Ou utiliser l'extension Chrome",
            items: [
              `Sur un ordinateur, installez <a href="${CHROME}" target="_blank" rel="noopener">l'extension Giftpin pour Chrome</a>.`,
              "Sur votre liste, sous <b>{{manage.ext.title}}</b>, cliquez sur <b>{{manage.ext.copy}}</b>. Ouvrez l'extension, collez le lien dans <b>Manage link</b> et cliquez sur <b>Connect</b>. Vous ne le faites qu'une fois.",
              "Ensuite, sur n'importe quelle page produit de n'importe quel site, ouvrez l'extension, choisissez la <b>Quantity</b> et cliquez sur <b>Add to registry</b>.",
            ],
            alts: ["L'extension Giftpin sur une page produit Walmart, avec la quantité et le bouton Add to registry"],
          },
          {
            title: "En magasin ? Scannez un code-barres",
            items: [
              "Si la boutique le propose, ouvrez votre lien privé sur votre téléphone et touchez <b>{{manage.scan.open}}</b>. Pointez la caméra vers un code-barres sur une étiquette ou une boîte, et le produit est ajouté à votre liste.",
              "Autorisez la caméra quand votre téléphone le demande. Si elle ne s'ouvre pas, saisissez le numéro sous le code-barres dans <b>{{manage.scan.codeLabel}}</b> et touchez <b>{{manage.scan.lookUp}}</b>.",
              "Remplissez l'écran avec un seul code-barres, pour qu'un code voisin ne soit pas lu par erreur.",
            ],
          },
          {
            title: "Peaufiner votre liste",
            items: [
              "Sous <b>{{manage.yourList}}</b>, ouvrez un article pour changer <b>{{manage.item.qty}}</b>, ajouter <b>{{manage.item.noteLabel}}</b> (une taille ou une couleur, par exemple) ou choisir une <b>{{manage.item.category}}</b>, puis cliquez sur <b>{{manage.item.update}}</b>.",
              "Vous ne savez pas quoi ajouter ? Touchez <b>{{manage.ideas.open}}</b> pour des idées adaptées à votre occasion.",
            ],
            alts: ["Un article de la liste ouvert pour modification, avec une note pour les invités, la quantité et la catégorie"],
          },
        ],
      },
      {
        title: "Partagez-la",
        steps: [
          {
            title: "La partager avec vos invités",
            items: [
              "Au haut de votre liste, cliquez sur <b>{{manage.shareBtn}}</b> et envoyez le lien par courriel, message texte, WhatsApp ou Facebook, ou cliquez sur <b>{{manage.copyLink}}</b>.",
              "Vous préférez un code pour une invitation ou une affiche ? Cliquez sur <b>{{manage.qr}}</b> à côté des boutons de partage, puis sur <b>{{manage.qr.download}}</b>. Vos invités pointent la caméra de leur téléphone dessus pour ouvrir votre liste.",
              "Vos invités voient vos cadeaux et ce qu'il reste à offrir. Ils ne voient jamais votre courriel ni votre adresse, et n'ont pas besoin de compte.",
            ],
            alts: [
              "Le lien de partage avec les boutons Copier le lien, Courriel, Message texte, WhatsApp et Facebook",
              "Ce que voient les invités : la liste avec un article de la boutique, un cadeau déjà pris en charge et un article de Walmart",
            ],
          },
          {
            title: "La préparer avec quelqu'un",
            items: [
              "Juste après avoir créé votre liste, on vous demande <b>{{manage.setup.partnerTitle}}</b> Vous pouvez aussi le faire plus tard : cliquez sur <b>{{manage.prefs.open}}</b>, descendez jusqu'à <b>{{manage.partner.title}}</b>, saisissez <b>{{manage.partner.name}}</b> et <b>{{manage.partner.email}}</b>, puis cliquez sur <b>{{manage.partner.add}}</b>.",
              "Cette personne reçoit son propre lien privé. Elle peut ajouter des cadeaux, voir ce qui a été acheté et modifier les réglages. Son courriel n'est jamais montré aux invités, et <b>{{manage.partner.remove}}</b> désactive son lien immédiatement.",
            ],
          },
          {
            title: "Choisir qui peut la voir",
            items: [
              "Au bas de votre liste, cliquez sur <b>{{manage.prefs.open}}</b>. Sous <b>{{manage.prefs.settings}}</b>, utilisez <b>{{manage.prefs.who}}</b> : <b>{{manage.prefs.priv.unlisted}}</b>, <b>{{manage.prefs.priv.password}}</b> ou <b>{{manage.prefs.priv.public}}</b> sur la page de recherche de liste de la boutique (par défaut <b>Find a gift registry</b>).",
              "Cliquez sur <b>{{manage.prefs.save}}</b>. La même section permet de changer le nom, l'occasion, la date et le mot. Si la boutique le permet, il y a aussi <b>{{manage.lang.label}}</b>.",
            ],
            alts: ["Le menu Qui peut voir cette liste avec ses trois choix"],
          },
          {
            title: "Vous faire livrer les cadeaux",
            items: [
              "Juste après avoir créé votre liste, on vous demande <b>{{manage.setup.shipTitle}}</b> Cochez la case et saisissez votre adresse de livraison, ou passez pour l'instant.",
              "Pour la changer plus tard, cliquez sur <b>{{manage.prefs.open}}</b>, puis sous <b>{{manage.ship.title}}</b> cochez la case, saisissez votre adresse et cliquez sur <b>{{manage.save}}</b>. Vos invités peuvent alors vous faire livrer directement les cadeaux achetés dans cette boutique.",
              "Chaque invité décide au moment d'ajouter un cadeau à son panier : le faire livrer chez vous, ou se l'envoyer à lui-même. Vos invités ne voient jamais votre adresse.",
            ],
            alts: ["La section Laisser mes invités me faire livrer les cadeaux, avec la case cochée et une adresse de livraison remplie"],
          },
        ],
      },
      {
        title: "Où appuyer sur Enregistrer",
        lede: "Une liste ne conserve que ce que vous enregistrez. Chaque partie de la page a son propre bouton.",
        tint: true,
        steps: [
          {
            title: "Quel bouton enregistre quoi",
            items: [
              "<b>{{manage.prefs.save}}</b> se trouve à la fin de <b>{{manage.prefs.settings}}</b>, dans <b>{{manage.prefs.open}}</b>, vers le bas de la page. Il enregistre le nom, l'occasion, la date, le mot et qui peut voir la liste. Si vous avez changé quelque chose et quitté sans l'utiliser, le changement est perdu.",
              "<b>{{manage.save}}</b> dans <b>{{manage.ship.title}}</b>, juste en dessous dans le même panneau, enregistre votre adresse de livraison. Il est distinct du bouton précédent : appuyez sur les deux si vous avez changé les deux.",
              "<b>{{manage.partner.add}}</b> dans <b>{{manage.partner.title}}</b>, plus bas, envoie son lien à votre partenaire et l'enregistre.",
              "<b>{{manage.item.update}}</b> sur un article enregistre la quantité, la note et la catégorie de cet article.",
              "<b>{{manage.addToReg}}</b> enregistre un nouvel article dès que vous cliquez.",
              "Vous verrez <b>{{manage.flash.saved}}</b> près du haut de la page quand tout a fonctionné.",
            ],
          },
        ],
      },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Comment les invités évitent-ils d'acheter la même chose ?",
        a: "Les commandes passées dans cette boutique mettent votre liste à jour automatiquement. Pour les cadeaux d'autres sites, les invités touchent J'ai acheté ceci après l'achat, et l'article apparaît comme pris. Un invité qui change d'idée peut annuler pendant 24 heures.",
      },
      {
        q: "Comment savoir qui m'a offert quoi ?",
        a: "Votre liste comporte une liste Qui a offert quoi pour vos cartes de remerciement, et Giftpin vous écrit quand quelqu'un achète un cadeau.",
      },
      {
        q: "Les invités peuvent-ils se cotiser pour un gros cadeau ?",
        a: "Si la boutique le propose, oui. Votre liste peut transformer un article en cadeau de groupe, ou garder une cagnotte pour un voyage de noces ou une maison, payée sous forme de cartes-cadeaux de la boutique.",
      },
      {
        q: "J'ai changé quelque chose et ça n'a pas été conservé.",
        a: "Appuyez sur le bouton Enregistrer de cette partie de la page : Enregistrer les modifications dans Modifier la liste et les préférences, Enregistrer sous Laisser mes invités me faire livrer les cadeaux, ou Mettre à jour sur un article.",
      },
      {
        q: "Puis-je supprimer ma liste ?",
        a: "Oui. Cliquez sur Modifier la liste et les préférences au bas de votre liste, puis sur Supprimer la liste. Cela retire tous les articles et l'historique de qui a acheté quoi, et c'est irréversible.",
      },
    ],
  },
};
