import type { RawGuideCopy } from "./types";

const CHROME = "https://chromewebstore.google.com/detail/giftpin-%E2%80%94-add-to-registry/hfmielpmefknpgpekhfehnfdlhiobdkk";

export const es: RawGuideCopy = {
  ui: {
    language: "Idioma",
    shotsNote: "Las capturas de pantalla muestran la versión en inglés de las pantallas.",
    shopifyNote:
      "Los nombres de las pantallas de Shopify (por ejemplo, Online Store → Navigation) aparecen en inglés, como en el administrador de Shopify en inglés. En tu idioma pueden verse traducidos.",
    finalCta: "¿Listo para ofrecer una lista de regalos a tus clientes?",
  },

  setup: {
    eyebrow: "Guía de configuración",
    h1: `Configura Giftpin<br><span class="grad-text">en unos diez minutos</span>`,
    lede: "Todo lo que necesita un comerciante, desde la instalación hasta la primera lista. El texto en negrita es exactamente lo que verás en pantalla.",
    metaTitle: "Guía de configuración de Giftpin para comerciantes de Shopify",
    description:
      "Cómo instalar Giftpin, añadir el botón y los enlaces de lista a tu tema de Shopify, elegir ocasiones y ajustes, encontrar cada botón Guardar y activar las funciones Pro.",
    sections: [
      {
        title: "Primeros pasos",
        steps: [
          {
            title: "Instalar Giftpin",
            items: [
              "Abre Giftpin en la tienda de aplicaciones de Shopify y haz clic en <b>Install</b>.",
              "Aprueba la pantalla de permisos. Giftpin se abre en su página <b>{{admin.nav.overview}}</b> dentro de tu administrador de Shopify.",
            ],
          },
          {
            title: "Añadir Giftpin a tu tema",
            items: [
              "En <b>{{admin.nav.overview}}</b>, ve a <b>{{admin.theme.title}}</b> y elige un tema. Puedes configurar primero una copia sin publicar.",
              "Haz clic en <b>{{admin.theme.btnAdd}}</b>. El editor de temas se abre con el botón Add to registry ya añadido. Arrástralo donde quieras y pulsa <b>Save</b>, arriba a la derecha del editor de temas.",
              "De vuelta en Giftpin, haz clic en <b>{{admin.theme.linksAdd}}</b>. Esto añade bajo tu encabezado los enlaces para crear, buscar y gestionar listas. Pulsa <b>Save</b> en el editor de temas.",
              "Opcional, para una lista de favoritos: haz clic en <b>{{admin.theme.heartAdd}}</b>. La página de producto se abre en el editor de temas con un corazón <b>Save for later</b> añadido. Pulsa <b>Save</b>.",
              "Después haz clic en <b>{{admin.theme.savedAdd}}</b>. Esto añade una lista <b>Saved items</b> a tu página de carrito, para que los compradores encuentren lo que marcaron con el corazón. Pulsa <b>Save</b>.",
              "Estos dos no se activan automáticamente. Hasta que los añadas en el editor de temas y pulses <b>Save</b>, los compradores no verán ningún corazón. Los corazones se guardan en el propio navegador del comprador, sin cuenta, así que la lista aparece vacía en un dispositivo nuevo.",
              "¿Prefieres colocarlos a mano? En el editor de temas, abre la página, haz clic en <b>Add block</b> (o <b>Add section</b>), abre el grupo <b>Apps</b> y elige <b>Save for later</b> o <b>Saved items</b>.",
              "¿Usas un tema antiguo (anterior a Online Store 2.0)? Los bloques no funcionarán ahí, pero tus páginas de lista sí: añade un elemento de menú que apunte a <b>/apps/registry</b> en <b>Online Store → Navigation</b>.",
            ],
            alts: [
              "La página Resumen de Giftpin con la tarjeta Añadir Giftpin a tu tema y los botones para añadir el botón a las páginas de producto y los enlaces de lista",
              "El editor de temas de Shopify con el bloque Add to registry seleccionado en una página de producto",
            ],
          },
          {
            title: "Revisar tus páginas de lista",
            items: [
              "En <b>{{admin.nav.overview}}</b>, bajo <b>{{admin.ov.pages}}</b>, haz clic en <b>{{admin.ov.create}}</b> para ver la página que usan tus clientes.",
              "Crea una lista de prueba, añade un producto con el botón Add to registry y abre el enlace de invitado para ver lo que ven tus invitados.",
              "Cada lista que crean tus clientes aparece en <b>{{admin.nav.registries}}</b>, en el menú de Giftpin.",
            ],
            alts: [
              "Una página de producto de la tienda con el botón Add to registry bajo Comprar ahora, y los enlaces para crear, buscar y gestionar listas arriba",
              "La página Listas de Giftpin con dos listas de boda, sus artículos y su progreso",
            ],
          },
        ],
      },
      {
        title: "Dónde están los botones Guardar",
        lede: "Los cambios solo cuentan cuando los guardas, y cada pantalla pone el botón en un sitio distinto. Esta es la lista completa.",
        tint: true,
        steps: [
          {
            title: "En el editor de temas de Shopify",
            items: [
              "<b>Save</b> está arriba a la derecha del editor de temas. Añadir, mover o cambiar un bloque de Giftpin no hace nada en tu tienda en vivo hasta que lo pulsas.",
              "Los botones de Giftpin en <b>{{admin.nav.overview}}</b> solo abren el editor con el bloque añadido. No lo guardan por ti.",
            ],
          },
          {
            title: "En la página Ajustes de Giftpin",
            items: [
              "<b>{{admin.set.save}}</b> está arriba a la derecha de la página, en el encabezado. Guarda todo, desde <b>{{admin.set.occasions}}</b> hasta <b>{{admin.set.emails}}</b>.",
              "El mismo botón <b>{{admin.set.save}}</b> aparece de nuevo al final de ese bloque, justo debajo de <b>{{admin.set.emails}}</b>. Los dos hacen lo mismo, así que usa el que te quede más cerca.",
              "Verás el mensaje <b>{{admin.set.toast}}</b> en la parte inferior de la pantalla, y <b>{{admin.set.saved}}</b> junto al botón de abajo.",
              "<b>{{admin.set.funds}}</b>, que incluye <b>{{admin.set.sell}}</b>, tiene su propio botón <b>{{admin.set.save}}</b> al final de esa sección. El botón del encabezado no la guarda: si cambias algo ahí, pulsa el de la propia sección.",
              "<b>{{admin.set.runNow}}</b> es una acción, no un ajuste, así que no hay nada que guardar.",
            ],
          },
          {
            title: "En las demás páginas de Giftpin",
            items: [
              "<b>{{admin.nav.promotions}}</b>: rellena <b>{{admin.promo.new}}</b> y haz clic en <b>{{admin.promo.createBtn}}</b> al final del formulario. <b>{{admin.promo.pause}}</b>, <b>{{admin.promo.resume}}</b> y <b>{{admin.promo.delete}}</b> en la lista actúan al instante.",
              "<b>{{admin.nav.inStore}}</b>: haz clic en <b>{{admin.ins.create}}</b> al final de <b>{{admin.ins.start}}</b>.",
              "<b>{{admin.reg.import}}</b>: elige tu archivo, haz clic en el botón que lo comprueba, lee lo que va a hacer y haz clic en el botón de importar que aparece.",
              "<b>{{admin.nav.registries}}</b>, <b>{{admin.nav.analytics}}</b> y <b>{{admin.nav.overview}}</b> solo muestran información, así que no hay nada que guardar.",
            ],
          },
          {
            title: "En la página de gestión de quien crea la lista",
            items: [
              "Quien crea una lista tiene su propia página, que se abre desde el enlace privado de su correo. Dile dónde guardar: una lista solo conserva lo que se guardó.",
              "<b>{{manage.prefs.save}}</b> está al final de <b>{{manage.prefs.settings}}</b>, dentro de <b>{{manage.prefs.open}}</b>, hacia el final de la página. Guarda el nombre, la ocasión, la fecha, la nota, el idioma y quién puede verla.",
              "<b>{{manage.save}}</b> dentro de <b>{{manage.ship.title}}</b> guarda la dirección de envío. Es un botón distinto del anterior.",
              "<b>{{manage.item.update}}</b> en un artículo guarda la cantidad, la nota y la categoría de ese artículo.",
              "Durante la configuración inicial, los botones son <b>{{manage.setup.saveContinue}}</b> y <b>{{manage.setup.skip}}</b>. El paso 2, sobre una pareja, tiene en su lugar <b>{{manage.partner.add}}</b> y <b>{{manage.partner.notNow}}</b>.",
            ],
          },
        ],
      },
      {
        title: "Hazlo tuyo",
        lede: "Todo en la página Ajustes de Giftpin.",
        steps: [
          {
            title: "Elegir tus ocasiones",
            items: [
              "Abre <b>{{admin.nav.settings}}</b>. En <b>{{admin.set.occasions}}</b>, marca los tipos de lista que pueden crear tus clientes: bodas, baby showers, cumpleaños, graduaciones, inauguraciones de casa y más.",
              "Marca <b>{{event.wishlist}}</b> para una lista compartible sin fecha de evento, como una lista de deseos navideña. Está desactivada hasta que la actives.",
              "Pulsa <b>{{admin.set.save}}</b> (arriba a la derecha).",
            ],
            alts: ["Los ajustes de Giftpin con la lista de ocasiones y las opciones para artículos de otras tiendas"],
          },
          {
            title: "Decidir sobre los artículos de otras tiendas",
            items: [
              "En <b>{{admin.set.ext}}</b>, elige <b>{{admin.set.extOn}}</b>, <b>{{admin.set.extCapped}}</b> o <b>{{admin.set.extOff}}</b>.",
              "Permitirlos es lo que hace que los clientes elijan tu lista como la principal. Giftpin sugiere tu producto más parecido junto a cada artículo de fuera.",
            ],
          },
          {
            title: "Decidir qué pasa cuando un producto se agota",
            items: [
              "En <b>{{admin.set.soldOut}}</b>, elige <b>{{admin.set.soldOutShow}}</b> o <b>{{admin.set.soldOutHide}}</b>.",
              "Giftpin comprueba tu inventario en vivo cada vez que un invitado abre una lista. El artículo siempre se queda en la lista, así que vuelve solo cuando repones el stock.",
            ],
          },
          {
            title: "Adaptar el aspecto y el idioma a tu tienda",
            items: [
              "En <b>{{admin.set.appearance}}</b>, define <b>{{admin.set.buttonLabel}}</b> y <b>{{admin.set.accent}}</b>.",
              "<b>{{admin.set.langLabel}}</b> elige el idioma que ven los invitados en las páginas de lista y en los correos: inglés, francés, español, alemán o portugués de Brasil.",
              "El botón Add to registry y los enlaces de lista tienen sus propios ajustes en el editor de temas: texto, icono, colores, tamaño y espaciado.",
              "Para que los compradores que tienen su lista en otro sitio también puedan usar tu botón, marca <b>Also offer Babylist</b> o <b>Also offer \"Another registry\"</b> (copia el enlace del producto para sitios como Zola) en los ajustes del botón. El botón preguntará entonces en qué lista.",
              "Con Pro, <b>{{admin.set.branding}}</b> añade tu logotipo (<b>{{admin.set.logo}}</b>), colores y tipografía a las páginas de lista y quita el crédito Powered by Giftpin.",
            ],
            alts: ["La sección Apariencia de los ajustes de Giftpin con los campos de texto del botón y color de acento"],
          },
          {
            title: "Configurar la privacidad",
            items: [
              "En <b>{{admin.set.privacy}}</b>, elige si quieres <b>{{admin.set.hideBuyer}}</b> y si activas la página pública para buscar listas (<b>{{admin.set.find}}</b>). Solo aparecen allí las listas cuyos dueños lo aceptan. Está desactivada hasta que la marques: hasta entonces, el enlace de búsqueda de tu tienda pide a los visitantes el enlace de la lista.",
            ],
          },
          {
            title: "Ofrecer ventajas a quienes crean listas (Pro)",
            items: [
              "En <b>{{admin.set.perks}}</b>, escribe lo que ofreces a quienes crean su lista contigo, uno por línea, en <b>{{admin.set.perksLabel}}</b>: envoltorio de regalo gratis, un regalo cuando la lista llegue a cierto total, etcétera.",
              "Lo ven mientras crean su lista. Pulsa <b>{{admin.set.save}}</b>.",
            ],
          },
        ],
      },
      {
        title: "Pro",
        lede: "Extras opcionales para las tiendas que quieren más.",
        steps: [
          {
            title: "Activar Pro",
            items: [
              "Abre <b>{{admin.nav.plan}}</b> en el menú de Giftpin y haz clic en el botón de mejora. Tienes una prueba gratuita de {{trialDays}} días y después {{proName}} cuesta {{price}} al mes. <b>{{admin.bill.cancel}}</b> está en la misma página.",
            ],
          },
          {
            title: "Regalos en grupo y fondos",
            items: [
              "En tu administración de Shopify, ve a <b>Products → Gift cards</b> y haz clic en <b>Add a gift card product</b>.",
              "Ponle un título y algunos importes, como 25, 50 y 100. Para venderla en giftpin.app, al menos uno debe ser de 500 o menos, en la moneda de tu tienda. Deja marcado <b>Online Store</b> en <b>Sales channels and apps</b> y haz clic en <b>Save gift card product</b>.",
              "En <b>Settings → General → Order processing</b>, elige <b>Automatically fulfill only the gift cards</b>. Shopify solo envía una tarjeta de regalo cuando se completa su pedido.",
              "En Giftpin, abre <b>{{admin.nav.settings}}</b>. Si ya estaba abierta, recarga la página para que aparezca la nueva tarjeta de regalo. En <b>{{admin.set.funds}}</b>, elige tu tarjeta de regalo en <b>{{admin.set.fundsPick}}</b> y pulsa el <b>{{admin.set.save}}</b> de esa sección.",
              "Ahora quien crea la lista puede añadir un fondo desde su página de gestión: en <b>{{manage.fund.title}}</b>, le pone un nombre y una meta y toca <b>{{manage.fund.add}}</b>. Los invitados aportan con los importes de tu tarjeta de regalo, para un fondo o un regalo grande.",
            ],
            alts: ["La página Create gift card product de Shopify con el título Redwood Essentials gift card e importes de 10, 25, 50 y 100", "Ajustes de Giftpin, Regalos en grupo y fondos, con una tarjeta de regalo elegida y la casilla de listarla en giftpin.app marcada", "La sección Un fondo en efectivo de la página de gestión de una lista, con los campos de nombre, meta y nota y el botón Añadir fondo"],
          },
          {
            id: "gift-cards",
            title: "Vender tarjetas de regalo en giftpin.app",
            items: [
              "Necesitas Pro y la tarjeta de regalo del paso anterior, elegida en <b>{{admin.set.fundsPick}}</b>. Si ahí sigue diciendo <b>{{admin.set.off}}</b>, tu tienda no aparece y Giftpin muestra un aviso al guardar.",
              "En Giftpin, abre <b>{{admin.nav.settings}}</b>. En <b>{{admin.set.sell}}</b>, marca <b>{{admin.set.listMine}}</b>, añade <b>{{admin.set.blurb}}</b> y pulsa el <b>{{admin.set.save}}</b> de esa sección.",
              "Tu tienda aparece ahora en <a href=\"/gift-cards?lang=es\">giftpin.app/gift-cards</a>, bajo tu país, y tus páginas de lista muestran un enlace <b>Rather give a gift card?</b>. Los compradores adquieren tu tarjeta de regalo en tu propio pago, así que te quedas con el dinero y con cualquier saldo sin gastar. Las tarjetas vendidas así aparecen en <b>{{admin.nav.analytics}}</b>.",
              "Giftpin cobra el {{feePct}} % de cada tarjeta de regalo vendida de esta forma, en tu factura de Shopify, {{holdDays}} días después de la venta, para que una tarjeta reembolsada nunca se cobre. No hay comisión durante tu prueba gratuita.",
            ],
            alts: ["La página de tarjeta de regalo de una tienda con importes de 25 $, 50 $, 100 $ y 250 $, una casilla para enviarla por correo y el botón Añadir al carrito"],
          },
          {
            title: "Descuento posterior al evento y correos automáticos",
            items: [
              "En <b>{{admin.set.after}}</b>, activa <b>{{admin.set.discount}}</b> y define <b>{{admin.set.discountPct}}</b> y <b>{{admin.set.discountDays}}</b>.",
              "En <b>{{admin.set.emails}}</b>, elige <b>{{admin.set.guestRemind}}</b>, <b>{{admin.set.mostGone}}</b> y <b>{{admin.set.thanks}}</b>.",
              "Pulsa <b>{{admin.set.save}}</b> (arriba a la derecha). Para probarlos sin esperar un día, usa <b>{{admin.set.runNow}}</b> al final de Ajustes.",
            ],
          },
          {
            title: "Promociones de listas",
            items: [
              "Abre <b>{{admin.nav.promotions}}</b>. En <b>{{admin.promo.new}}</b>, elige <b>{{admin.promo.typeSale}}</b> o <b>{{admin.promo.typeCoupon}}</b>, define el descuento y las fechas y haz clic en <b>{{admin.promo.createBtn}}</b>.",
              "Una promoción solo se aplica a los regalos añadidos al carrito desde una página de lista. El mismo producto comprado de la forma habitual mantiene su precio normal.",
              "Las promociones también aparecen en la página Discounts de Shopify, con un nombre que empieza por «Giftpin:».",
            ],
          },
          {
            title: "Analíticas e informe de ventas",
            items: [
              "Abre <b>{{admin.nav.analytics}}</b> para ver las listas creadas, los artículos añadidos y los regalos comprados a lo largo del tiempo, dónde se compraron los regalos y un informe de ventas mes a mes. <b>{{admin.an.csv}}</b> exporta el informe.",
              "En <b>{{admin.nav.registries}}</b>, <b>{{admin.reg.csvRegs}}</b> y <b>{{admin.reg.csvPurch}}</b> exportan las listas y las compras.",
            ],
          },
          {
            title: "Modo en tienda y Shopify POS",
            items: [
              "Abre <b>{{admin.nav.inStore}}</b> en el menú de Giftpin para encontrar la lista de un cliente o crearla por él en el mostrador.",
              "Para cobrar regalos de lista en Shopify POS, añade el icono de Giftpin: en tu administrador de Shopify, abre <b>Point of Sale</b>, luego el editor de POS, elige <b>Add tile → Apps</b> y selecciona Giftpin. Los productos deben estar publicados en el canal Point of Sale.",
              "Quienes crean listas también pueden escanear con el teléfono el código de barras de un producto en tu tienda para añadirlo: abren <b>{{manage.scan.open}}</b> en su página de gestión. Hacen falta códigos de barras (o SKU) en tus productos, y funciona mejor con un solo código bien encuadrado.",
            ],
          },
        ],
      },
      {
        title: "Más herramientas",
        lede: "Funciones pequeñas que quizá no hayas notado.",
        tint: true,
        steps: [
          {
            title: "Traer listas desde otra aplicación",
            items: [
              "Abre <b>{{admin.nav.registries}}</b> y haz clic en <b>{{admin.reg.import}}</b>. Exporta tus listas desde tu aplicación anterior como CSV, con una fila por artículo, y elige el archivo en <b>{{admin.imp.fileLabel}}</b>.",
              "Giftpin asocia cada artículo con tus productos por SKU o código de barras y muestra lo que va a hacer antes de cambiar nada. Marca <b>{{admin.imp.email}}</b> solo si tus clientes esperan saber de ti por el cambio.",
            ],
          },
          {
            title: "Paneles de listas en el administrador de Shopify",
            items: [
              "En un pedido, un cliente o una página de producto de tu administrador de Shopify, abre <b>More actions → Giftpin registry</b> para ver a qué lista pertenece, si esa persona tiene una, o qué listas incluyen el producto.",
              "Si no lo ves, las extensiones necesitan un <code>shopify app deploy</code> una sola vez, desde el código de la aplicación.",
            ],
          },
          {
            title: "Shopify Flow (Pro)",
            items: [
              "Giftpin añade tres disparadores a Shopify Flow: <b>Registry created</b>, <b>Registry event coming up</b> y <b>Registry gift bought</b>. Úsalos para escribir a quien creó la lista, etiquetar a un cliente o avisar a tu equipo.",
              "Los correos de quienes crean listas son para mensajes sobre su propia lista. Enviarles marketing sigue requiriendo su consentimiento.",
            ],
          },
          {
            title: "Idiomas",
            items: [
              "Los invitados y quienes crean listas ven las páginas de lista y los correos en el idioma que elijas en <b>{{admin.set.appearance}}</b> → <b>{{admin.set.langLabel}}</b>. Las páginas de administración de Giftpin siguen el idioma de tu administrador de Shopify cuando Shopify lo comparte con la aplicación y, si no, el de tu navegador.",
              "Los nombres y notas que escribe la gente, y los títulos de tus productos, se quedan como se escribieron.",
            ],
          },
        ],
      },
    ],
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        q: "¿Dónde veo las listas de mis clientes?",
        a: "Abre Listas en el menú de Giftpin. Resumen muestra los ingresos de las listas, los clientes nuevos y los regalos hechos.",
      },
      {
        q: "¿Necesitan cuenta quienes crean listas o los invitados?",
        a: "No. Quien crea la lista recibe por correo un enlace privado de gestión, y los invitados solo necesitan el enlace de la lista.",
      },
      {
        q: "Cambié un ajuste y no pasó nada.",
        a: "Comprueba que pulsaste Guardar. En el editor de temas está arriba a la derecha. En los Ajustes de Giftpin está arriba a la derecha y otra vez debajo de Correos automáticos, y Regalos en grupo y fondos tiene su propio botón Guardar.",
      },
      {
        q: "¿Qué pasa con los bloques del tema si desinstalo?",
        a: "Shopify quita automáticamente los dos bloques de Giftpin de tus temas.",
      },
      {
        q: "Estoy atascado. ¿A quién contacto?",
        a: "Escribe a support@giftpin.app con la dirección .myshopify.com de tu tienda y lo que intentabas hacer.",
      },
    ],
  },

  registry: {
    eyebrow: "Guía de la lista",
    h1: `Crea tu lista de regalos<br><span class="grad-text">y comparte un solo enlace</span>`,
    lede: "Cómo crear una lista de Giftpin, añadir regalos de esta tienda y de cualquier otra y compartirla con tus invitados. El texto en negrita es exactamente lo que verás en pantalla.",
    metaTitle: "Cómo crear una lista de regalos con Giftpin",
    description:
      "Cómo crear una lista de regalos de Giftpin en una tienda, añadir regalos de esa tienda y de cualquier otro sitio, compartirla con los invitados, guardar tus cambios y recibir los regalos en casa.",
    sections: [
      {
        title: "Primeros pasos",
        steps: [
          {
            title: "Crea tu lista",
            items: [
              "En el sitio web de la tienda, haz clic en el enlace para crear una lista de regalos (por defecto <b>Create a gift registry</b>, normalmente bajo el encabezado o en el menú; la tienda puede haber cambiado el texto). También puedes pulsar el botón Add to registry (por defecto <b>Add to registry</b>) en cualquier producto y te propondrá crear una.",
              "Elige la ocasión en <b>{{create.occasion}}</b> y rellena <b>{{create.name}}</b>, <b>{{create.when}}</b>, <b>{{create.yourName}}</b> y <b>{{create.yourEmail}}</b>.",
              "En <b>{{create.country}}</b>, elige el país de tus invitados. Giftpin lo usa para sugerir tiendas para lo que esta tienda no vende.",
              "Si quieres, escribe <b>{{create.note}}</b> y haz clic en <b>{{create.submit}}</b>.",
            ],
            alts: ["El formulario para crear una lista, con la ocasión, el nombre de la lista, la fecha, el nombre, el correo y el país rellenados"],
          },
          {
            title: "Guarda tu enlace privado",
            items: [
              "Giftpin te envía por correo un enlace privado para gestionar tu lista. No necesitas cuenta ni contraseña: ese enlace es tu entrada, así que guarda el correo. Funciona durante 90 días.",
              "¿Lo perdiste o dejó de funcionar? En la página para crear una lista de la tienda, bajo <b>¿Ya tienes una?</b>, escribe tu correo y haz clic en <b>{{create.resendButton}}</b>. El enlace que recibas muestra todas las listas que creaste con ese correo.",
              "Nunca compartas este enlace. Cualquiera que lo tenga puede editar tu lista. Los invitados reciben otro enlace distinto (mira Compártela más abajo).",
            ],
            alts: ["El correo que envía Giftpin, con el botón para abrir mi lista"],
          },
        ],
      },
      {
        title: "Añade tus regalos",
        lede: "De esta tienda y de cualquier otro sitio web.",
        tint: true,
        steps: [
          {
            title: "Añadir productos de esta tienda",
            items: [
              "Navega por la tienda y haz clic en <b>Add to registry</b> en cualquier página de producto. Verás <b>Added to your registry</b> y un enlace <b>Back to your registry</b>.",
              "Si lo pulsas de nuevo en el mismo producto, te pregunta cuántos quieres en total, así que nada se añade dos veces por accidente.",
              "¿Usas otro teléfono u ordenador? Abre allí primero tu enlace privado del correo, para que el botón sepa cuál es tu lista.",
            ],
            alts: ["Una página de producto tras pulsar Add to registry, con Added to your registry y un enlace Back to your registry"],
          },
          {
            title: "Añadir regalos de cualquier otro sitio web",
            items: [
              "En tu lista, ve a <b>{{manage.addItems}}</b>, pega la dirección del producto en <b>{{manage.productLink}}</b> y haz clic en <b>{{manage.lookUp}}</b>. Giftpin rellena el nombre, la foto y el precio.",
              "Algunas tiendas grandes bloquean esta lectura. Si pasa, escribe tú mismo <b>{{manage.name}}</b> y <b>{{manage.price}}</b> y haz clic en <b>{{manage.addToReg}}</b>.",
              "Giftpin puede mostrar algo parecido de esta tienda. Haz clic en <b>{{manage.match.swap}}</b> para verlo, o quédate con tu artículo original.",
            ],
            alts: ["El cuadro Añadir artículos con un enlace de Target consultado, mostrando la foto, el nombre y el precio encontrados"],
          },
          {
            title: "O usar la extensión de Chrome",
            items: [
              `En un ordenador, instala <a href="${CHROME}" target="_blank" rel="noopener">la extensión de Giftpin para Chrome</a>.`,
              "En tu lista, en <b>{{manage.ext.title}}</b>, haz clic en <b>{{manage.ext.copy}}</b>. Abre la extensión, pégalo en <b>Manage link</b> y haz clic en <b>Connect</b>. Solo lo haces una vez.",
              "Después, en cualquier página de producto de cualquier sitio, abre la extensión, elige la <b>Quantity</b> y haz clic en <b>Add to registry</b>.",
            ],
            alts: ["La extensión de Giftpin en una página de producto de Walmart, con la cantidad y el botón Add to registry"],
          },
          {
            title: "¿En la tienda? Escanea un código de barras",
            items: [
              "Si la tienda lo ofrece, abre tu enlace privado en el teléfono y toca <b>{{manage.scan.open}}</b>. Apunta la cámara a un código de barras de una etiqueta o una caja y el producto se añade a tu lista.",
              "Permite la cámara cuando el teléfono te lo pida. Si no se abre, escribe el número que hay bajo el código de barras en <b>{{manage.scan.codeLabel}}</b> y toca <b>{{manage.scan.lookUp}}</b>.",
              "Llena la pantalla con un solo código de barras, para que no se lea otro cercano por error.",
            ],
          },
          {
            title: "Afinar tu lista",
            items: [
              "En <b>{{manage.yourList}}</b>, abre cualquier artículo para cambiar <b>{{manage.item.qty}}</b>, añadir <b>{{manage.item.noteLabel}}</b> (una talla o un color, por ejemplo) o elegir una <b>{{manage.item.category}}</b>, y haz clic en <b>{{manage.item.update}}</b>.",
              "¿No sabes qué añadir? Toca <b>{{manage.ideas.open}}</b> para ver ideas para tu ocasión.",
            ],
            alts: ["Un artículo de la lista abierto para editarlo, con una nota para invitados, la cantidad y la categoría"],
          },
        ],
      },
      {
        title: "Compártela",
        steps: [
          {
            title: "Compartirla con tus invitados",
            items: [
              "En la parte superior de tu lista, haz clic en <b>{{manage.shareBtn}}</b> y envía el enlace por correo, mensaje de texto, WhatsApp o Facebook, o haz clic en <b>{{manage.copyLink}}</b>.",
              "¿Prefieres un código para una invitación o un cartel? Haz clic en <b>{{manage.qr}}</b>, junto a los botones de compartir, y luego en <b>{{manage.qr.download}}</b>. Los invitados apuntan la cámara del teléfono y se abre tu lista.",
              "Tus invitados ven tus regalos y lo que todavía falta. Nunca ven tu correo ni tu dirección, y no necesitan cuenta.",
            ],
            alts: [
              "El enlace para compartir con los botones Copiar enlace, Correo, Mensaje de texto, WhatsApp y Facebook",
              "Lo que ven los invitados: la lista con un artículo de la tienda, un regalo ya cubierto y un artículo de Walmart",
            ],
          },
          {
            title: "Organizarla con otra persona",
            items: [
              "Justo después de crear tu lista te preguntamos <b>{{manage.setup.partnerTitle}}</b> También puedes hacerlo más tarde: haz clic en <b>{{manage.prefs.open}}</b>, baja hasta <b>{{manage.partner.title}}</b>, escribe <b>{{manage.partner.name}}</b> y <b>{{manage.partner.email}}</b> y haz clic en <b>{{manage.partner.add}}</b>.",
              "Esa persona recibe su propio enlace privado. Puede añadir regalos, ver lo que se ha comprado y cambiar los ajustes. Su correo nunca se muestra a los invitados, y <b>{{manage.partner.remove}}</b> desactiva su enlace al instante.",
            ],
          },
          {
            title: "Elegir quién puede verla",
            items: [
              "Al final de tu lista, haz clic en <b>{{manage.prefs.open}}</b>. En <b>{{manage.prefs.settings}}</b>, usa <b>{{manage.prefs.who}}</b>: <b>{{manage.prefs.priv.unlisted}}</b>, <b>{{manage.prefs.priv.password}}</b> o <b>{{manage.prefs.priv.public}}</b> en la página de búsqueda de listas de la tienda (por defecto <b>Find a gift registry</b>).",
              "Haz clic en <b>{{manage.prefs.save}}</b>. La misma sección permite cambiar el nombre, la ocasión, la fecha y la nota. Si la tienda lo permite, también está <b>{{manage.lang.label}}</b>.",
            ],
            alts: ["El menú Quién puede ver esto con sus tres opciones"],
          },
          {
            title: "Recibir los regalos en tu casa",
            items: [
              "Justo después de crear tu lista te preguntamos <b>{{manage.setup.shipTitle}}</b> Marca la casilla y escribe tu dirección de envío, u omítelo por ahora.",
              "Para cambiarlo más tarde, haz clic en <b>{{manage.prefs.open}}</b>, y en <b>{{manage.ship.title}}</b> marca la casilla, escribe tu dirección y haz clic en <b>{{manage.save}}</b>. Entonces los invitados pueden enviarte directamente los regalos comprados en esta tienda.",
              "Cada invitado decide al añadir un regalo a su carrito: enviártelo a ti o enviárselo a sí mismo. Los invitados nunca ven tu dirección.",
            ],
            alts: ["La sección Deja que los invitados me envíen regalos, con la casilla marcada y una dirección de envío rellenada"],
          },
        ],
      },
      {
        title: "Dónde pulsar Guardar",
        lede: "Una lista solo conserva lo que guardas. Cada parte de la página tiene su propio botón.",
        tint: true,
        steps: [
          {
            title: "Qué botón guarda qué",
            items: [
              "<b>{{manage.prefs.save}}</b> está al final de <b>{{manage.prefs.settings}}</b>, dentro de <b>{{manage.prefs.open}}</b>, hacia el final de la página. Guarda el nombre, la ocasión, la fecha, la nota y quién puede verla. Si cambiaste algo y te fuiste sin pulsarlo, el cambio se pierde.",
              "<b>{{manage.save}}</b> dentro de <b>{{manage.ship.title}}</b>, justo debajo en el mismo panel, guarda tu dirección de envío. Es distinto del botón anterior, así que pulsa los dos si cambiaste ambas cosas.",
              "<b>{{manage.partner.add}}</b> en <b>{{manage.partner.title}}</b>, más abajo, envía su enlace a tu pareja o ayudante y lo guarda.",
              "<b>{{manage.item.update}}</b> en un artículo guarda la cantidad, la nota y la categoría de ese artículo.",
              "<b>{{manage.addToReg}}</b> guarda un artículo nuevo en cuanto haces clic.",
              "Verás <b>{{manage.flash.saved}}</b> cerca de la parte superior de la página cuando todo haya funcionado.",
            ],
          },
        ],
      },
    ],
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        q: "¿Cómo evitan los invitados comprar lo mismo?",
        a: "Los pedidos de esta tienda actualizan tu lista automáticamente. Para los regalos de otros sitios, los invitados tocan Lo he comprado después de comprar, y el artículo aparece como cubierto. Quien cambie de idea puede deshacerlo durante 24 horas.",
      },
      {
        q: "¿Cómo sé quién me regaló qué?",
        a: "Tu lista tiene una lista Quién regaló qué para tus notas de agradecimiento, y Giftpin te escribe cuando alguien compra un regalo.",
      },
      {
        q: "¿Pueden los invitados aportar entre varios para algo grande?",
        a: "Si la tienda lo ofrece, sí. Tu lista puede convertir un artículo en un regalo en grupo, o tener un fondo en efectivo para una luna de miel o una casa, pagado como tarjetas de regalo de la tienda.",
      },
      {
        q: "Cambié algo y no se guardó.",
        a: "Pulsa el botón Guardar de esa parte de la página: Guardar cambios en Editar lista y preferencias, Guardar en Deja que los invitados me envíen regalos, o Actualizar en un artículo.",
      },
      {
        q: "¿Puedo eliminar mi lista?",
        a: "Sí. Haz clic en Editar lista y preferencias al final de tu lista y luego en Eliminar lista. Esto elimina todos los artículos y el registro de quién compró qué, y no se puede deshacer.",
      },
    ],
  },
};
