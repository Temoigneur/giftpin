import type { LandingCopy } from "./landing-en";

/** Français. Texte brut (la page l'échappe). Voir landing-en.ts. */
export const landingFr: LandingCopy = {
  faqTitle: "Questions des marchands",

  wedding: {
    title: "App de liste de mariage universelle pour boutiques Shopify | Giftpin",
    description:
      "Offrez à vos futurs mariés une liste de mariage universelle sur votre boutique Shopify : des cadeaux de n'importe quelle boutique sur une seule liste, vos produits suggérés en premier, aucun cadeau en double, et un crédit correct avec Shop Pay, Apple Pay et Google Pay.",
    eyebrow: "Listes de mariage pour Shopify",
    h1a: "Une liste de mariage universelle",
    h1b: "qui commence dans votre boutique.",
    lede: "Les futurs mariés veulent une seule liste pour tout : la vaisselle chez vous, le batteur sur socle ailleurs, les valises du voyage de noces dans une troisième boutique. Giftpin leur offre cela, sur le domaine de votre boutique, avec vos produits suggérés en premier.",
    sections: [
      {
        title: "Pourquoi les futurs mariés choisissent une liste universelle",
        lede: "La plupart des couples s'inscrivent à plus d'un endroit. Une liste limitée à un seul catalogue les pousse à en créer une deuxième ailleurs.",
        cards: [
          { title: "Tous les cadeaux sur une seule liste", detail: "Les futurs mariés collent un lien de presque n'importe quelle boutique en ligne et Giftpin remplit la photo, le nom et le prix." },
          { title: "Un seul lien pour les invités", detail: "Pour le site de mariage, le faire-part ou la discussion de groupe. Sans compte, rien à installer." },
          { title: "Des idées pièce par pièce", detail: "Un guide d'idées pour le mariage aide les couples à remplir leur liste, avec vos produits à un geste." },
        ],
      },
      {
        title: "Pourquoi c'est bon pour votre boutique",
        lede: "Les invités d'un mariage arrivent prêts à acheter. Giftpin les garde sur vos produits.",
        cards: [
          { title: "Votre produit, suggéré en premier", detail: "Quand un couple ajoute un article d'une autre boutique, Giftpin affiche à côté votre produit le plus proche, à remplacer d'un geste." },
          { title: "Crédit avec le paiement express", detail: "Shop Pay, Apple Pay, Google Pay et l'app Shop sautent le panier. Giftpin crédite quand même chaque cadeau à la bonne liste." },
          { title: "Les cadeaux sont livrés aux mariés", detail: "Les invités peuvent envoyer les cadeaux de la boutique directement à l'adresse enregistrée par le couple, que les invités ne voient jamais." },
        ],
      },
      {
        title: "Aucun cadeau de mariage en double",
        lede: "",
        cards: [
          { title: "Réservé pendant qu'un invité achète", detail: "La liste affiche « Quelqu'un est peut-être en train de l'acheter » et libère le cadeau si l'invité ne va pas au bout." },
          { title: "Une progression claire", detail: "Les invités voient en un coup d'œil ce qui est disponible, peut-être pris et déjà offert." },
          { title: "Liste de remerciements incluse", detail: "Le couple reçoit une liste de qui a offert quoi, téléchargeable en tableur." },
        ],
      },
    ],
    faq: [
      { q: "Qu'est-ce qu'une liste de mariage universelle ?", a: "Une seule liste où un couple peut ajouter des cadeaux de n'importe quelle boutique en ligne, au lieu d'une liste distincte dans chaque magasin. Les invités reçoivent un seul lien pour tout." },
      { q: "Une boutique Shopify peut-elle offrir une liste de mariage universelle ?", a: "Oui. Avec Giftpin, les futurs mariés créent leur liste sur votre boutique, y ajoutent vos produits et des cadeaux d'ailleurs, et partagent un seul lien. Vos produits équivalents sont suggérés à côté de tout ce qui vient d'autres boutiques." },
      { q: "Comment évite-t-on les cadeaux de mariage en double ?", a: "Quand un invité va acheter un cadeau, la liste affiche « Quelqu'un est peut-être en train de l'acheter ». Les commandes de votre boutique mettent la liste à jour automatiquement, y compris celles passées avec Shop Pay, Apple Pay et Google Pay." },
    ],
    finalCta: "Offrez à vos couples une liste sans murs.",
  },

  compare: {
    title: "Choisir une app de liste de cadeaux pour Shopify : Giftpin et les apps limitées au catalogue",
    description:
      "Comment Giftpin se compare aux apps de listes limitées à votre propre catalogue : des cadeaux de n'importe quelle boutique, vos produits suggérés en premier, un crédit correct avec Shop Pay et les paiements express, et aucun compte pour les invités.",
    eyebrow: "Choisir une app de listes",
    h1a: "Giftpin et les apps de listes",
    h1b: "limitées au catalogue",
    lede: "Beaucoup d'apps de listes Shopify laissent seulement les clients ajouter vos propres produits. C'est simple, mais ce n'est pas ainsi que les gens font leur liste. Voici ce qui change quand la liste peut tout contenir.",
    sections: [{ title: "Côte à côte", lede: "", cards: [] }],
    table: {
      aria: "Comparaison",
      colCatalog: "Apps de listes limitées au catalogue",
      colGiftpin: "Giftpin",
      rows: [
        { label: "Cadeaux d'autres boutiques", catalogOnly: "Généralement non : votre catalogue seulement", giftpin: "Oui, collés depuis presque n'importe quelle boutique en ligne" },
        { label: "Vos produits quand un cadeau vient d'ailleurs", catalogOnly: "Le couple s'inscrit ailleurs", giftpin: "Votre produit le plus proche suggéré à côté" },
        { label: "Crédit des commandes Shop Pay, Apple Pay et Google Pay", catalogOnly: "Variable", giftpin: "Oui, chaque cadeau crédité au bon article" },
        { label: "Protection contre les doublons pour les cadeaux achetés ailleurs", catalogOnly: "Sans objet", giftpin: "Réservé pendant qu'un invité achète" },
        { label: "Clients dont la liste est sur un autre site", catalogOnly: "Généralement non pris en charge", giftpin: "Votre bouton peut ajouter à Babylist, ou copier le lien pour toute liste qui en accepte un" },
        { label: "Pages de liste sur votre propre domaine", catalogOnly: "Variable", giftpin: "Oui" },
        { label: "Comptes pour les créateurs de liste et les invités", catalogOnly: "Souvent exigés", giftpin: "Inutiles" },
      ],
      note: "« Limitée au catalogue » désigne les apps de listes qui laissent seulement ajouter les produits de la boutique. Les fonctionnalités varient d'une app à l'autre, vérifiez donc chaque fiche.",
    },
    faq: [
      { q: "Que chercher dans une app de listes Shopify ?", a: "Si les couples peuvent ajouter des cadeaux d'autres boutiques, si les paiements express comme Shop Pay sont crédités à la bonne liste, comment les doublons sont évités, et si le tarif prélève une part de vos ventes." },
      { q: "Laisser les créateurs de liste ajouter des produits d'autres boutiques ne me fait-il pas perdre des ventes ?", a: "Ceux qui ne peuvent pas tout ajouter créent souvent une deuxième liste ailleurs et y envoient leurs invités. Giftpin garde toute la liste sur votre boutique et suggère votre produit équivalent à côté de chaque cadeau externe." },
      { q: "Combien coûte Giftpin ?", a: "Le forfait gratuit comprend des listes, des articles et des invités illimités. {pro} coûte {price} par mois avec un {trial}. Aucun des deux forfaits ne prélève une part de vos ventes de produits." },
    ],
    finalCta: "Voyez ce qu'une liste sans murs fait pour votre boutique.",
  },

  app: {
    title: "App de liste de cadeaux pour boutiques Shopify | Giftpin",
    description:
      "Giftpin est une app de liste de cadeaux pour Shopify qui attire de nouveaux clients dans votre boutique : des listes sur votre propre domaine, des cadeaux de n'importe quelle boutique sur une seule liste, vos produits suggérés en premier et aucun cadeau en double.",
    eyebrow: "App de liste de cadeaux pour Shopify",
    h1a: "Une liste de cadeaux pour votre boutique",
    h1b: "qui attire de nouveaux clients.",
    lede: "Chaque liste que vos clients partagent envoie leurs proches dans votre boutique. Giftpin leur offre une seule liste pour tous les cadeaux, garde vos produits au premier plan et empêche les doublons.",
    sections: [
      {
        title: "Comment une liste vous apporte des clients",
        lede: "Le créateur de la liste partage un lien. Tous ceux qui l'ouvrent arrivent dans votre boutique, prêts à acheter.",
        cards: [
          { title: "Un lien, beaucoup d'invités", detail: "Les créateurs de liste la partagent par texto, dans un faire-part ou sur un site de mariage. Chaque invité est un client que vous n'avez pas payé pour atteindre." },
          { title: "Sur votre propre domaine", detail: "Les pages de liste sont sur votre boutique et mènent les invités directement à vos produits et à votre caisse." },
          { title: "Les créateurs de liste reviennent", detail: "Avec {pro}, les créateurs de liste reçoivent après leur événement une remise à usage unique pour vos produits encore sur leur liste." },
        ],
      },
      {
        title: "Conçu pour la façon dont on fait vraiment sa liste",
        lede: "Les créateurs de liste veulent tout sur une seule liste. Giftpin le permet, et met votre catalogue en premier.",
        cards: [
          { title: "Des cadeaux de n'importe quelle boutique", detail: "Ils collent un lien de presque n'importe quelle boutique en ligne, ou l'ajoutent avec l'extension Chrome de Giftpin." },
          { title: "Votre produit, suggéré en premier", detail: "Quand un cadeau vient d'une autre boutique, Giftpin affiche à côté votre produit le plus proche, à remplacer d'un geste." },
          { title: "Aucun cadeau en double", detail: "La liste affiche « Quelqu'un est peut-être en train de l'acheter » pendant qu'un invité règle son achat, et libère le cadeau s'il ne le fait pas." },
        ],
      },
      {
        title: "En place en quelques minutes",
        lede: "",
        cards: [
          { title: "Blocs de thème, sans code", detail: "Ajoutez le bouton Add to registry et les liens de liste dans l'éditeur de thème." },
          { title: "Chaque paiement est crédité", detail: "Les commandes Shop Pay, Apple Pay, Google Pay et de l'app Shop sont créditées au bon article de la liste." },
          { title: "Vos occasions", detail: "Activez ou désactivez les mariages, fêtes prénatales, anniversaires et plus pour votre boutique." },
        ],
      },
    ],
    faq: [
      { q: "Que fait une app de liste de cadeaux pour une boutique Shopify ?", a: "Elle permet aux clients de dresser la liste des cadeaux qu'ils souhaitent pour une occasion et de partager un lien avec leurs proches. Les invités achètent dans votre boutique, et la plupart sont de nouveaux clients." },
      { q: "Quelles occasions Giftpin prend-il en charge ?", a: "Mariages, fêtes prénatales, anniversaires, remises de diplôme, pendaisons de crémaillère, fêtes de fin d'année, nouveaux animaux et plus. Vous choisissez celles que votre boutique propose dans les réglages de Giftpin." },
      { q: "Dois-je modifier le code de mon thème ?", a: "Non. Giftpin ajoute un bouton Add to registry et des liens de liste sous forme de blocs de thème que vous placez dans l'éditeur de thème, et les pages de liste sont sur le domaine de votre boutique." },
      { q: "Combien ça coûte ?", a: "Le forfait gratuit comprend des listes, des articles et des invités illimités. {pro} coûte {price} par mois avec un {trial}. Aucun des deux forfaits ne prélève une part de vos ventes de produits." },
    ],
    finalCta: "Transformez chaque liste en nouveaux clients.",
  },

  baby: {
    title: "App de liste de naissance pour boutiques Shopify | Giftpin",
    description:
      "Offrez aux futurs parents une liste de naissance sur votre boutique Shopify : des cadeaux de n'importe quelle boutique sur une seule liste, vos produits suggérés en premier, des cadeaux livrés aux parents et aucun cadeau en double.",
    eyebrow: "Listes de naissance pour Shopify",
    h1a: "Une liste de naissance",
    h1b: "qui commence dans votre boutique.",
    lede: "Les futurs parents ont besoin de beaucoup de choses, d'un lit de bébé aux gigoteuses, et trouvent rarement tout dans une seule boutique. Giftpin leur permet de créer une liste de naissance avec vos produits et tout ce dont ils ont besoin ailleurs, puis de partager un seul lien.",
    sections: [
      {
        title: "Pourquoi les parents la choisissent",
        lede: "",
        cards: [
          { title: "Tout ce qu'il faut à bébé, sur une seule liste", detail: "Les parents collent un lien de presque n'importe quelle boutique en ligne et Giftpin remplit la photo, le nom et le prix." },
          { title: "Des idées selon les besoins de bébé", detail: "Un guide d'idées pour la liste de naissance couvre le sommeil, les repas, le bain et plus." },
          { title: "Les cadeaux sont livrés chez eux", detail: "Les invités peuvent envoyer des cadeaux de votre boutique directement à l'adresse enregistrée par les parents." },
        ],
      },
      {
        title: "Pourquoi c'est bon pour votre boutique",
        lede: "Les invités d'une fête prénatale sont souvent de la famille qui offre plus d'un cadeau. Giftpin les garde sur vos produits.",
        cards: [
          { title: "Votre produit, suggéré en premier", detail: "Quand les parents ajoutent un article d'une autre boutique, Giftpin affiche à côté votre produit le plus proche, à remplacer d'un geste." },
          { title: "Aucun cadeau en double", detail: "La liste affiche « Quelqu'un est peut-être en train de l'acheter » pendant qu'un invité règle son achat." },
          { title: "Liste de remerciements incluse", detail: "Les parents reçoivent une liste de qui a offert quoi, téléchargeable en tableur." },
          { title: "Déjà sur Babylist ? Bienvenue quand même", detail: "Votre bouton Add to registry peut demander Which registry? et ajouter votre produit à la liste Babylist des parents, pour qu'ils magasinent chez vous dans tous les cas." },
          { title: "Pas de mauvaise surprise de rupture de stock", detail: "Les produits en rupture de stock sont signalés sur les listes, ou masqués jusqu'au retour en stock." },
          { title: "Vous changez d'app de listes ?", detail: "Importez les listes à partir du tableur de votre ancienne app. Les cadeaux déjà achetés restent achetés." },
        ],
      },
    ],
    faq: [
      { q: "Ma boutique Shopify peut-elle offrir une liste de naissance ?", a: "Oui. Avec Giftpin, les futurs parents créent une liste de naissance sur votre boutique, y ajoutent vos produits et tout ce dont ils ont besoin dans d'autres boutiques, et partagent un lien avec leurs proches." },
      { q: "Les cadeaux peuvent-ils être livrés directement aux parents ?", a: "Oui. Les parents enregistrent une adresse de livraison une seule fois, et les invités peuvent leur envoyer des cadeaux de votre boutique directement. Les invités ne voient jamais l'adresse." },
      { q: "Et les parents qui ont déjà une liste Babylist ?", a: "Votre bouton Add to registry peut la proposer. Activez Also offer Babylist dans les réglages du bouton et les clients ont le choix : la liste de votre boutique, ou leur propre liste Babylist, ajoutée grâce au script add-to-Babylist de Babylist. Giftpin n'est pas affilié à Babylist et ne suit pas les achats faits à partir de listes Babylist." },
      { q: "Giftpin aide-t-il les parents à décider quoi ajouter ?", a: "Oui. Un guide d'idées pour la liste de naissance énumère ce dont un nouveau-né a besoin, du sommeil aux repas et au bain, avec vos produits à un geste." },
    ],
    finalCta: "Offrez aux futurs parents une seule liste pour tout.",
  },

  home: {
    title: "App de liste de mariage pour boutiques d'articles de maison et de cuisine | Giftpin",
    description:
      "Offrez des listes de mariage et de pendaison de crémaillère dans votre boutique Shopify d'articles de maison ou de cuisine : les couples ajoutent d'abord vos produits, puis tout le reste d'autres boutiques, et les invités achètent chez vous.",
    eyebrow: "Listes pour les boutiques d'articles de maison",
    h1a: "Une liste de mariage pour votre",
    h1b: "boutique de cuisine et de maison.",
    lede: "Les couples s'inscrivent pour ce que vous vendez : batterie de cuisine, vaisselle, linge de maison, décoration. Giftpin leur permet de créer cette liste sur votre boutique, pour que leurs invités achètent chez vous.",
    sections: [
      {
        title: "Pourquoi les boutiques d'articles de maison s'y prêtent",
        lede: "Les listes de mariage et de pendaison de crémaillère sont surtout des articles de maison. Aujourd'hui, les couples les créent ailleurs.",
        cards: [
          { title: "Un lien, beaucoup d'invités", detail: "Chaque liste envoie les proches du couple dans votre boutique, prêts à acheter." },
          { title: "Sur votre propre domaine", detail: "Les pages de liste sont sur votre boutique et mènent les invités à vos produits et à votre caisse." },
          { title: "Aucun cadeau en double", detail: "La liste affiche « Quelqu'un est peut-être en train de l'acheter » pendant qu'un invité règle son achat." },
        ],
      },
      {
        title: "Vos produits passent en premier",
        lede: "Les couples peuvent encore ajouter ce que vous ne vendez pas, et vous restez en tête de liste.",
        cards: [
          { title: "Votre produit le plus proche, suggéré", detail: "Quand un couple ajoute un article d'une autre boutique, Giftpin affiche à côté votre produit le plus proche." },
          { title: "Une liste complète", detail: "Les couples gardent tout sur une seule liste, sans raison de partir vers une liste plus grande." },
          { title: "Aucun code de thème", detail: "Ajoutez le bouton Add to registry et les liens de liste sous forme de blocs de thème dans l'éditeur de thème." },
        ],
      },
    ],
    faq: [
      { q: "Une boutique d'articles de maison ou de cuisine peut-elle offrir des listes de mariage sur Shopify ?", a: "Oui. Avec Giftpin, les couples créent une liste de mariage ou de pendaison de crémaillère sur votre boutique, y ajoutent votre batterie de cuisine, votre linge et votre vaisselle, et partagent un lien avec leurs invités." },
      { q: "Et si un couple veut quelque chose que je ne vends pas ?", a: "Ils peuvent l'ajouter depuis une autre boutique, pour que la liste reste complète. Giftpin affiche à côté votre produit le plus proche, à remplacer d'un geste, pour que vos produits passent en premier." },
      { q: "Les invités ont-ils besoin d'un compte ?", a: "Non. Les invités ouvrent le lien, voient ce qui est déjà pris et paient dans votre boutique." },
      { q: "Combien ça coûte ?", a: "Le forfait gratuit comprend des listes, des articles et des invités illimités. {pro} coûte {price} par mois avec un {trial}. Aucun des deux forfaits ne prélève une part de vos ventes de produits." },
    ],
    finalCta: "Offrez aux couples une liste qui commence dans votre boutique.",
  },

  holiday: {
    title: "Listes de souhaits des fêtes pour boutiques Shopify de cadeaux et de maison | Giftpin",
    description:
      "Laissez vos clients créer une liste de souhaits de Noël ou des fêtes à partager sur votre boutique Shopify. La famille achète depuis un seul lien, les cadeaux sont marqués comme achetés pour éviter les doublons, et les ventes vont à votre boutique.",
    eyebrow: "Listes de souhaits des fêtes",
    h1a: "Des listes de Noël qui envoient",
    h1b: "la famille dans votre boutique.",
    lede: "Laissez vos clients créer une liste de souhaits des fêtes sur votre boutique et partager un seul lien avec toute la famille. Chaque cadeau est marqué dès qu'il est acheté, pour que personne n'achète en double, et les achats se font à votre caisse.",
    sections: [
      {
        title: "Pourquoi ça marche pour les boutiques de cadeaux et de maison",
        lede: "Les listes des fêtes circulent chez les parents, les grands-parents, les tantes et les amis. Chacune est une raison de visiter votre boutique.",
        cards: [
          { title: "Un lien pour toute la famille", detail: "Les clients partagent leur liste par texto, WhatsApp ou courriel. La famille l'ouvre sur n'importe quel téléphone, sans rien à créer." },
          { title: "Aucun cadeau en double", detail: "Pendant qu'une personne règle son achat, la liste affiche « Quelqu'un est peut-être en train de l'acheter ». Une fois acheté, le cadeau est marqué comme pris." },
          { title: "Vos produits en premier", detail: "La liste est sur le domaine de votre boutique et vos produits sont en tête, achetables d'un geste." },
        ],
      },
      {
        title: "En place en quelques minutes",
        lede: "Aucun code de thème. Si vous utilisez déjà Giftpin pour les listes, il suffit d'une case à cocher.",
        cards: [
          { title: "Cochez Liste de souhaits", detail: "Dans Giftpin, ouvrez Paramètres et cochez Liste de souhaits sous Occasions. Elle n'a pas de date d'événement, donc elle convient à Noël, à Hanoucca, à Diwali ou à n'importe quel moment de l'année." },
          { title: "Ajoutez le bouton", detail: "Le bouton Add to registry se place sur vos pages produit sous forme de bloc de thème, pour que les clients ajoutent vos produits en naviguant." },
          { title: "De la place pour tout", detail: "Autorisez les articles d'autres boutiques et la liste reste complète, avec votre produit le plus proche suggéré à côté de chacun." },
        ],
      },
      {
        title: "Prêt avant le gel du code des fêtes",
        lede: "Beaucoup de boutiques cessent de modifier leur thème avant le Vendredi fou. Activer les listes de souhaits, c'est un réglage de l'app plus un bloc de thème : autant le faire maintenant, avant l'affluence.",
        cards: [],
      },
    ],
    faq: [
      { q: "S'agit-il d'un bouton de liste de souhaits pour garder un produit en réserve ?", a: "Non. Les listes de souhaits de Giftpin sont faites pour être partagées : un client dresse une liste, envoie un lien à sa famille et à ses amis, et les cadeaux sont marqués au fur et à mesure qu'ils sont achetés. Si vous voulez un bouton cœur pour garder des produits à acheter soi-même plus tard, une app de liste de souhaits dédiée convient mieux." },
      { q: "Comment activer les listes de souhaits ?", a: "Dans Giftpin, ouvrez Paramètres, cochez Liste de souhaits sous Occasions et enregistrez. Elle est désactivée tant que vous ne l'activez pas. Les clients choisissent ensuite Liste de souhaits en créant une liste, et il n'y a pas de date d'événement à remplir." },
      { q: "Une liste peut-elle contenir des articles d'autres boutiques ?", a: "Oui, si vous autorisez les articles d'autres boutiques dans les paramètres. Vos propres produits restent en tête de liste, et Giftpin suggère votre produit le plus proche à côté de tout ce qui est ajouté d'ailleurs." },
      { q: "Les membres de la famille ont-ils besoin d'un compte ?", a: "Non. Ils ouvrent le lien, voient ce qui est déjà pris et achètent dans votre boutique avec votre paiement habituel, y compris Shop Pay." },
      { q: "Combien ça coûte ?", a: "Les listes de souhaits sont comprises dans le forfait gratuit, avec des listes, des articles et des invités illimités. {pro} coûte {price} par mois avec un {trial}. Aucun des deux forfaits ne prélève une part de vos ventes de produits." },
    ],
    finalCta: "Offrez à vos clients une liste des fêtes qui commence dans votre boutique.",
  },

  giftCards: {
    title: "Cartes-cadeaux de boutiques Shopify indépendantes | Giftpin",
    description: "Achetez une carte-cadeau d'une boutique indépendante qui utilise Giftpin. Choisissez un montant, payez à la caisse de la boutique et envoyez la carte par courriel.",
    eyebrow: "Cartes-cadeaux",
    h1a: "Des cartes-cadeaux de",
    h1b: "boutiques indépendantes.",
    lede: "Choisissez une boutique, un montant jusqu'à {max} et payez à la caisse de la boutique. La boutique envoie la carte-cadeau par courriel, à vous ou directement à la personne à qui vous l'offrez.",
    emptyH: "Aucune boutique inscrite pour le moment",
    emptyP: "Revenez bientôt. Vous tenez une boutique Shopify ? Vous pourriez être la première.",
    buy: "Acheter une carte-cadeau",
    otherCountries: "Autres pays",
    questions: "Questions",
    merchantLine: 'Vous tenez une boutique Shopify ? <a href="/setup#gift-cards">Voyez comment inscrire vos cartes-cadeaux</a>.',
    faq: [
      { q: "Qui vend la carte-cadeau ?", a: "La boutique. Vous payez à la caisse de cette boutique, et elle envoie la carte-cadeau par courriel. Elle ne peut être utilisée que dans cette boutique." },
      { q: "Puis-je l'envoyer directement à quelqu'un ?", a: "Oui. Cochez « L'envoyer directement par courriel à quelqu'un » et ajoutez son courriel. Utilisez pour cela le bouton de paiement habituel de la boutique, car Shopify envoie la carte à l'acheteur quand vous payez avec Shop Pay." },
      { q: "Comment inscrire ma boutique ici ?", a: "Installez Giftpin sur votre boutique Shopify, ajoutez un produit carte-cadeau et, dans les paramètres de Giftpin, cochez « Lister mes cartes-cadeaux sur giftpin.app ». Cela fait partie de {pro}, avec des frais de {fee} % sur les cartes-cadeaux vendues ainsi (aucun pendant votre essai gratuit). L'argent et tout solde non dépensé restent chez vous." },
    ],
  },
};
