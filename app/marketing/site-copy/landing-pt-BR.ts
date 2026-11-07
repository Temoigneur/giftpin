import type { LandingCopy } from "./landing-en";

/** Português (Brasil). Texto simples (a página o escapa). Veja landing-en.ts. */
export const landingPtBR: LandingCopy = {
  faqTitle: "Perguntas dos lojistas",

  wedding: {
    title: "App de lista de casamento universal para lojas Shopify | Giftpin",
    description:
      "Ofereça aos noivos uma lista de casamento universal na sua loja Shopify: presentes de qualquer loja numa só lista, seus produtos sugeridos primeiro, sem presentes repetidos e com crédito correto em Shop Pay, Apple Pay e Google Pay.",
    eyebrow: "Listas de casamento para a Shopify",
    h1a: "Uma lista de casamento universal",
    h1b: "que começa na sua loja.",
    lede: "Os noivos querem uma só lista para tudo: o jogo de jantar da sua loja, a batedeira de outra, as malas da lua de mel de uma terceira. O Giftpin dá isso a eles, no domínio da sua loja, com seus produtos sugeridos primeiro.",
    sections: [
      {
        title: "Por que os noivos escolhem uma lista universal",
        lede: "A maioria dos casais faz lista em mais de um lugar. Uma lista limitada a um catálogo os leva a montar uma segunda lista em outro lugar.",
        cards: [
          { title: "Todos os presentes numa só lista", detail: "Os noivos colam o link de quase qualquer loja online e o Giftpin preenche a foto, o nome e o preço." },
          { title: "Um link para os convidados", detail: "Para o site do casamento, o convite ou o grupo de mensagens. Sem conta e sem nada para instalar." },
          { title: "Ideias cômodo por cômodo", detail: "Um guia de ideias para casamentos ajuda os noivos a encher a lista, com seus produtos a um toque." },
        ],
      },
      {
        title: "Por que é bom para a sua loja",
        lede: "Os convidados de um casamento chegam prontos para comprar. O Giftpin os mantém nos seus produtos.",
        cards: [
          { title: "Seu produto, sugerido primeiro", detail: "Quando os noivos adicionam algo de outra loja, o Giftpin mostra ao lado o seu produto mais parecido, para trocar com um toque." },
          { title: "Crédito no checkout expresso", detail: "Shop Pay, Apple Pay, Google Pay e o app Shop pulam o carrinho. O Giftpin ainda assim credita cada presente à lista certa." },
          { title: "Os presentes vão para os noivos", detail: "Os convidados podem enviar presentes da loja direto para o endereço salvo pelos noivos, que os convidados nunca veem." },
        ],
      },
      {
        title: "Sem presentes de casamento repetidos",
        lede: "",
        cards: [
          { title: "Reservado enquanto o convidado compra", detail: "A lista mostra “Alguém pode estar comprando este item” e libera o presente se o convidado não concluir a compra." },
          { title: "Progresso claro", detail: "Os convidados veem num relance o que está disponível, o que talvez já tenha sido escolhido e o que já foi presenteado." },
          { title: "Lista de agradecimentos incluída", detail: "Os noivos recebem uma lista de quem deu o quê, para baixar como planilha." },
        ],
      },
    ],
    faq: [
      { q: "O que é uma lista de casamento universal?", a: "Uma só lista em que os noivos podem adicionar presentes de qualquer loja online, em vez de uma lista separada em cada loja. Os convidados recebem um único link para tudo." },
      { q: "Uma loja Shopify pode oferecer uma lista de casamento universal?", a: "Pode. Com o Giftpin, os noivos criam a lista na sua loja, adicionam seus produtos e presentes de qualquer outro lugar e compartilham um link. Seus produtos equivalentes são sugeridos ao lado de tudo o que foi adicionado de outras lojas." },
      { q: "Como os presentes de casamento repetidos são evitados?", a: "Quando um convidado vai comprar um presente, a lista mostra “Alguém pode estar comprando este item”. Os pedidos da sua loja atualizam a lista automaticamente, inclusive os feitos com Shop Pay, Apple Pay e Google Pay." },
    ],
    finalCta: "Dê aos seus casais uma lista sem muros.",
  },

  compare: {
    title: "Como escolher um app de lista de presentes para a Shopify: Giftpin e apps limitados ao catálogo",
    description:
      "Como o Giftpin se compara a apps de listas limitados ao seu próprio catálogo: presentes de qualquer loja, seus produtos sugeridos primeiro, crédito correto com Shop Pay e checkouts expressos, e sem contas para os convidados.",
    eyebrow: "Como escolher um app de listas",
    h1a: "Giftpin e apps de listas",
    h1b: "limitados ao catálogo",
    lede: "Muitos apps de listas para a Shopify só deixam adicionar os seus próprios produtos. É simples, mas não é assim que as pessoas fazem lista. Veja o que muda quando a lista pode guardar tudo.",
    sections: [{ title: "Lado a lado", lede: "", cards: [] }],
    table: {
      aria: "Comparação",
      colCatalog: "Apps de listas limitados ao catálogo",
      colGiftpin: "Giftpin",
      rows: [
        { label: "Presentes de outras lojas", catalogOnly: "Em geral não: só o seu catálogo", giftpin: "Sim, colados de quase qualquer loja online" },
        { label: "Seus produtos quando um presente vem de outro lugar", catalogOnly: "O casal vai fazer a lista em outro lugar", giftpin: "Seu produto mais parecido sugerido ao lado" },
        { label: "Crédito dos pedidos com Shop Pay, Apple Pay e Google Pay", catalogOnly: "Varia", giftpin: "Sim, cada presente creditado ao item certo" },
        { label: "Proteção contra repetição em presentes comprados em outro lugar", catalogOnly: "Não se aplica", giftpin: "Reservado enquanto o convidado compra" },
        { label: "Compradores cuja lista está em outro site", catalogOnly: "Em geral não atendidos", giftpin: "Seu botão pode adicionar à Babylist, ou copiar o link para qualquer lista que aceite um" },
        { label: "Páginas de lista no seu próprio domínio", catalogOnly: "Varia", giftpin: "Sim" },
        { label: "Contas para quem cria a lista e para os convidados", catalogOnly: "Muitas vezes exigidas", giftpin: "Não são necessárias" },
      ],
      note: "“Limitado ao catálogo” descreve apps de listas que só deixam adicionar os produtos da própria loja. Os recursos variam de app para app, então confira cada página de listagem.",
    },
    faq: [
      { q: "O que devo procurar num app de listas para a Shopify?", a: "Se os casais podem adicionar presentes de outras lojas, se checkouts expressos como o Shop Pay são creditados à lista certa, como os presentes repetidos são evitados e se o preço fica com uma parte das suas vendas." },
      { q: "Deixar quem cria a lista adicionar produtos de outras lojas não me faz perder vendas?", a: "Quem não consegue adicionar tudo costuma montar uma segunda lista em outro lugar e mandar os convidados para lá. O Giftpin mantém a lista inteira na sua loja e sugere o seu produto equivalente ao lado de cada presente de fora." },
      { q: "Quanto custa o Giftpin?", a: "O plano gratuito inclui listas, itens e convidados ilimitados. O {pro} custa {price} por mês, com um {trial}. Nenhum dos planos fica com uma parte das suas vendas de produtos." },
    ],
    finalCta: "Veja o que uma lista sem muros faz pela sua loja.",
  },

  app: {
    title: "App de lista de presentes para lojas Shopify | Giftpin",
    description:
      "O Giftpin é um app de lista de presentes para a Shopify que traz novos clientes para a sua loja: listas no seu próprio domínio, presentes de qualquer loja numa só lista, seus produtos sugeridos primeiro e sem presentes repetidos.",
    eyebrow: "App de lista de presentes para a Shopify",
    h1a: "Uma lista de presentes para a sua loja",
    h1b: "que traz novos clientes.",
    lede: "Cada lista que seus clientes compartilham leva os amigos e a família deles à sua loja. O Giftpin dá a eles uma só lista para todos os presentes, mantém seus produtos em destaque e evita presentes repetidos.",
    sections: [
      {
        title: "Como uma lista conquista clientes para você",
        lede: "Quem cria a lista compartilha um link. Todos que o abrem chegam à sua loja, prontos para comprar.",
        cards: [
          { title: "Um link, muitos convidados", detail: "Quem cria a lista a compartilha numa mensagem, num convite ou num site de casamento. Cada convidado é um comprador que você não pagou para alcançar." },
          { title: "No seu próprio domínio", detail: "As páginas das listas ficam na sua loja e levam os convidados direto aos seus produtos e ao seu checkout." },
          { title: "Quem cria a lista volta", detail: "Com o {pro}, quem cria a lista recebe, depois do evento, um desconto de uso único para os seus produtos que ainda estão na lista." },
        ],
      },
      {
        title: "Feito para o jeito como as pessoas realmente fazem lista",
        lede: "Quem cria a lista quer tudo numa só. O Giftpin permite isso e põe o seu catálogo em primeiro lugar.",
        cards: [
          { title: "Presentes de qualquer loja", detail: "Colam o link de quase qualquer loja online ou adicionam com a extensão do Giftpin para o Chrome." },
          { title: "Seu produto, sugerido primeiro", detail: "Quando um presente vem de outra loja, o Giftpin mostra ao lado o seu produto mais parecido, para trocar com um toque." },
          { title: "Sem presentes repetidos", detail: "A lista mostra “Alguém pode estar comprando este item” enquanto o convidado finaliza a compra e libera o presente se ele não comprar." },
        ],
      },
      {
        title: "Configurado em minutos",
        lede: "",
        cards: [
          { title: "Blocos de tema, sem código", detail: "Adicione o botão Add to registry e os links da lista no editor de temas." },
          { title: "Todo checkout é creditado", detail: "Os pedidos de Shop Pay, Apple Pay, Google Pay e do app Shop são creditados ao item certo da lista." },
          { title: "Suas ocasiões", detail: "Ative ou desative casamentos, chás de bebê, aniversários e mais para a sua loja." },
        ],
      },
    ],
    faq: [
      { q: "O que um app de lista de presentes faz por uma loja Shopify?", a: "Ele permite que os clientes montem uma lista dos presentes que querem para uma ocasião e compartilhem um link com amigos e família. Os convidados compram na sua loja, e a maioria é de clientes novos." },
      { q: "Quais ocasiões o Giftpin aceita?", a: "Casamentos, chás de bebê, aniversários, formaturas, chás de casa nova, festas de fim de ano, novos pets e mais. Você escolhe quais a sua loja oferece nas configurações do Giftpin." },
      { q: "Preciso editar o código do meu tema?", a: "Não. O Giftpin adiciona um botão Add to registry e links da lista como blocos de tema que você coloca no editor de temas, e as páginas das listas ficam no domínio da sua própria loja." },
      { q: "Quanto custa?", a: "O plano gratuito inclui listas, itens e convidados ilimitados. O {pro} custa {price} por mês, com um {trial}. Nenhum dos planos fica com uma parte das suas vendas de produtos." },
    ],
    finalCta: "Transforme cada lista em novos clientes.",
  },

  baby: {
    title: "App de lista de bebê para lojas Shopify | Giftpin",
    description:
      "Ofereça aos futuros pais uma lista de bebê na sua loja Shopify: presentes de qualquer loja numa só lista, seus produtos sugeridos primeiro, presentes enviados aos pais e sem presentes repetidos.",
    eyebrow: "Listas de bebê para a Shopify",
    h1a: "Uma lista de bebê",
    h1b: "que começa na sua loja.",
    lede: "Os futuros pais precisam de muita coisa, de um berço a sacos de dormir, e raramente encontram tudo numa só loja. O Giftpin permite que montem uma lista de bebê com seus produtos e tudo mais de que precisarem, e compartilhem um único link.",
    sections: [
      {
        title: "Por que os pais a escolhem",
        lede: "",
        cards: [
          { title: "Tudo o que o bebê precisa, numa só lista", detail: "Os pais colam o link de quase qualquer loja online e o Giftpin preenche a foto, o nome e o preço." },
          { title: "Ideias pelo que o bebê precisa", detail: "Um guia de ideias para a lista de bebê cobre sono, alimentação, hora do banho e mais." },
          { title: "Os presentes chegam à porta deles", detail: "Os convidados podem enviar presentes da sua loja direto para o endereço salvo pelos pais." },
        ],
      },
      {
        title: "Por que é bom para a sua loja",
        lede: "Os convidados de um chá de bebê costumam ser parentes que compram mais de um presente. O Giftpin os mantém nos seus produtos.",
        cards: [
          { title: "Seu produto, sugerido primeiro", detail: "Quando os pais adicionam algo de outra loja, o Giftpin mostra ao lado o seu produto mais parecido, para trocar com um toque." },
          { title: "Sem presentes repetidos", detail: "A lista mostra “Alguém pode estar comprando este item” enquanto o convidado finaliza a compra." },
          { title: "Lista de agradecimentos incluída", detail: "Os pais recebem uma lista de quem deu o quê, para baixar como planilha." },
          { title: "Já estão na Babylist? Também são bem-vindos", detail: "Seu botão Add to registry pode perguntar Which registry? e adicionar o seu produto à lista da Babylist dos pais, para que comprem com você de qualquer jeito." },
          { title: "Sem surpresas de esgotado", detail: "Os produtos esgotados são marcados nas listas ou ficam ocultos até voltarem ao estoque." },
          { title: "Trocando de app de listas?", detail: "Importe as listas da planilha do seu app antigo. Os presentes já comprados continuam comprados." },
        ],
      },
    ],
    faq: [
      { q: "Minha loja Shopify pode oferecer uma lista de bebê?", a: "Pode. Com o Giftpin, os futuros pais criam uma lista de bebê na sua loja, adicionam seus produtos e tudo mais de que precisarem de outras lojas e compartilham um link com a família e os amigos." },
      { q: "Os presentes podem ser enviados direto aos pais?", a: "Sim. Os pais salvam um endereço de entrega uma vez, e os convidados podem enviar presentes da sua loja direto para eles. Os convidados nunca veem o endereço." },
      { q: "E os pais que já têm uma lista na Babylist?", a: "Seu botão Add to registry pode oferecê-la. Ative Also offer Babylist nas configurações do botão e os compradores podem escolher: a lista da sua loja ou a própria lista da Babylist, adicionada pelo script add-to-Babylist da Babylist. O Giftpin não é afiliado à Babylist e não rastreia compras feitas a partir de listas da Babylist." },
      { q: "O Giftpin ajuda os pais a decidir o que adicionar?", a: "Ajuda. Um guia de ideias para a lista de bebê aponta o que um recém-nascido precisa, de sono e alimentação à hora do banho, com seus produtos a um toque." },
    ],
    finalCta: "Dê aos futuros pais uma só lista para tudo.",
  },

  home: {
    title: "App de lista de casamento para lojas de utilidades domésticas e cozinha | Giftpin",
    description:
      "Ofereça listas de casamento e de casa nova na sua loja Shopify de utilidades domésticas ou cozinha: os casais adicionam primeiro os seus produtos, o resto de outras lojas, e os convidados compram de você.",
    eyebrow: "Listas para lojas de utilidades domésticas",
    h1a: "Uma lista de casamento para a sua",
    h1b: "loja de cozinha e casa.",
    lede: "Os casais fazem lista do que você vende: panelas, louças, roupa de cama e mesa, decoração. O Giftpin permite que montem essa lista na sua loja, para que os convidados comprem com você.",
    sections: [
      {
        title: "Por que lojas de utilidades domésticas combinam",
        lede: "Listas de casamento e de casa nova são, na maioria, de utilidades domésticas. Hoje os casais as montam em outro lugar.",
        cards: [
          { title: "Um link, muitos convidados", detail: "Cada lista leva os amigos e a família do casal à sua loja, prontos para comprar." },
          { title: "No seu próprio domínio", detail: "As páginas das listas ficam na sua loja e levam os convidados aos seus produtos e ao seu checkout." },
          { title: "Sem presentes repetidos", detail: "A lista mostra “Alguém pode estar comprando este item” enquanto o convidado finaliza a compra." },
        ],
      },
      {
        title: "Seus produtos vêm primeiro",
        lede: "Os casais ainda podem adicionar o que você não vende, e você continua no topo da lista.",
        cards: [
          { title: "Seu produto mais parecido, sugerido", detail: "Quando um casal adiciona um item de outra loja, o Giftpin mostra ao lado o seu produto mais próximo." },
          { title: "Uma lista completa", detail: "Os casais mantêm tudo numa só lista, sem motivo para ir embora para uma lista maior." },
          { title: "Sem código de tema", detail: "Adicione o botão Add to registry e os links da lista como blocos de tema no editor de temas." },
        ],
      },
    ],
    faq: [
      { q: "Uma loja de utilidades domésticas ou cozinha pode oferecer listas de casamento na Shopify?", a: "Pode. Com o Giftpin, os casais criam uma lista de casamento ou de casa nova na sua loja, adicionam suas panelas, roupa de cama e mesa e louças, e compartilham um link com os convidados." },
      { q: "E se um casal quiser algo que eu não vendo?", a: "Pode adicionar de outra loja, para a lista continuar completa. O Giftpin mostra ao lado o seu produto mais parecido, para trocar com um toque, assim os seus produtos vêm primeiro." },
      { q: "Os convidados precisam de conta?", a: "Não. Os convidados abrem o link, veem o que já foi escolhido e finalizam a compra na sua loja." },
      { q: "Quanto custa?", a: "O plano gratuito inclui listas, itens e convidados ilimitados. O {pro} custa {price} por mês, com um {trial}. Nenhum dos planos fica com uma parte das suas vendas de produtos." },
    ],
    finalCta: "Dê aos casais uma lista que começa na sua loja.",
  },

  holiday: {
    title: "Listas de desejos de fim de ano para lojas Shopify de presentes e casa | Giftpin",
    description:
      "Deixe os clientes montarem uma lista de desejos de Natal ou de fim de ano para compartilhar na sua loja Shopify. A família compra por um só link, os presentes são marcados como comprados para ninguém repetir e as vendas vêm para você.",
    eyebrow: "Listas de desejos de fim de ano",
    h1a: "Listas de Natal que levam",
    h1b: "a família à sua loja.",
    lede: "Deixe os clientes montarem uma lista de desejos de fim de ano na sua loja e compartilharem um só link com toda a família. Cada presente é marcado quando é comprado, para ninguém repetir, e a compra acontece no seu checkout.",
    sections: [
      {
        title: "Por que funciona para lojas de presentes e casa",
        lede: "As listas de fim de ano passam por pais, avós, tias e amigos. Cada uma é um motivo para visitar a sua loja.",
        cards: [
          { title: "Um link para a família toda", detail: "Os compradores compartilham a lista por mensagem, WhatsApp ou e-mail. A família abre em qualquer celular, sem nada para se cadastrar." },
          { title: "Sem presentes repetidos", detail: "Enquanto alguém finaliza a compra, a lista mostra “Alguém pode estar comprando este item”. Depois de comprado, ele fica marcado como escolhido." },
          { title: "Seus produtos primeiro", detail: "A lista fica no domínio da sua loja e os seus produtos ficam no topo, para comprar com um toque." },
        ],
      },
      {
        title: "Configurado em minutos",
        lede: "Sem código de tema. Se você já usa o Giftpin para listas, é só marcar uma opção.",
        cards: [
          { title: "Marque Lista de desejos", detail: "No Giftpin, abra Configurações e marque Lista de desejos em Ocasiões. Ela não tem data de evento, então serve para o Natal, o Hanukkah, o Diwali ou qualquer época do ano." },
          { title: "Adicione o botão", detail: "O botão Add to registry vai nas suas páginas de produto como bloco de tema, para que os compradores adicionem os seus produtos enquanto navegam." },
          { title: "Espaço para tudo", detail: "Permita itens de outras lojas e a lista continua completa, com o seu produto mais parecido sugerido ao lado de cada um." },
        ],
      },
      {
        title: "Pronto antes do congelamento de código de fim de ano",
        lede: "Muitas lojas param de mexer no tema antes da Black Friday. Ativar as listas de desejos é uma configuração do app mais um bloco de tema, então vale fazer agora, antes da correria.",
        cards: [],
      },
    ],
    faq: [
      { q: "É um botão de lista de desejos para guardar produtos para depois?", a: "Não. As listas de desejos do Giftpin foram feitas para ser compartilhadas: o comprador monta uma lista, envia um link para a família e os amigos, e os presentes são marcados conforme são comprados. Se você quer um botão de coração para guardar produtos e comprar você mesmo depois, um app de lista de desejos dedicado é mais adequado." },
      { q: "Como ativo as listas de desejos?", a: "No Giftpin, abra Configurações, marque Lista de desejos em Ocasiões e salve. Ela fica desativada até você ativar. Os compradores então escolhem Lista de desejos ao criar uma lista, e não há data de evento para preencher." },
      { q: "Uma lista pode incluir itens de outras lojas?", a: "Pode, se você permitir itens de outras lojas nas configurações. Seus próprios produtos ficam no topo da lista, e o Giftpin sugere o seu produto mais parecido ao lado de tudo o que for adicionado de outro lugar." },
      { q: "Os familiares precisam de conta?", a: "Não. Eles abrem o link, veem o que já foi escolhido e compram na sua loja com o seu checkout normal, inclusive com Shop Pay." },
      { q: "Quanto custa?", a: "As listas de desejos estão no plano gratuito, com listas, itens e convidados ilimitados. O {pro} custa {price} por mês, com um {trial}. Nenhum dos planos fica com uma parte das suas vendas de produtos." },
    ],
    finalCta: "Dê aos compradores uma lista de fim de ano que começa na sua loja.",
  },

  giftCards: {
    title: "Cartões-presente de lojas Shopify independentes | Giftpin",
    description: "Compre um cartão-presente de uma loja independente que usa o Giftpin. Escolha um valor, pague no checkout da loja e envie o cartão por e-mail.",
    eyebrow: "Cartões-presente",
    h1a: "Cartões-presente de",
    h1b: "lojas independentes.",
    lede: "Escolha uma loja, um valor de até {max} e pague no checkout da própria loja. A loja envia o cartão-presente por e-mail, para você ou direto para a pessoa que vai recebê-lo.",
    emptyH: "Nenhuma loja listada ainda",
    emptyP: "Volte em breve. Tem uma loja Shopify? Você pode ser a primeira.",
    buy: "Comprar um cartão-presente",
    otherCountries: "Outros países",
    questions: "Perguntas",
    merchantLine: 'Tem uma loja Shopify? <a href="/setup#gift-cards">Veja como listar seus cartões-presente</a>.',
    faq: [
      { q: "Quem vende o cartão-presente?", a: "A loja. Você paga no checkout da própria loja, e ela envia o cartão-presente por e-mail. Ele só pode ser usado nessa loja." },
      { q: "Posso enviá-lo direto para alguém?", a: "Pode. Marque “Enviar direto por e-mail para alguém” e informe o e-mail da pessoa. Use para isso o botão normal de finalizar compra da loja, porque a Shopify envia o cartão ao comprador quando você paga com Shop Pay." },
      { q: "Como listo a minha loja aqui?", a: "Instale o Giftpin na sua loja Shopify, adicione um produto de cartão-presente e, nas configurações do Giftpin, marque “Listar meus vales-presente no giftpin.app”. Faz parte do {pro}, com uma taxa de {fee}% sobre os cartões-presente vendidos assim (nenhuma durante o seu teste gratuito). O dinheiro e qualquer saldo não utilizado ficam com você." },
    ],
  },
};
