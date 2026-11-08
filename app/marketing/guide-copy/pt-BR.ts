import type { GuideCopy } from "./types";

const CHROME = "https://chromewebstore.google.com/detail/giftpin-%E2%80%94-add-to-registry/hfmielpmefknpgpekhfehnfdlhiobdkk";

export const ptBR: GuideCopy = {
  ui: {
    language: "Idioma",
    shotsNote: "As capturas de tela mostram a versão em inglês das telas.",
    shopifyNote:
      "Os nomes das telas da Shopify (por exemplo, Online Store → Navigation) aparecem em inglês, como no painel da Shopify em inglês. No seu idioma, eles podem aparecer traduzidos.",
    finalCta: "Pronto para oferecer uma lista de presentes aos seus clientes?",
  },

  setup: {
    eyebrow: "Guia de configuração",
    h1: `Configure o Giftpin<br><span class="grad-text">em cerca de dez minutos</span>`,
    lede: "Tudo o que um lojista precisa, da instalação à primeira lista. O texto em negrito é exatamente o que você verá na tela.",
    metaTitle: "Guia de configuração do Giftpin para lojistas da Shopify",
    description:
      "Como instalar o Giftpin, adicionar o botão e os links de lista ao seu tema da Shopify, escolher ocasiões e configurações, encontrar cada botão Salvar e ativar os recursos Pro.",
    sections: [
      {
        title: "Primeiros passos",
        steps: [
          {
            title: "Instalar o Giftpin",
            items: [
              "Abra o Giftpin na Shopify App Store e clique em <b>Install</b>.",
              "Aprove a tela de permissões. O Giftpin abre na página <b>{{admin.nav.overview}}</b> dentro do seu painel da Shopify.",
            ],
          },
          {
            title: "Adicionar o Giftpin ao seu tema",
            items: [
              "Em <b>{{admin.nav.overview}}</b>, vá até <b>{{admin.theme.title}}</b> e escolha um tema. Você pode configurar primeiro uma cópia não publicada.",
              "Clique em <b>{{admin.theme.btnAdd}}</b>. O editor de temas abre com o botão Add to registry já adicionado. Arraste-o para onde quiser e pressione <b>Save</b>, no canto superior direito do editor de temas.",
              "De volta ao Giftpin, clique em <b>{{admin.theme.linksAdd}}</b>. Isso adiciona, abaixo do seu cabeçalho, os links para criar, encontrar e gerenciar listas. Pressione <b>Save</b> no editor de temas.",
              "Opcional, para uma lista de favoritos: clique em <b>{{admin.theme.heartAdd}}</b>. A página de produto abre no editor de temas com um coração <b>Save for later</b> adicionado. Pressione <b>Save</b>.",
              "Depois clique em <b>{{admin.theme.savedAdd}}</b>. Isso adiciona uma lista <b>Saved items</b> à sua página do carrinho, para que os compradores encontrem o que marcaram com o coração. Pressione <b>Save</b>.",
              "Esses dois não são ativados automaticamente. Até você adicioná-los no editor de temas e pressionar <b>Save</b>, os compradores não verão nenhum coração. Os corações ficam guardados no próprio navegador do comprador, sem conta, então a lista aparece vazia em um dispositivo novo.",
              "Prefere posicioná-los à mão? No editor de temas, abra a página, clique em <b>Add block</b> (ou <b>Add section</b>), abra o grupo <b>Apps</b> e escolha <b>Save for later</b> ou <b>Saved items</b>.",
              "Usa um tema antigo (anterior ao Online Store 2.0)? Os blocos não funcionam nele, mas as suas páginas de lista funcionam: adicione um item de menu que aponte para <b>/apps/registry</b> em <b>Online Store → Navigation</b>.",
            ],
            alts: [
              "A página Visão geral do Giftpin com o cartão Adicionar o Giftpin ao seu tema e os botões para adicionar o botão às páginas de produto e os links de lista",
              "O editor de temas da Shopify com o bloco Add to registry selecionado em uma página de produto",
            ],
          },
          {
            title: "Conferir as suas páginas de lista",
            items: [
              "Em <b>{{admin.nav.overview}}</b>, em <b>{{admin.ov.pages}}</b>, clique em <b>{{admin.ov.create}}</b> para ver a página que seus clientes usam.",
              "Crie uma lista de teste, adicione um produto com o botão Add to registry e abra o link de convidado para ver o que os convidados veem.",
              "Cada lista que seus clientes criam aparece em <b>{{admin.nav.registries}}</b>, no menu do Giftpin.",
            ],
            alts: [
              "Uma página de produto da loja com o botão Add to registry abaixo de Comprar agora, e os links para criar, encontrar e gerenciar listas acima",
              "A página Listas do Giftpin com duas listas de casamento, seus itens e o progresso",
            ],
          },
        ],
      },
      {
        title: "Onde ficam os botões Salvar",
        lede: "As alterações só valem depois de salvas, e cada tela coloca o botão em um lugar diferente. Esta é a lista completa.",
        tint: true,
        steps: [
          {
            title: "No editor de temas da Shopify",
            items: [
              "<b>Save</b> fica no canto superior direito do editor de temas. Adicionar, mover ou alterar um bloco do Giftpin não faz nada na sua loja ao vivo até você pressioná-lo.",
              "Os botões do Giftpin em <b>{{admin.nav.overview}}</b> apenas abrem o editor com o bloco adicionado. Eles não o salvam por você.",
            ],
          },
          {
            title: "Na página Configurações do Giftpin",
            items: [
              "<b>{{admin.set.save}}</b> fica no canto superior direito da página, no cabeçalho. Ele salva tudo, de <b>{{admin.set.occasions}}</b> até <b>{{admin.set.emails}}</b>.",
              "O mesmo botão <b>{{admin.set.save}}</b> aparece de novo no fim desse bloco, logo abaixo de <b>{{admin.set.emails}}</b>. Os dois fazem a mesma coisa, então use o que estiver mais perto.",
              "Você verá a mensagem <b>{{admin.set.toast}}</b> na parte de baixo da tela, e <b>{{admin.set.saved}}</b> ao lado do botão de baixo.",
              "<b>{{admin.set.funds}}</b>, que contém <b>{{admin.set.sell}}</b>, tem o seu próprio botão <b>{{admin.set.save}}</b> no fim da seção. O botão do cabeçalho não a salva: se você mudar algo ali, pressione o da própria seção.",
              "<b>{{admin.set.runNow}}</b> é uma ação, não uma configuração, então não há nada a salvar.",
            ],
          },
          {
            title: "Nas outras páginas do Giftpin",
            items: [
              "<b>{{admin.nav.promotions}}</b>: preencha <b>{{admin.promo.new}}</b> e clique em <b>{{admin.promo.createBtn}}</b> no fim do formulário. <b>{{admin.promo.pause}}</b>, <b>{{admin.promo.resume}}</b> e <b>{{admin.promo.delete}}</b> na lista agem na hora.",
              "<b>{{admin.nav.inStore}}</b>: clique em <b>{{admin.ins.create}}</b> no fim de <b>{{admin.ins.start}}</b>.",
              "<b>{{admin.reg.import}}</b>: escolha o arquivo, clique no botão que o verifica, leia o que vai acontecer e clique no botão de importar que aparece.",
              "<b>{{admin.nav.registries}}</b>, <b>{{admin.nav.analytics}}</b> e <b>{{admin.nav.overview}}</b> só mostram informações, então não há nada a salvar.",
            ],
          },
          {
            title: "Na página de gerenciamento de quem cria a lista",
            items: [
              "Quem cria uma lista tem a sua própria página, aberta pelo link privado do e-mail. Diga a essas pessoas onde salvar: uma lista só guarda o que foi salvo.",
              "<b>{{manage.prefs.save}}</b> fica no fim de <b>{{manage.prefs.settings}}</b>, dentro de <b>{{manage.prefs.open}}</b>, perto do fim da página. Ele salva o nome, a ocasião, a data, o recado, o idioma e quem pode ver a lista.",
              "<b>{{manage.save}}</b> dentro de <b>{{manage.ship.title}}</b> salva o endereço de entrega. É um botão separado do de cima.",
              "<b>{{manage.item.update}}</b> em um item salva a quantidade, a observação e a categoria desse item.",
              "Durante a configuração inicial, os botões são <b>{{manage.setup.saveContinue}}</b> e <b>{{manage.setup.skip}}</b>.",
            ],
          },
        ],
      },
      {
        title: "Deixe com a sua cara",
        lede: "Tudo na página Configurações do Giftpin.",
        steps: [
          {
            title: "Escolher as suas ocasiões",
            items: [
              "Abra <b>{{admin.nav.settings}}</b>. Em <b>{{admin.set.occasions}}</b>, marque os tipos de lista que os clientes podem criar: casamentos, chás de bebê, aniversários, formaturas, chás de casa nova e mais.",
              "Marque <b>{{event.wishlist}}</b> para uma lista compartilhável sem data de evento, como uma lista de desejos de fim de ano. Ela fica desativada até você ativá-la.",
              "Pressione <b>{{admin.set.save}}</b> (no canto superior direito).",
            ],
            alts: ["As configurações do Giftpin mostrando a lista de ocasiões e as opções para itens de outras lojas"],
          },
          {
            title: "Decidir sobre itens de outras lojas",
            items: [
              "Em <b>{{admin.set.ext}}</b>, escolha <b>{{admin.set.extOn}}</b>, <b>{{admin.set.extCapped}}</b> ou <b>{{admin.set.extOff}}</b>.",
              "Permiti-los é o que faz os clientes escolherem a sua lista como a principal. O Giftpin sugere o seu produto mais parecido ao lado de cada item de fora.",
            ],
          },
          {
            title: "Decidir o que acontece quando um produto esgota",
            items: [
              "Em <b>{{admin.set.soldOut}}</b>, escolha <b>{{admin.set.soldOutShow}}</b> ou <b>{{admin.set.soldOutHide}}</b>.",
              "O Giftpin confere o seu estoque ao vivo toda vez que um convidado abre uma lista. O item sempre continua na lista, então volta sozinho quando você repõe o estoque.",
            ],
          },
          {
            title: "Combinar a aparência e o idioma com a sua loja",
            items: [
              "Em <b>{{admin.set.appearance}}</b>, defina <b>{{admin.set.buttonLabel}}</b> e <b>{{admin.set.accent}}</b>.",
              "<b>{{admin.set.langLabel}}</b> escolhe o idioma que os convidados veem nas páginas de lista e nos e-mails: inglês, francês, espanhol, alemão ou português do Brasil.",
              "O botão Add to registry e os links de lista têm configurações próprias no editor de temas: texto, ícone, cores, tamanho e espaçamento.",
              "Para que compradores que mantêm a lista em outro lugar também usem o seu botão, marque <b>Also offer Babylist</b> ou <b>Also offer \"Another registry\"</b> (copia o link do produto para sites como a Zola) nas configurações do botão. O botão passa a perguntar em qual lista.",
              "Com o Pro, <b>{{admin.set.branding}}</b> adiciona o seu logotipo (<b>{{admin.set.logo}}</b>), as suas cores e fonte às páginas de lista e remove o crédito Powered by Giftpin.",
            ],
            alts: ["A seção Aparência das configurações do Giftpin com os campos de texto do botão e cor de destaque"],
          },
          {
            title: "Definir a privacidade",
            items: [
              "Em <b>{{admin.set.privacy}}</b>, escolha se quer <b>{{admin.set.hideBuyer}}</b> e se ativa a página pública para encontrar listas (<b>{{admin.set.find}}</b>). Só aparecem ali as listas cujos donos aceitaram. Ela fica desativada até você marcar: até lá, o link de busca da sua loja pede aos visitantes o link da lista.",
            ],
          },
          {
            title: "Oferecer vantagens a quem cria listas (Pro)",
            items: [
              "Em <b>{{admin.set.perks}}</b>, escreva o que você oferece a quem cria a lista com você, uma por linha, em <b>{{admin.set.perksLabel}}</b>: embrulho de presente grátis, um presente quando a lista chegar a um total, e assim por diante.",
              "Quem cria a lista vê essas vantagens enquanto a cria. Pressione <b>{{admin.set.save}}</b>.",
            ],
          },
        ],
      },
      {
        title: "Pro",
        lede: "Extras opcionais para lojas que querem mais.",
        steps: [
          {
            title: "Começar o Pro",
            items: [
              "Abra <b>{{admin.nav.plan}}</b> no menu do Giftpin e clique no botão de upgrade. Você ganha {{trialDays}} dias de teste grátis e depois o {{proName}} custa {{price}} por mês. <b>{{admin.bill.cancel}}</b> fica na mesma página.",
            ],
          },
          {
            title: "Presentes em grupo e fundos",
            items: [
              "No painel da Shopify, vá a <b>Products → Gift cards → Add a gift card product</b>, com alguns valores como US$ 25, US$ 50 e US$ 100.",
              "Em <b>Settings → General → Order processing</b>, escolha <b>Automatically fulfill only the gift cards</b>. A Shopify só envia um cartão-presente depois que o pedido é cumprido.",
              "No Giftpin, abra <b>{{admin.nav.settings}}</b>. Em <b>{{admin.set.funds}}</b>, escolha esse cartão-presente em <b>{{admin.set.fundsPick}}</b> e pressione o <b>{{admin.set.save}}</b> dessa seção. Os convidados já podem contribuir para um presente grande ou um fundo em dinheiro.",
            ],
          },
          {
            id: "gift-cards",
            title: "Vender cartões-presente no giftpin.app",
            items: [
              "Configure primeiro o cartão-presente no passo anterior. A listagem usa o mesmo cartão-presente, com valores de até US$ 500.",
              "No Giftpin, abra <b>{{admin.nav.settings}}</b>. Em <b>{{admin.set.sell}}</b>, marque <b>{{admin.set.listMine}}</b>, adicione <b>{{admin.set.blurb}}</b> e pressione o <b>{{admin.set.save}}</b> dessa seção.",
              "A sua loja agora aparece em <a href=\"/gift-cards?lang=pt-BR\">giftpin.app/gift-cards</a>, no seu país, e as suas páginas de lista ganham um link <b>Rather give a gift card?</b>. Os compradores adquirem o seu cartão-presente no seu próprio checkout, então você fica com o dinheiro e com qualquer saldo não utilizado. Os cartões-presente vendidos assim aparecem em <b>{{admin.nav.analytics}}</b>.",
              "O Giftpin cobra {{feePct}}% de cada cartão-presente vendido dessa forma, na sua fatura da Shopify, {{holdDays}} dias depois da venda, para que um cartão reembolsado nunca seja cobrado. Não há taxa durante o seu teste grátis.",
            ],
          },
          {
            title: "Desconto pós-evento e e-mails automáticos",
            items: [
              "Em <b>{{admin.set.after}}</b>, ative <b>{{admin.set.discount}}</b> e defina <b>{{admin.set.discountPct}}</b> e <b>{{admin.set.discountDays}}</b>.",
              "Em <b>{{admin.set.emails}}</b>, escolha <b>{{admin.set.guestRemind}}</b>, <b>{{admin.set.mostGone}}</b> e <b>{{admin.set.thanks}}</b>.",
              "Pressione <b>{{admin.set.save}}</b> (no canto superior direito). Para testá-los sem esperar um dia, use <b>{{admin.set.runNow}}</b> no fim das Configurações.",
            ],
          },
          {
            title: "Promoções de lista",
            items: [
              "Abra <b>{{admin.nav.promotions}}</b>. Em <b>{{admin.promo.new}}</b>, escolha <b>{{admin.promo.typeSale}}</b> ou <b>{{admin.promo.typeCoupon}}</b>, defina o desconto e as datas e clique em <b>{{admin.promo.createBtn}}</b>.",
              "Uma promoção só vale para presentes colocados no carrinho a partir de uma página de lista. O mesmo produto comprado do jeito habitual mantém o preço normal.",
              "As promoções também aparecem na página Discounts da Shopify, com um nome que começa com “Giftpin:”.",
            ],
          },
          {
            title: "Análises e relatório de vendas",
            items: [
              "Abra <b>{{admin.nav.analytics}}</b> para ver as listas criadas, os itens adicionados e os presentes comprados ao longo do tempo, onde os presentes foram comprados e um relatório de vendas mês a mês. <b>{{admin.an.csv}}</b> exporta o relatório.",
              "Em <b>{{admin.nav.registries}}</b>, <b>{{admin.reg.csvRegs}}</b> e <b>{{admin.reg.csvPurch}}</b> exportam as listas e as compras.",
            ],
          },
          {
            title: "Modo loja física e Shopify POS",
            items: [
              "Abra <b>{{admin.nav.inStore}}</b> no menu do Giftpin para encontrar a lista de um cliente ou criar uma para ele no balcão.",
              "Para registrar presentes de lista no Shopify POS, adicione o bloco do Giftpin: no painel da Shopify, abra <b>Point of Sale</b>, depois o editor do POS, escolha <b>Add tile → Embedded Apps</b> e selecione o Giftpin. Os produtos precisam estar publicados no canal Point of Sale.",
              "Quem cria listas também pode escanear com o celular o código de barras de um produto na sua loja para adicioná-lo: abre <b>{{manage.scan.open}}</b> na própria página de gerenciamento. É preciso ter códigos de barras (ou SKUs) nos seus produtos, e funciona melhor com um único código de barras bem enquadrado.",
            ],
          },
        ],
      },
      {
        title: "Mais ferramentas",
        lede: "Recursos menores que talvez você ainda não tenha notado.",
        tint: true,
        steps: [
          {
            title: "Trazer listas de outro aplicativo",
            items: [
              "Abra <b>{{admin.nav.registries}}</b> e clique em <b>{{admin.reg.import}}</b>. Exporte as suas listas do aplicativo antigo em CSV, com uma linha por item, e escolha o arquivo em <b>{{admin.imp.fileLabel}}</b>.",
              "O Giftpin associa cada item aos seus produtos por SKU ou código de barras e mostra o que vai fazer antes de mudar qualquer coisa. Marque <b>{{admin.imp.email}}</b> só se os seus clientes esperam receber notícias suas sobre a mudança.",
            ],
          },
          {
            title: "Painéis de listas no painel da Shopify",
            items: [
              "Em um pedido, um cliente ou uma página de produto no painel da Shopify, abra <b>More actions → Giftpin registry</b> para ver a qual lista ele pertence, se aquela pessoa tem uma ou quais listas incluem o produto.",
              "Se você não o vir, as extensões precisam de um <code>shopify app deploy</code> uma única vez, a partir do código do aplicativo.",
            ],
          },
          {
            title: "Shopify Flow (Pro)",
            items: [
              "O Giftpin adiciona três gatilhos ao Shopify Flow: <b>Registry created</b>, <b>Registry event coming up</b> e <b>Registry gift bought</b>. Use-os para escrever a quem criou a lista, marcar um cliente ou avisar a sua equipe.",
              "Os e-mails de quem cria listas servem para mensagens sobre a própria lista. Enviar marketing a essas pessoas continua exigindo o consentimento delas.",
            ],
          },
          {
            title: "Idiomas",
            items: [
              "Convidados e quem cria listas veem as páginas de lista e os e-mails no idioma que você escolher em <b>{{admin.set.appearance}}</b> → <b>{{admin.set.langLabel}}</b>. As páginas de administração do Giftpin seguem o idioma do seu painel da Shopify quando a Shopify o repassa ao aplicativo e, caso contrário, o idioma do seu navegador.",
              "Os nomes e recados digitados pelas pessoas, e os títulos dos seus produtos, ficam como foram escritos.",
            ],
          },
        ],
      },
    ],
    faqTitle: "Perguntas frequentes",
    faq: [
      {
        q: "Onde vejo as listas dos meus clientes?",
        a: "Abra Listas no menu do Giftpin. A Visão geral mostra a receita das listas, os clientes novos e os presentes dados.",
      },
      {
        q: "Quem cria listas ou os convidados precisam de uma conta?",
        a: "Não. Quem cria a lista recebe por e-mail um link privado de gerenciamento, e os convidados só precisam do link da lista.",
      },
      {
        q: "Mudei uma configuração e nada aconteceu.",
        a: "Confira se você pressionou Salvar. No editor de temas, ele fica no canto superior direito. Nas Configurações do Giftpin, ele fica no canto superior direito e de novo abaixo de E-mails automáticos, e Presentes em grupo e fundos tem o seu próprio botão Salvar.",
      },
      {
        q: "O que acontece com os blocos do tema se eu desinstalar?",
        a: "A Shopify remove automaticamente os dois blocos do Giftpin dos seus temas.",
      },
      {
        q: "Estou travado. Com quem falo?",
        a: "Escreva para support@giftpin.app com o endereço .myshopify.com da sua loja e o que você estava tentando fazer.",
      },
    ],
  },

  registry: {
    eyebrow: "Guia da lista",
    h1: `Crie a sua lista de presentes<br><span class="grad-text">e compartilhe um único link</span>`,
    lede: "Como criar uma lista do Giftpin, adicionar presentes desta loja e de qualquer outro lugar e compartilhá-la com os seus convidados. O texto em negrito é exatamente o que você verá na tela.",
    metaTitle: "Como criar uma lista de presentes com o Giftpin",
    description:
      "Como criar uma lista de presentes do Giftpin em uma loja, adicionar presentes dessa loja e de qualquer outro site, compartilhá-la com os convidados, salvar as alterações e receber os presentes em casa.",
    sections: [
      {
        title: "Primeiros passos",
        steps: [
          {
            title: "Crie a sua lista",
            items: [
              "No site da loja, clique no link para criar uma lista de presentes (por padrão <b>Create a gift registry</b>, geralmente abaixo do cabeçalho ou no menu; a loja pode ter mudado o texto). Você também pode pressionar o botão Add to registry (por padrão <b>Add to registry</b>) em qualquer produto, e será convidado a criar uma.",
              "Escolha a ocasião em <b>{{create.occasion}}</b> e preencha <b>{{create.name}}</b>, <b>{{create.when}}</b>, <b>{{create.yourName}}</b> e <b>{{create.yourEmail}}</b>.",
              "Em <b>{{create.country}}</b>, escolha o país dos seus convidados. O Giftpin usa isso para sugerir lojas para o que esta loja não vende.",
              "Se quiser, escreva <b>{{create.note}}</b> e clique em <b>{{create.submit}}</b>.",
            ],
            alts: ["O formulário de criação de lista, com a ocasião, o nome da lista, a data, o nome, o e-mail e o país preenchidos"],
          },
          {
            title: "Guarde o seu link privado",
            items: [
              "O Giftpin envia por e-mail um link privado para gerenciar a sua lista. Você não precisa de conta nem de senha: esse link é a sua porta de entrada, então guarde o e-mail. Ele vale por 90 dias.",
              "Perdeu o link ou ele parou de funcionar? Na página de criar lista da loja, em <b>Já tem uma?</b>, digite o seu e-mail e clique em <b>{{create.resendButton}}</b>. O link que você receber mostra todas as listas que você criou com esse e-mail.",
              "Nunca compartilhe esse link. Qualquer pessoa com ele pode editar a sua lista. Os convidados recebem um link diferente (veja Compartilhe abaixo).",
            ],
            alts: ["O e-mail que o Giftpin envia, com o botão para abrir a minha lista"],
          },
        ],
      },
      {
        title: "Adicione os seus presentes",
        lede: "Desta loja e de qualquer outro site.",
        tint: true,
        steps: [
          {
            title: "Adicionar produtos desta loja",
            items: [
              "Navegue pela loja e clique em <b>Add to registry</b> em qualquer página de produto. Você verá <b>Added to your registry</b> e um link <b>Back to your registry</b>.",
              "Se pressionar de novo no mesmo produto, ele pergunta quantos você quer no total, para que nada seja adicionado duas vezes por acidente.",
              "Usando outro celular ou computador? Abra primeiro o seu link privado do e-mail lá, para o botão saber qual é a sua lista.",
            ],
            alts: ["Uma página de produto depois de pressionar Add to registry, mostrando Added to your registry e um link Back to your registry"],
          },
          {
            title: "Adicionar presentes de qualquer outro site",
            items: [
              "Na sua lista, vá a <b>{{manage.addItems}}</b>, cole o endereço do produto em <b>{{manage.productLink}}</b> e clique em <b>{{manage.lookUp}}</b>. O Giftpin preenche o nome, a foto e o preço.",
              "Algumas lojas grandes bloqueiam essa leitura. Se isso acontecer, digite você mesmo <b>{{manage.name}}</b> e <b>{{manage.price}}</b> e clique em <b>{{manage.addToReg}}</b>.",
              "O Giftpin pode mostrar algo parecido desta loja. Clique em <b>{{manage.match.swap}}</b> para ver, ou mantenha o seu item original.",
            ],
            alts: ["A caixa Adicionar itens com um link da Target consultado, mostrando a foto, o nome e o preço encontrados"],
          },
          {
            title: "Ou use a extensão do Chrome",
            items: [
              `No computador, instale <a href="${CHROME}" target="_blank" rel="noopener">a extensão do Giftpin para Chrome</a>.`,
              "Na sua lista, em <b>{{manage.ext.title}}</b>, clique em <b>{{manage.ext.copy}}</b>. Abra a extensão, cole em <b>Manage link</b> e clique em <b>Connect</b>. Você só faz isso uma vez.",
              "Depois, em qualquer página de produto de qualquer site, abra a extensão, escolha a <b>Quantity</b> e clique em <b>Add to registry</b>.",
            ],
            alts: ["A extensão do Giftpin em uma página de produto do Walmart, com a quantidade e o botão Add to registry"],
          },
          {
            title: "Na loja física? Escaneie um código de barras",
            items: [
              "Se a loja oferecer, abra o seu link privado no celular e toque em <b>{{manage.scan.open}}</b>. Aponte a câmera para um código de barras em uma etiqueta ou caixa, e o produto é adicionado à sua lista.",
              "Permita a câmera quando o celular pedir. Se ela não abrir, digite o número abaixo do código de barras em <b>{{manage.scan.codeLabel}}</b> e toque em <b>{{manage.scan.lookUp}}</b>.",
              "Preencha a tela com um único código de barras, para que um vizinho não seja lido por engano.",
            ],
          },
          {
            title: "Ajustar a sua lista",
            items: [
              "Em <b>{{manage.yourList}}</b>, abra qualquer item para mudar <b>{{manage.item.qty}}</b>, adicionar <b>{{manage.item.noteLabel}}</b> (um tamanho ou uma cor, por exemplo) ou escolher uma <b>{{manage.item.category}}</b>, e clique em <b>{{manage.item.update}}</b>.",
              "Não sabe o que adicionar? Toque em <b>{{manage.ideas.open}}</b> para ver ideias para a sua ocasião.",
            ],
            alts: ["Um item da lista aberto para edição, com uma observação para convidados, a quantidade e a categoria"],
          },
        ],
      },
      {
        title: "Compartilhe",
        steps: [
          {
            title: "Compartilhar com os convidados",
            items: [
              "No topo da sua lista, clique em <b>{{manage.shareBtn}}</b> e envie o link por e-mail, mensagem de texto, WhatsApp ou Facebook, ou clique em <b>{{manage.copyLink}}</b>.",
              "Prefere um código para um convite ou uma placa? Clique em <b>{{manage.qr}}</b>, ao lado dos botões de compartilhar, e depois em <b>{{manage.qr.download}}</b>. Os convidados apontam a câmera do celular e abrem a sua lista.",
              "Os convidados veem os seus presentes e o que ainda falta. Eles nunca veem o seu e-mail nem o seu endereço e não precisam de conta.",
            ],
            alts: [
              "O link de compartilhamento com os botões Copiar link, E-mail, Mensagem de texto, WhatsApp e Facebook",
              "O que os convidados veem: a lista com um item da loja, um presente já garantido e um item do Walmart",
            ],
          },
          {
            title: "Organizar com outra pessoa",
            items: [
              "Logo depois de criar a lista, perguntamos <b>{{manage.setup.partnerTitle}}</b> Você também pode fazer isso depois: clique em <b>{{manage.prefs.open}}</b>, role até <b>{{manage.partner.title}}</b>, digite <b>{{manage.partner.name}}</b> e <b>{{manage.partner.email}}</b> e clique em <b>{{manage.partner.add}}</b>.",
              "Essa pessoa recebe o seu próprio link privado. Ela pode adicionar presentes, ver o que foi comprado e mudar as configurações. O e-mail dela nunca aparece para os convidados, e <b>{{manage.partner.remove}}</b> desativa o link dela na hora.",
            ],
          },
          {
            title: "Escolher quem pode ver",
            items: [
              "No fim da sua lista, clique em <b>{{manage.prefs.open}}</b>. Em <b>{{manage.prefs.settings}}</b>, use <b>{{manage.prefs.who}}</b>: <b>{{manage.prefs.priv.unlisted}}</b>, <b>{{manage.prefs.priv.password}}</b> ou <b>{{manage.prefs.priv.public}}</b> na página da loja para encontrar listas (por padrão <b>Find a gift registry</b>).",
              "Clique em <b>{{manage.prefs.save}}</b>. A mesma seção permite mudar o nome, a ocasião, a data e o recado. Se a loja permitir, também há <b>{{manage.lang.label}}</b>.",
            ],
            alts: ["O menu Quem pode ver isto com as suas três opções"],
          },
          {
            title: "Receber os presentes em casa",
            items: [
              "Logo depois de criar a lista, perguntamos <b>{{manage.setup.shipTitle}}</b> Marque a caixa e digite o seu endereço de entrega, ou pule por enquanto.",
              "Para mudar depois, clique em <b>{{manage.prefs.open}}</b>, e em <b>{{manage.ship.title}}</b> marque a caixa, digite o seu endereço e clique em <b>{{manage.save}}</b>. Os convidados podem então enviar os presentes desta loja direto para você.",
              "Cada convidado decide ao colocar um presente no carrinho: enviar para você ou para si mesmo. Os convidados nunca veem o seu endereço.",
            ],
            alts: ["A seção Permitir que os convidados enviem presentes para mim, com a caixa marcada e um endereço de entrega preenchido"],
          },
        ],
      },
      {
        title: "Onde pressionar Salvar",
        lede: "Uma lista só guarda o que você salva. Cada parte da página tem o seu próprio botão.",
        tint: true,
        steps: [
          {
            title: "Qual botão salva o quê",
            items: [
              "<b>{{manage.prefs.save}}</b> fica no fim de <b>{{manage.prefs.settings}}</b>, dentro de <b>{{manage.prefs.open}}</b>, perto do fim da página. Ele salva o nome, a ocasião, a data, o recado e quem pode ver a lista. Se você mudou algo e saiu sem pressioná-lo, a alteração se perde.",
              "<b>{{manage.save}}</b> dentro de <b>{{manage.ship.title}}</b>, logo abaixo no mesmo painel, salva o seu endereço de entrega. É separado do botão acima, então pressione os dois se mudou as duas coisas.",
              "<b>{{manage.partner.add}}</b> em <b>{{manage.partner.title}}</b>, mais abaixo, envia o link para a sua pessoa de apoio e a salva.",
              "<b>{{manage.item.update}}</b> em um item salva a quantidade, a observação e a categoria desse item.",
              "<b>{{manage.addToReg}}</b> salva um item novo assim que você clica.",
              "Você verá <b>{{manage.flash.saved}}</b> perto do topo da página quando tudo tiver dado certo.",
            ],
          },
        ],
      },
    ],
    faqTitle: "Perguntas frequentes",
    faq: [
      {
        q: "Como os convidados evitam comprar a mesma coisa?",
        a: "Os pedidos feitos nesta loja atualizam a sua lista automaticamente. Para presentes de outros sites, os convidados tocam em Eu comprei isto depois de comprar, e o item aparece como garantido. Quem mudar de ideia pode desfazer por 24 horas.",
      },
      {
        q: "Como sei quem me deu o quê?",
        a: "A sua lista tem uma relação Quem deu o quê para os seus agradecimentos, e o Giftpin avisa por e-mail quando alguém compra um presente.",
      },
      {
        q: "Os convidados podem juntar dinheiro para algo grande?",
        a: "Se a loja oferecer, sim. A sua lista pode transformar um item em um presente em grupo, ou manter um fundo em dinheiro para uma lua de mel ou uma casa, pago como cartões-presente da loja.",
      },
      {
        q: "Mudei algo e não ficou salvo.",
        a: "Pressione o botão Salvar daquela parte da página: Salvar alterações em Editar lista e preferências, Salvar em Permitir que os convidados enviem presentes para mim, ou Atualizar em um item.",
      },
      {
        q: "Posso excluir a minha lista?",
        a: "Sim. Clique em Editar lista e preferências no fim da sua lista e depois em Excluir lista. Isso remove todos os itens e o registro de quem comprou o quê, e não pode ser desfeito.",
      },
    ],
  },
};
