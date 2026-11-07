import type { LandingCopy } from "./landing-en";

/** Español (tuteo). Texto plano (la página lo escapa). Ver landing-en.ts. */
export const landingEs: LandingCopy = {
  faqTitle: "Preguntas de los comerciantes",

  wedding: {
    title: "App de lista de bodas universal para tiendas Shopify | Giftpin",
    description:
      "Ofrece a las parejas una lista de bodas universal en tu tienda Shopify: regalos de cualquier tienda en una sola lista, tus productos sugeridos primero, sin regalos repetidos y con crédito correcto en Shop Pay, Apple Pay y Google Pay.",
    eyebrow: "Listas de bodas para Shopify",
    h1a: "Una lista de bodas universal",
    h1b: "que empieza en tu tienda.",
    lede: "Las parejas quieren una sola lista para todo: la vajilla de tu tienda, la batidora de pie de otra, el equipaje de la luna de miel de una tercera. Giftpin se lo da, en el dominio de tu tienda, con tus productos sugeridos primero.",
    sections: [
      {
        title: "Por qué las parejas eligen una lista universal",
        lede: "La mayoría de las parejas se registra en más de un lugar. Una lista limitada a un solo catálogo las lleva a armar una segunda lista en otro sitio.",
        cards: [
          { title: "Todos los regalos en una lista", detail: "Las parejas pegan un enlace de casi cualquier tienda en línea y Giftpin completa la foto, el nombre y el precio." },
          { title: "Un enlace para los invitados", detail: "Para la web de la boda, la invitación o el chat de grupo. Sin cuenta y sin nada que instalar." },
          { title: "Ideas habitación por habitación", detail: "Una guía de ideas para bodas ayuda a las parejas a llenar su lista, con tus productos a un toque." },
        ],
      },
      {
        title: "Por qué es bueno para tu tienda",
        lede: "Los invitados de una boda llegan listos para comprar. Giftpin los mantiene en tus productos.",
        cards: [
          { title: "Tu producto, sugerido primero", detail: "Cuando una pareja añade algo de otra tienda, Giftpin muestra al lado tu producto más parecido, para cambiarlo con un toque." },
          { title: "Crédito con el pago exprés", detail: "Shop Pay, Apple Pay, Google Pay y la app Shop se saltan el carrito. Giftpin igualmente acredita cada regalo a la lista correcta." },
          { title: "Los regalos se envían a la pareja", detail: "Los invitados pueden enviar los regalos de la tienda directo a la dirección guardada por la pareja, que los invitados nunca ven." },
        ],
      },
      {
        title: "Sin regalos de boda repetidos",
        lede: "",
        cards: [
          { title: "Reservado mientras un invitado compra", detail: "La lista muestra «Puede que alguien lo esté comprando» y libera el regalo si el invitado no termina la compra." },
          { title: "Progreso claro", detail: "Los invitados ven de un vistazo lo que está disponible, lo que quizá ya se tomó y lo ya regalado." },
          { title: "Lista de agradecimientos incluida", detail: "La pareja recibe una lista de quién regaló qué, que se puede descargar como hoja de cálculo." },
        ],
      },
    ],
    faq: [
      { q: "¿Qué es una lista de bodas universal?", a: "Una sola lista donde una pareja puede añadir regalos de cualquier tienda en línea, en lugar de una lista distinta en cada tienda. Los invitados reciben un único enlace para todo." },
      { q: "¿Puede una tienda Shopify ofrecer una lista de bodas universal?", a: "Sí. Con Giftpin, las parejas crean su lista en tu tienda, añaden tus productos y regalos de cualquier otro sitio, y comparten un solo enlace. Tus productos equivalentes se sugieren junto a todo lo añadido desde otras tiendas." },
      { q: "¿Cómo se evitan los regalos de boda repetidos?", a: "Cuando un invitado va a comprar un regalo, la lista muestra «Puede que alguien lo esté comprando». Los pedidos de tu tienda actualizan la lista automáticamente, incluidos los de Shop Pay, Apple Pay y Google Pay." },
    ],
    finalCta: "Dale a tus parejas una lista sin muros.",
  },

  compare: {
    title: "Cómo elegir una app de lista de regalos para Shopify: Giftpin frente a las apps limitadas al catálogo",
    description:
      "Cómo se compara Giftpin con las apps de listas limitadas a tu propio catálogo: regalos de cualquier tienda, tus productos sugeridos primero, crédito correcto con Shop Pay y los pagos exprés, y sin cuentas para los invitados.",
    eyebrow: "Cómo elegir una app de listas",
    h1a: "Giftpin frente a las apps de listas",
    h1b: "limitadas al catálogo",
    lede: "Muchas apps de listas para Shopify solo dejan añadir tus propios productos. Es sencillo, pero no es como la gente arma su lista. Esto es lo que cambia cuando la lista puede contener de todo.",
    sections: [{ title: "Lado a lado", lede: "", cards: [] }],
    table: {
      aria: "Comparación",
      colCatalog: "Apps de listas limitadas al catálogo",
      colGiftpin: "Giftpin",
      rows: [
        { label: "Regalos de otras tiendas", catalogOnly: "Normalmente no: solo tu catálogo", giftpin: "Sí, pegados desde casi cualquier tienda en línea" },
        { label: "Tus productos cuando un regalo viene de otro sitio", catalogOnly: "La pareja se va a registrar a otro lugar", giftpin: "Tu producto más parecido sugerido al lado" },
        { label: "Crédito de los pedidos de Shop Pay, Apple Pay y Google Pay", catalogOnly: "Depende", giftpin: "Sí, cada regalo se acredita al artículo correcto" },
        { label: "Protección contra regalos repetidos en los comprados en otro sitio", catalogOnly: "No aplica", giftpin: "Reservado mientras un invitado compra" },
        { label: "Compradores cuya lista está en otro sitio", catalogOnly: "Normalmente no se atienden", giftpin: "Tu botón puede añadir a Babylist, o copiar el enlace para cualquier lista que acepte uno" },
        { label: "Páginas de lista en tu propio dominio", catalogOnly: "Depende", giftpin: "Sí" },
        { label: "Cuentas para quienes crean la lista y para los invitados", catalogOnly: "A menudo obligatorias", giftpin: "No hacen falta" },
      ],
      note: "«Limitada al catálogo» describe las apps de listas que solo dejan añadir los productos de la propia tienda. Las funciones cambian de una app a otra, así que revisa cada ficha.",
    },
    faq: [
      { q: "¿Qué debo buscar en una app de listas para Shopify?", a: "Si las parejas pueden añadir regalos de otras tiendas, si los pagos exprés como Shop Pay se acreditan a la lista correcta, cómo se evitan los regalos repetidos y si el precio se queda con una parte de tus ventas." },
      { q: "¿Dejar que añadan productos de otras tiendas no me hace perder ventas?", a: "Quienes no pueden añadir todo suelen armar una segunda lista en otro lugar y mandar allí a sus invitados. Giftpin mantiene toda la lista en tu tienda y sugiere tu producto equivalente junto a cada regalo externo." },
      { q: "¿Cuánto cuesta Giftpin?", a: "El plan gratuito incluye listas, artículos e invitados ilimitados. {pro} cuesta {price} al mes con una {trial}. Ningún plan se queda con una parte de tus ventas de productos." },
    ],
    finalCta: "Mira lo que una lista sin muros hace por tu tienda.",
  },

  app: {
    title: "App de lista de regalos para tiendas Shopify | Giftpin",
    description:
      "Giftpin es una app de lista de regalos para Shopify que trae clientes nuevos a tu tienda: listas en tu propio dominio, regalos de cualquier tienda en una sola lista, tus productos sugeridos primero y sin regalos repetidos.",
    eyebrow: "App de lista de regalos para Shopify",
    h1a: "Una lista de regalos para tu tienda",
    h1b: "que trae clientes nuevos.",
    lede: "Cada lista que comparten tus clientes lleva a sus amigos y familiares a tu tienda. Giftpin les da una sola lista para todos los regalos, mantiene tus productos en primer plano y evita los regalos repetidos.",
    sections: [
      {
        title: "Cómo una lista te consigue clientes",
        lede: "Quien crea la lista comparte un enlace. Todos los que lo abren llegan a tu tienda, listos para comprar.",
        cards: [
          { title: "Un enlace, muchos invitados", detail: "Quienes crean listas las comparten en un mensaje, una invitación o una web de boda. Cada invitado es un comprador al que no pagaste para llegar." },
          { title: "En tu propio dominio", detail: "Las páginas de lista están en tu tienda y llevan a los invitados directo a tus productos y a tu caja." },
          { title: "Quienes crean listas vuelven", detail: "Con {pro}, quienes crean una lista reciben tras su evento un descuento de un solo uso para tus productos que aún siguen en su lista." },
        ],
      },
      {
        title: "Pensado para cómo se arma una lista de verdad",
        lede: "Quienes crean listas quieren todo en una sola. Giftpin se lo permite y pone tu catálogo primero.",
        cards: [
          { title: "Regalos de cualquier tienda", detail: "Pegan un enlace de casi cualquier tienda en línea, o lo añaden con la extensión de Chrome de Giftpin." },
          { title: "Tu producto, sugerido primero", detail: "Cuando un regalo viene de otra tienda, Giftpin muestra al lado tu producto más parecido, para cambiarlo con un toque." },
          { title: "Sin regalos repetidos", detail: "La lista muestra «Puede que alguien lo esté comprando» mientras un invitado paga, y libera el regalo si no lo hace." },
        ],
      },
      {
        title: "Listo en minutos",
        lede: "",
        cards: [
          { title: "Bloques de tema, sin código", detail: "Añade el botón Add to registry y los enlaces de lista en el editor de temas." },
          { title: "Todos los pagos se acreditan", detail: "Los pedidos de Shop Pay, Apple Pay, Google Pay y la app Shop se acreditan al artículo correcto de la lista." },
          { title: "Tus ocasiones", detail: "Activa o desactiva bodas, baby showers, cumpleaños y más para tu tienda." },
        ],
      },
    ],
    faq: [
      { q: "¿Qué hace una app de lista de regalos por una tienda Shopify?", a: "Permite a los clientes armar una lista de los regalos que quieren para una ocasión y compartir un enlace con amigos y familiares. Los invitados compran en tu tienda, y la mayoría son clientes nuevos." },
      { q: "¿Qué ocasiones admite Giftpin?", a: "Bodas, baby showers, cumpleaños, graduaciones, inauguraciones de casa, fiestas de fin de año, mascotas nuevas y más. Tú eliges cuáles ofrece tu tienda en los ajustes de Giftpin." },
      { q: "¿Tengo que editar el código de mi tema?", a: "No. Giftpin añade un botón Add to registry y enlaces de lista como bloques de tema que colocas en el editor de temas, y las páginas de lista están en el dominio de tu propia tienda." },
      { q: "¿Cuánto cuesta?", a: "El plan gratuito incluye listas, artículos e invitados ilimitados. {pro} cuesta {price} al mes con una {trial}. Ningún plan se queda con una parte de tus ventas de productos." },
    ],
    finalCta: "Convierte cada lista en clientes nuevos.",
  },

  baby: {
    title: "App de lista de bebé para tiendas Shopify | Giftpin",
    description:
      "Ofrece a los futuros padres una lista de bebé en tu tienda Shopify: regalos de cualquier tienda en una sola lista, tus productos sugeridos primero, regalos enviados a los padres y sin regalos repetidos.",
    eyebrow: "Listas de bebé para Shopify",
    h1a: "Una lista de bebé",
    h1b: "que empieza en tu tienda.",
    lede: "Los futuros padres necesitan mucho, desde una cuna hasta sacos de dormir, y rara vez lo encuentran todo en una tienda. Giftpin les permite armar una lista de bebé con tus productos y todo lo demás que necesiten, y compartir un solo enlace.",
    sections: [
      {
        title: "Por qué la eligen los padres",
        lede: "",
        cards: [
          { title: "Todo lo que necesita el bebé, en una lista", detail: "Los padres pegan un enlace de casi cualquier tienda en línea y Giftpin completa la foto, el nombre y el precio." },
          { title: "Ideas según lo que necesita el bebé", detail: "Una guía de ideas para la lista de bebé cubre el sueño, la alimentación, el baño y más." },
          { title: "Los regalos llegan a su puerta", detail: "Los invitados pueden enviar regalos de tu tienda directo a la dirección guardada por los padres." },
        ],
      },
      {
        title: "Por qué es bueno para tu tienda",
        lede: "Los invitados a un baby shower suelen ser familiares que compran más de un regalo. Giftpin los mantiene en tus productos.",
        cards: [
          { title: "Tu producto, sugerido primero", detail: "Cuando los padres añaden algo de otra tienda, Giftpin muestra al lado tu producto más parecido, para cambiarlo con un toque." },
          { title: "Sin regalos repetidos", detail: "La lista muestra «Puede que alguien lo esté comprando» mientras un invitado paga." },
          { title: "Lista de agradecimientos incluida", detail: "Los padres reciben una lista de quién regaló qué, que se puede descargar como hoja de cálculo." },
          { title: "¿Ya están en Babylist? También son bienvenidos", detail: "Tu botón Add to registry puede preguntar Which registry? y añadir tu producto a la lista de Babylist de los padres, para que compren contigo de todos modos." },
          { title: "Sin sorpresas de agotado", detail: "Los productos agotados se marcan en las listas, o se ocultan hasta que vuelvan a tener existencias." },
          { title: "¿Cambias de app de listas?", detail: "Importa las listas desde la hoja de cálculo de tu antigua app. Los regalos ya comprados siguen comprados." },
        ],
      },
    ],
    faq: [
      { q: "¿Puede mi tienda Shopify ofrecer una lista de bebé?", a: "Sí. Con Giftpin, los futuros padres crean una lista de bebé en tu tienda, añaden tus productos y lo demás que necesiten de otras tiendas, y comparten un enlace con familiares y amigos." },
      { q: "¿Se pueden enviar los regalos directamente a los padres?", a: "Sí. Los padres guardan una dirección de envío una sola vez, y los invitados pueden enviarles regalos de tu tienda directamente. Los invitados nunca ven la dirección." },
      { q: "¿Y los padres que ya tienen una lista de Babylist?", a: "Tu botón Add to registry puede ofrecerla. Activa Also offer Babylist en los ajustes del botón y los compradores podrán elegir: la lista de tu tienda o su propia lista de Babylist, añadida mediante el script add-to-Babylist de Babylist. Giftpin no está afiliado a Babylist y no rastrea las compras hechas desde listas de Babylist." },
      { q: "¿Ayuda Giftpin a los padres a decidir qué añadir?", a: "Sí. Una guía de ideas para la lista de bebé enumera lo que necesita un recién nacido, desde el sueño y la alimentación hasta la hora del baño, con tus productos a un toque." },
    ],
    finalCta: "Dale a los futuros padres una sola lista para todo.",
  },

  home: {
    title: "App de lista de bodas para tiendas de artículos para el hogar y cocina | Giftpin",
    description:
      "Ofrece listas de bodas y de inauguración de casa en tu tienda Shopify de artículos para el hogar o cocina: las parejas añaden primero tus productos, lo demás de otras tiendas, y los invitados te compran a ti.",
    eyebrow: "Listas para tiendas de artículos para el hogar",
    h1a: "Una lista de bodas para tu",
    h1b: "tienda de cocina y hogar.",
    lede: "Las parejas se registran para lo que tú vendes: batería de cocina, vajilla, ropa de cama y mesa, decoración. Giftpin les permite armar esa lista en tu tienda, para que sus invitados te compren a ti.",
    sections: [
      {
        title: "Por qué encajan las tiendas de artículos para el hogar",
        lede: "Las listas de bodas y de inauguración de casa son sobre todo de artículos para el hogar. Hoy las parejas las arman en otro sitio.",
        cards: [
          { title: "Un enlace, muchos invitados", detail: "Cada lista lleva a los amigos y familiares de la pareja a tu tienda, listos para comprar." },
          { title: "En tu propio dominio", detail: "Las páginas de lista están en tu tienda y llevan a los invitados a tus productos y a tu caja." },
          { title: "Sin regalos repetidos", detail: "La lista muestra «Puede que alguien lo esté comprando» mientras un invitado paga." },
        ],
      },
      {
        title: "Tus productos van primero",
        lede: "Las parejas aún pueden añadir lo que no vendes, y tú te quedas al principio de la lista.",
        cards: [
          { title: "Tu producto más parecido, sugerido", detail: "Cuando una pareja añade un artículo de otra tienda, Giftpin muestra al lado tu producto más cercano." },
          { title: "Una lista completa", detail: "Las parejas mantienen todo en una lista, así que no tienen motivo para irse a una lista más grande." },
          { title: "Sin código de tema", detail: "Añade el botón Add to registry y los enlaces de lista como bloques de tema en el editor de temas." },
        ],
      },
    ],
    faq: [
      { q: "¿Puede una tienda de artículos para el hogar o cocina ofrecer listas de bodas en Shopify?", a: "Sí. Con Giftpin, las parejas crean una lista de bodas o de inauguración de casa en tu tienda, añaden tu batería de cocina, tu ropa de cama y mesa y tu vajilla, y comparten un enlace con sus invitados." },
      { q: "¿Y si una pareja quiere algo que yo no vendo?", a: "Pueden añadirlo desde otra tienda, para que la lista siga completa. Giftpin muestra al lado tu producto más parecido, para cambiarlo con un toque, así que tus productos van primero." },
      { q: "¿Necesitan cuenta los invitados?", a: "No. Los invitados abren el enlace, ven lo que ya se tomó y pagan en tu tienda." },
      { q: "¿Cuánto cuesta?", a: "El plan gratuito incluye listas, artículos e invitados ilimitados. {pro} cuesta {price} al mes con una {trial}. Ningún plan se queda con una parte de tus ventas de productos." },
    ],
    finalCta: "Dale a las parejas una lista que empiece en tu tienda.",
  },

  holiday: {
    title: "Listas de deseos navideñas para tiendas Shopify de regalos y hogar | Giftpin",
    description:
      "Deja que tus clientes armen una lista de deseos navideña para compartir en tu tienda Shopify. La familia compra desde un solo enlace, los regalos se marcan como comprados para que nadie repita y las ventas llegan a ti.",
    eyebrow: "Listas de deseos navideñas",
    h1a: "Listas de Navidad que llevan",
    h1b: "a la familia a tu tienda.",
    lede: "Deja que tus clientes armen una lista de deseos navideña en tu tienda y compartan un solo enlace con toda la familia. Cada regalo se marca al comprarse, para que nadie repita, y las compras se hacen en tu caja.",
    sections: [
      {
        title: "Por qué funciona para tiendas de regalos y hogar",
        lede: "Las listas navideñas pasan por padres, abuelos, tíos y amigos. Cada una es un motivo para visitar tu tienda.",
        cards: [
          { title: "Un enlace para toda la familia", detail: "Los compradores comparten su lista por mensaje, WhatsApp o correo. La familia la abre en cualquier teléfono, sin nada que registrar." },
          { title: "Sin regalos repetidos", detail: "Mientras alguien paga, la lista muestra «Puede que alguien lo esté comprando». Una vez comprado, queda marcado como tomado." },
          { title: "Tus productos primero", detail: "La lista está en el dominio de tu tienda y tus productos van arriba, para comprarlos con un toque." },
        ],
      },
      {
        title: "Listo en minutos",
        lede: "Sin código de tema. Si ya usas Giftpin para listas, basta marcar una casilla.",
        cards: [
          { title: "Marca Lista de deseos", detail: "En Giftpin, abre Ajustes y marca Lista de deseos en Ocasiones. No tiene fecha de evento, así que sirve para Navidad, Janucá, Diwali o cualquier época del año." },
          { title: "Añade el botón", detail: "El botón Add to registry va en tus páginas de producto como bloque de tema, para que los compradores añadan tus productos mientras navegan." },
          { title: "Espacio para todo", detail: "Permite artículos de otras tiendas y la lista se mantiene completa, con tu producto más parecido sugerido junto a cada uno." },
        ],
      },
      {
        title: "Listo antes de congelar el código por las fiestas",
        lede: "Muchas tiendas dejan de cambiar su tema antes del Black Friday. Activar las listas de deseos es un ajuste de la app más un bloque de tema, así que conviene hacerlo ahora, antes del ajetreo.",
        cards: [],
      },
    ],
    faq: [
      { q: "¿Es un botón de lista de deseos para guardar productos para después?", a: "No. Las listas de deseos de Giftpin están hechas para compartirse: un comprador arma una lista, envía un enlace a familiares y amigos, y los regalos se marcan conforme se compran. Si quieres un botón de corazón para guardar productos y comprarlos tú después, una app de lista de deseos dedicada es mejor opción." },
      { q: "¿Cómo activo las listas de deseos?", a: "En Giftpin, abre Ajustes, marca Lista de deseos en Ocasiones y guarda. Está desactivada hasta que la actives. Los compradores eligen entonces Lista de deseos al crear una lista, y no hay fecha de evento que rellenar." },
      { q: "¿Puede una lista incluir cosas de otras tiendas?", a: "Sí, si permites artículos de otras tiendas en los ajustes. Tus propios productos se quedan arriba, y Giftpin sugiere tu producto más parecido junto a todo lo añadido desde otro sitio." },
      { q: "¿Necesitan cuenta los familiares?", a: "No. Abren el enlace, ven lo que ya se tomó y compran en tu tienda con tu pago habitual, incluido Shop Pay." },
      { q: "¿Cuánto cuesta?", a: "Las listas de deseos están en el plan gratuito, con listas, artículos e invitados ilimitados. {pro} cuesta {price} al mes con una {trial}. Ningún plan se queda con una parte de tus ventas de productos." },
    ],
    finalCta: "Dale a tus clientes una lista navideña que empiece en tu tienda.",
  },

  giftCards: {
    title: "Tarjetas de regalo de tiendas Shopify independientes | Giftpin",
    description: "Compra una tarjeta de regalo de una tienda independiente que usa Giftpin. Elige un importe, paga en la caja de la tienda y envía la tarjeta por correo.",
    eyebrow: "Tarjetas de regalo",
    h1a: "Tarjetas de regalo de",
    h1b: "tiendas independientes.",
    lede: "Elige una tienda, un importe de hasta {max} y paga en la caja de la propia tienda. La tienda envía la tarjeta de regalo por correo, a ti o directamente a la persona a quien se la regalas.",
    emptyH: "Aún no hay tiendas anunciadas",
    emptyP: "Vuelve pronto. ¿Tienes una tienda Shopify? Podrías ser la primera.",
    buy: "Comprar una tarjeta de regalo",
    otherCountries: "Otros países",
    questions: "Preguntas",
    merchantLine: '¿Tienes una tienda Shopify? <a href="/setup#gift-cards">Mira cómo anunciar tus tarjetas de regalo</a>.',
    faq: [
      { q: "¿Quién vende la tarjeta de regalo?", a: "La tienda. Pagas en la caja de esa tienda, y la tienda envía la tarjeta de regalo por correo. Solo se puede gastar en esa tienda." },
      { q: "¿Puedo enviarla directamente a alguien?", a: "Sí. Marca «Enviarla directamente por correo a alguien» y añade su correo. Usa para ello el botón de pago habitual de la tienda, porque Shopify envía la tarjeta al comprador cuando pagas con Shop Pay." },
      { q: "¿Cómo anuncio mi tienda aquí?", a: "Instala Giftpin en tu tienda Shopify, añade un producto de tarjeta de regalo y, en los ajustes de Giftpin, marca «Anunciar mis tarjetas regalo en giftpin.app». Forma parte de {pro}, con una comisión del {fee} % sobre las tarjetas de regalo vendidas así (ninguna durante tu prueba gratuita). El dinero y cualquier saldo sin gastar se quedan contigo." },
    ],
  },
};
