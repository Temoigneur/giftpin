import type { GuideCopy } from "./types";

const CHROME = "https://chromewebstore.google.com/detail/giftpin-%E2%80%94-add-to-registry/hfmielpmefknpgpekhfehnfdlhiobdkk";

export const zhCN: GuideCopy = {
  ui: {
    language: "语言",
    shotsNote: "截图显示的是界面的英文版本。",
    shopifyNote:
      "Shopify 自带的界面名称（例如 Online Store → Navigation）以英文标示，与英文版 Shopify 后台一致。在您的语言下，它们可能显示为翻译后的名称。",
    finalCta: "准备好为您的顾客提供礼物清单了吗？",
  },

  setup: {
    eyebrow: "安装指南",
    h1: `设置 Giftpin<br><span class="grad-text">大约只需十分钟</span>`,
    lede: "商家所需的一切，从安装到创建第一份礼物清单。粗体文字就是您在屏幕上看到的内容。",
    metaTitle: "面向 Shopify 商家的 Giftpin 安装指南",
    description:
      "如何安装 Giftpin，把礼物清单按钮和链接添加到您的 Shopify 主题，选择场合和设置，找到每一个保存按钮，并开启 Pro 功能。",
    sections: [
      {
        title: "开始使用",
        steps: [
          {
            title: "安装 Giftpin",
            items: [
              "在 Shopify 应用商店打开 Giftpin，然后点击 <b>Install</b>。",
              "确认权限页面。Giftpin 会在您的 Shopify 后台打开其 <b>{{admin.nav.overview}}</b> 页面。",
            ],
          },
          {
            title: "将 Giftpin 添加到您的主题",
            items: [
              "在 <b>{{admin.nav.overview}}</b> 页面，进入 <b>{{admin.theme.title}}</b> 并选择一个主题。您可以先在未发布的副本上设置。",
              "点击 <b>{{admin.theme.btnAdd}}</b>。主题编辑器会打开，并且已经添加了 Add to registry 按钮。把它拖到您想要的位置，然后点击主题编辑器右上角的 <b>Save</b>。",
              "回到 Giftpin，点击 <b>{{admin.theme.linksAdd}}</b>。这会在您的页眉下方添加创建、查找和管理礼物清单的链接。在主题编辑器中点击 <b>Save</b>。",
              "可选，用于收藏列表：点击 <b>{{admin.theme.heartAdd}}</b>。商品页面会在主题编辑器中打开，并添加一个 <b>Save for later</b> 心形按钮。点击 <b>Save</b>。",
              "然后点击 <b>{{admin.theme.savedAdd}}</b>。这会在您的购物车页面添加一个 <b>Saved items</b> 列表，方便顾客找到自己收藏的商品。点击 <b>Save</b>。",
              "这两项不会自动开启。在您于主题编辑器中添加并点击 <b>Save</b> 之前，顾客看不到心形按钮。收藏记录保存在顾客自己的浏览器中，无需账号，因此换一台新设备时列表是空的。",
              "想自己手动放置？在主题编辑器中打开页面，点击 <b>Add block</b>（或 <b>Add section</b>），打开 <b>Apps</b> 分组，然后选择 <b>Save for later</b> 或 <b>Saved items</b>。",
              "使用的是旧版主题（早于 Online Store 2.0）？这些区块在旧版主题中无法使用，但您的礼物清单页面仍然可用：请在 <b>Online Store → Navigation</b> 中添加一个指向 <b>/apps/registry</b> 的菜单项。",
            ],
            alts: [
              "Giftpin 的概览页面，包含“将 Giftpin 添加到您的主题”卡片，以及添加到商品页面的按钮和添加清单链接的按钮",
              "Shopify 主题编辑器，商品页面上选中了 Add to registry 区块",
            ],
          },
          {
            title: "检查您的礼物清单页面",
            items: [
              "在 <b>{{admin.nav.overview}}</b> 页面的 <b>{{admin.ov.pages}}</b> 下，点击 <b>{{admin.ov.create}}</b>，查看顾客使用的页面。",
              "创建一份测试礼物清单，用 Add to registry 按钮添加一件商品，然后打开宾客链接，看看宾客会看到什么。",
              "您的顾客创建的每一份礼物清单，都会显示在 Giftpin 菜单的 <b>{{admin.nav.registries}}</b> 下。",
            ],
            alts: [
              "店铺的商品页面，立即购买下方有 Add to registry 按钮，上方有创建、查找和管理礼物清单的链接",
              "Giftpin 的礼物清单页面，列出两份婚礼清单及其商品和进度",
            ],
          },
        ],
      },
      {
        title: "保存按钮在哪里",
        lede: "更改只有保存后才会生效，而且每个页面把按钮放在不同的位置。以下是完整列表。",
        tint: true,
        steps: [
          {
            title: "在 Shopify 主题编辑器中",
            items: [
              "<b>Save</b> 在主题编辑器的右上角。添加、移动或更改 Giftpin 区块后，在您点击它之前，对您的线上店铺不会有任何影响。",
              "<b>{{admin.nav.overview}}</b> 上的 Giftpin 按钮只会打开已添加区块的编辑器，并不会替您保存。",
            ],
          },
          {
            title: "在 Giftpin 的设置页面",
            items: [
              "<b>{{admin.set.save}}</b> 在页面右上角的页眉中。它会保存从 <b>{{admin.set.occasions}}</b> 到 <b>{{admin.set.emails}}</b> 的所有内容。",
              "同样的 <b>{{admin.set.save}}</b> 按钮会在该区块底部、<b>{{admin.set.emails}}</b> 的正下方再次出现。两者作用相同，用离您最近的那个即可。",
              "您会在屏幕底部看到 <b>{{admin.set.toast}}</b> 的提示，并在下方按钮旁看到 <b>{{admin.set.saved}}</b>。",
              "<b>{{admin.set.funds}}</b>（其中包含 <b>{{admin.set.sell}}</b>）在该部分底部有自己的 <b>{{admin.set.save}}</b> 按钮。页眉的按钮不会保存它：如果您在那里更改了内容，请点击该部分内的按钮。",
              "<b>{{admin.set.runNow}}</b> 是一个操作，不是设置，所以无需保存。",
            ],
          },
          {
            title: "在 Giftpin 的其他页面",
            items: [
              "<b>{{admin.nav.promotions}}</b>：填写 <b>{{admin.promo.new}}</b>，然后点击表单底部的 <b>{{admin.promo.createBtn}}</b>。列表中的 <b>{{admin.promo.pause}}</b>、<b>{{admin.promo.resume}}</b> 和 <b>{{admin.promo.delete}}</b> 会立即生效。",
              "<b>{{admin.nav.inStore}}</b>：点击 <b>{{admin.ins.start}}</b> 底部的 <b>{{admin.ins.create}}</b>。",
              "<b>{{admin.reg.import}}</b>：选择您的文件，点击检查文件的按钮，阅读将要执行的操作，然后点击出现的导入按钮。",
              "<b>{{admin.nav.registries}}</b>、<b>{{admin.nav.analytics}}</b> 和 <b>{{admin.nav.overview}}</b> 只显示信息，所以无需保存。",
            ],
          },
          {
            title: "在清单主人的管理页面",
            items: [
              "清单主人有自己的页面，可通过邮件中的专属链接打开。请告诉他们在哪里保存，因为礼物清单只会保留已保存的内容。",
              "<b>{{manage.prefs.save}}</b> 在页面靠下位置的 <b>{{manage.prefs.open}}</b> 里，位于 <b>{{manage.prefs.settings}}</b> 的末尾。它会保存名称、场合、日期、留言、语言以及谁可以查看。",
              "<b>{{manage.ship.title}}</b> 中的 <b>{{manage.save}}</b> 用于保存配送地址。它与上面的按钮是分开的。",
              "商品上的 <b>{{manage.item.update}}</b> 用于保存该商品的数量、备注和分类。",
              "首次设置时，按钮是 <b>{{manage.setup.saveContinue}}</b> 和 <b>{{manage.setup.skip}}</b>。",
            ],
          },
        ],
      },
      {
        title: "打造专属风格",
        lede: "全部在 Giftpin 的设置页面中完成。",
        steps: [
          {
            title: "选择您的场合",
            items: [
              "打开 <b>{{admin.nav.settings}}</b>。在 <b>{{admin.set.occasions}}</b> 下，勾选顾客可以创建的礼物清单类型：婚礼、迎婴派对、生日、毕业、乔迁等等。",
              "勾选 <b>{{event.wishlist}}</b>，可创建没有活动日期、可分享的清单，例如节日心愿单。在您开启之前它是关闭的。",
              "点击 <b>{{admin.set.save}}</b>（右上角）。",
            ],
            alts: ["Giftpin 设置页面，显示场合勾选列表和其他店铺商品的选项"],
          },
          {
            title: "决定是否允许其他店铺的商品",
            items: [
              "在 <b>{{admin.set.ext}}</b> 下，选择 <b>{{admin.set.extOn}}</b>、<b>{{admin.set.extCapped}}</b> 或 <b>{{admin.set.extOff}}</b>。",
              "允许这些商品，会让顾客把您的清单当作主要礼物清单。Giftpin 会在每件外部商品旁推荐您店里最接近的商品。",
            ],
          },
          {
            title: "决定商品售罄时怎么办",
            items: [
              "在 <b>{{admin.set.soldOut}}</b> 下，选择 <b>{{admin.set.soldOutShow}}</b> 或 <b>{{admin.set.soldOutHide}}</b>。",
              "每当宾客打开礼物清单时，Giftpin 都会检查您的实时库存。商品始终保留在清单上，所以补货后它会自动恢复。",
            ],
          },
          {
            title: "让外观和语言与您的店铺相配",
            items: [
              "在 <b>{{admin.set.appearance}}</b> 下，设置 <b>{{admin.set.buttonLabel}}</b> 和 <b>{{admin.set.accent}}</b>。",
              "<b>{{admin.set.langLabel}}</b> 决定宾客在礼物清单页面和清单邮件中看到的语言：英语、法语、西班牙语、德语或巴西葡萄牙语。如果您希望清单主人为自己的清单选择其他语言，请勾选 <b>{{admin.set.langChoice}}</b>。",
              "Add to registry 按钮和清单链接在主题编辑器中有各自的设置：文字、图标、颜色、大小和间距。",
              "如果想让把清单放在别处的顾客也能使用您的按钮，请在按钮设置中勾选 <b>Also offer Babylist</b> 或 <b>Also offer \"Another registry\"</b>（为 Zola 之类的网站复制商品链接）。这样按钮会询问要加入哪份清单。",
              "使用 Pro 时，<b>{{admin.set.branding}}</b> 会把您的徽标（<b>{{admin.set.logo}}</b>）、颜色和字体应用到礼物清单页面，并去掉 Powered by Giftpin 标识。",
            ],
            alts: ["Giftpin 设置页面的外观部分，包含按钮文字和强调色字段"],
          },
          {
            title: "设置隐私",
            items: [
              "在 <b>{{admin.set.privacy}}</b> 下，选择是否 <b>{{admin.set.hideBuyer}}</b>，以及是否开启公开的礼物清单查找页面（<b>{{admin.set.find}}</b>）。只有主人同意的清单才会列在那里。在您勾选之前它是关闭的：在此之前，您店铺上的查找链接会改为请访客输入清单链接。",
            ],
          },
          {
            title: "提供清单专属福利（Pro）",
            items: [
              "在 <b>{{admin.set.perks}}</b> 下，于 <b>{{admin.set.perksLabel}}</b> 中写下您为在您这里创建清单的人提供的福利，每行一条：免费礼品包装、清单达到一定金额时赠送一份礼物，等等。",
              "清单主人在创建清单时会看到这些福利。点击 <b>{{admin.set.save}}</b>。",
            ],
          },
        ],
      },
      {
        title: "Pro",
        lede: "为想要更多功能的店铺准备的可选扩展。",
        steps: [
          {
            title: "开通 Pro",
            items: [
              "在 Giftpin 菜单中打开 <b>{{admin.nav.plan}}</b>，然后点击升级按钮。您可以享受 {{trialDays}} 天免费试用，之后 {{proName}} 为每月 {{price}}。<b>{{admin.bill.cancel}}</b> 就在同一页面。",
            ],
          },
          {
            title: "集体送礼和礼金基金",
            items: [
              "在 Shopify 后台，进入 <b>Products → Gift cards → Add a gift card product</b>，设置几档金额，例如 $25、$50 和 $100。",
              "在 <b>Settings → General → Order processing</b> 中，选择 <b>Automatically fulfill only the gift cards</b>。Shopify 只有在订单履约后才会发送礼品卡。",
              "在 Giftpin 中打开 <b>{{admin.nav.settings}}</b>。在 <b>{{admin.set.funds}}</b> 下，于 <b>{{admin.set.fundsPick}}</b> 中选择该礼品卡，然后点击该部分自己的 <b>{{admin.set.save}}</b>。宾客现在就可以为大件礼物或礼金基金凑份子了。",
            ],
          },
          {
            id: "gift-cards",
            title: "在 giftpin.app 上销售礼品卡",
            items: [
              "请先按上一步设置好礼品卡。上架时使用的是同一张礼品卡，金额最高 $500。",
              "在 Giftpin 中打开 <b>{{admin.nav.settings}}</b>。在 <b>{{admin.set.sell}}</b> 下，勾选 <b>{{admin.set.listMine}}</b>，添加 <b>{{admin.set.blurb}}</b>，然后点击该部分的 <b>{{admin.set.save}}</b>。",
              "您的店铺现在会显示在 <a href=\"/gift-cards?lang=zh-CN\">giftpin.app/gift-cards</a> 上您所在国家下方，您的礼物清单页面也会出现 <b>Rather give a gift card?</b> 链接。顾客在您自己的结账页面购买您的礼品卡，所以款项和任何未使用的余额都归您。以这种方式售出的礼品卡会显示在 Giftpin 的 <b>{{admin.nav.analytics}}</b> 中。",
              "Giftpin 会对以这种方式售出的每张礼品卡收取 {{feePct}}% 的费用，在售出 {{holdDays}} 天后计入您的 Shopify 账单，这样已退款的礼品卡永远不会被收费。免费试用期间不收取任何费用。",
            ],
          },
          {
            title: "活动结束后的折扣和自动邮件",
            items: [
              "在 <b>{{admin.set.after}}</b> 下，开启 <b>{{admin.set.discount}}</b>，并设置 <b>{{admin.set.discountPct}}</b> 和 <b>{{admin.set.discountDays}}</b>。",
              "在 <b>{{admin.set.emails}}</b> 下，选择 <b>{{admin.set.guestRemind}}</b>、<b>{{admin.set.mostGone}}</b> 和 <b>{{admin.set.thanks}}</b>。",
              "点击 <b>{{admin.set.save}}</b>（右上角）。如果想不等一天就试用，请使用设置页面底部的 <b>{{admin.set.runNow}}</b>。",
            ],
          },
          {
            title: "礼物清单促销",
            items: [
              "打开 <b>{{admin.nav.promotions}}</b>。在 <b>{{admin.promo.new}}</b> 下，选择 <b>{{admin.promo.typeSale}}</b> 或 <b>{{admin.promo.typeCoupon}}</b>，设置折扣和日期，然后点击 <b>{{admin.promo.createBtn}}</b>。",
              "促销只适用于从礼物清单页面加入购物车的礼物。以通常方式购买的同一件商品仍按原价。",
              "促销也会显示在 Shopify 的 Discounts 页面中，名称以“Giftpin:”开头。",
            ],
          },
          {
            title: "数据分析和销售报告",
            items: [
              "打开 <b>{{admin.nav.analytics}}</b>，可以查看随时间变化的礼物清单创建数、商品添加数和礼物购买数、礼物的购买渠道，以及按月统计的销售报告。<b>{{admin.an.csv}}</b> 可导出该报告。",
              "在 <b>{{admin.nav.registries}}</b> 下，<b>{{admin.reg.csvRegs}}</b> 和 <b>{{admin.reg.csvPurch}}</b> 可导出礼物清单和购买记录。",
            ],
          },
          {
            title: "门店模式和 Shopify POS",
            items: [
              "在 Giftpin 菜单中打开 <b>{{admin.nav.inStore}}</b>，可以查找顾客的礼物清单，或在柜台为顾客新建一份。",
              "要在 Shopify POS 中为清单礼物收银，请添加 Giftpin 磁贴：在 Shopify 后台打开 <b>Point of Sale</b>，进入 POS 编辑器，选择 <b>Add tile → Embedded Apps</b>，然后选择 Giftpin。商品必须已发布到 Point of Sale 渠道。",
              "清单主人还可以在您的店里用手机扫描商品条形码来添加商品：他们在自己的管理页面打开 <b>{{manage.scan.open}}</b>。这需要您的商品上有条形码（或 SKU），并且在画面中清晰、完整地对准一个条形码时效果最好。",
            ],
          },
        ],
      },
      {
        title: "更多工具",
        lede: "一些您可能还没注意到的小功能。",
        tint: true,
        steps: [
          {
            title: "从其他应用迁移礼物清单",
            items: [
              "打开 <b>{{admin.nav.registries}}</b> 并点击 <b>{{admin.reg.import}}</b>。从旧的礼物清单应用中导出您的清单，保存为每件商品占一行的 CSV 文件，然后在 <b>{{admin.imp.fileLabel}}</b> 下选择该文件。",
              "Giftpin 会按 SKU 或条形码把每件商品与您的商品匹配，并在任何更改发生之前显示将要执行的操作。只有当您的顾客预期会收到您关于迁移的通知时，才勾选 <b>{{admin.imp.email}}</b>。",
            ],
          },
          {
            title: "Shopify 后台中的礼物清单面板",
            items: [
              "在 Shopify 后台的订单、顾客或商品页面，打开 <b>More actions → Giftpin registry</b>，可以查看它属于哪份礼物清单、该顾客是否有清单，或哪些清单包含该商品。",
              "如果您没有看到它，需要从应用代码中运行一次 <code>shopify app deploy</code> 来部署扩展。",
            ],
          },
          {
            title: "Shopify Flow（Pro）",
            items: [
              "Giftpin 为 Shopify Flow 添加了三个触发器：<b>Registry created</b>、<b>Registry event coming up</b> 和 <b>Registry gift bought</b>。您可以用它们给清单主人发邮件、给顾客打标签或通知您的团队。",
              "发给清单主人的邮件仅用于与他们自己清单相关的消息。向他们发送营销内容仍需征得他们的同意。",
            ],
          },
          {
            title: "语言",
            items: [
              "宾客和清单主人会看到您在 <b>{{admin.set.appearance}}</b> → <b>{{admin.set.langLabel}}</b> 下所选语言的礼物清单页面和邮件。Giftpin 自己的后台页面会在 Shopify 将语言信息提供给应用时跟随您的 Shopify 后台语言，否则使用您浏览器的语言。",
              "人们输入的姓名和留言，以及您的商品标题，保持原样不变。",
            ],
          },
        ],
      },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "在哪里查看顾客的礼物清单？",
        a: "在 Giftpin 菜单中打开“礼物清单”。“概览”会显示清单带来的收入、新顾客和已送出的礼物。",
      },
      {
        q: "清单主人或宾客需要账号吗？",
        a: "不需要。清单主人会通过邮件收到专属管理链接，宾客只需要礼物清单链接。",
      },
      {
        q: "我更改了设置，但没有任何变化。",
        a: "请确认您已点击保存。在主题编辑器中，保存按钮在右上角。在 Giftpin 的设置页面，它在右上角，并在“自动邮件”下方再次出现，而“集体送礼和礼金基金”有自己的保存按钮。",
      },
      {
        q: "如果我卸载应用，主题区块会怎样？",
        a: "Shopify 会自动从您的主题中移除这两个 Giftpin 区块。",
      },
      {
        q: "我遇到问题了，该联系谁？",
        a: "请发邮件到 support@giftpin.app，并附上您店铺的 .myshopify.com 地址以及您想要完成的操作。",
      },
    ],
  },

  registry: {
    eyebrow: "礼物清单指南",
    h1: `创建您的礼物清单<br><span class="grad-text">只需分享一个链接</span>`,
    lede: "如何创建 Giftpin 礼物清单，添加来自本店和其他任何地方的礼物，并分享给您的宾客。粗体文字就是您在屏幕上看到的内容。",
    metaTitle: "如何用 Giftpin 创建礼物清单",
    description:
      "如何在店铺中创建 Giftpin 礼物清单，添加来自该店铺和任何其他网站的礼物，分享给宾客，保存您的更改，并让礼物直接寄给您。",
    sections: [
      {
        title: "开始使用",
        steps: [
          {
            title: "创建您的礼物清单",
            items: [
              "在店铺网站上，点击创建礼物清单的链接（默认为 <b>Create a gift registry</b>，通常在页眉下方或菜单中；店铺可能更改了文字）。您也可以在任意商品上点击 Add to registry 按钮（默认为 <b>Add to registry</b>），系统会提示您先创建一份。",
              "在 <b>{{create.occasion}}</b> 下选择场合，然后填写 <b>{{create.name}}</b>、<b>{{create.when}}</b>、<b>{{create.yourName}}</b> 和 <b>{{create.yourEmail}}</b>。",
              "在 <b>{{create.country}}</b> 下，选择您宾客所在的国家。Giftpin 会据此为本店不出售的商品推荐其他店铺。",
              "您可以选填 <b>{{create.note}}</b>，然后点击 <b>{{create.submit}}</b>。",
            ],
            alts: ["创建礼物清单的表单，已填写场合、清单名称、日期、姓名、邮箱和国家"],
          },
          {
            title: "保管好您的专属链接",
            items: [
              "Giftpin 会通过邮件给您发送一个用于管理礼物清单的专属链接。您不需要账号或密码：这个链接就是您的入口，所以请保留这封邮件。链接有效期为 90 天。",
              "丢了链接，或链接失效了？在店铺的创建礼物清单页面，于 <b>Already have one?</b> 下输入您的邮箱，然后点击 <b>{{create.resendButton}}</b>。您收到的链接会列出您用该邮箱创建的所有礼物清单。",
              "切勿分享这个链接。任何拿到它的人都可以编辑您的礼物清单。宾客使用的是另一个链接（见下文“分享”）。",
            ],
            alts: ["Giftpin 发送的邮件，带有“打开我的清单”按钮"],
          },
        ],
      },
      {
        title: "添加您的礼物",
        lede: "可以来自本店，也可以来自任何其他网站。",
        tint: true,
        steps: [
          {
            title: "添加本店的商品",
            items: [
              "浏览店铺，在任意商品页面点击 <b>Add to registry</b>。您会看到 <b>Added to your registry</b> 和一个 <b>Back to your registry</b> 链接。",
              "对同一件商品再次点击时，系统会询问您总共想要几件，这样就不会不小心重复添加。",
              "使用另一部手机或电脑？请先在那台设备上打开邮件中的专属链接，这样按钮才知道哪份清单是您的。",
            ],
            alts: ["点击 Add to registry 之后的商品页面，显示 Added to your registry 和 Back to your registry 链接"],
          },
          {
            title: "添加来自其他任何网站的礼物",
            items: [
              "在您的礼物清单中，进入 <b>{{manage.addItems}}</b>，把商品地址粘贴到 <b>{{manage.productLink}}</b> 中，然后点击 <b>{{manage.lookUp}}</b>。Giftpin 会自动填写名称、照片和价格。",
              "有些大型店铺会阻止这种读取。如果出现这种情况，请自己输入 <b>{{manage.name}}</b> 和 <b>{{manage.price}}</b>，然后点击 <b>{{manage.addToReg}}</b>。",
              "Giftpin 可能会显示本店的类似商品。点击 <b>{{manage.match.swap}}</b> 查看，或者保留您原来的选择。",
            ],
            alts: ["添加商品框，显示已查询的 Target 链接，以及找到的照片、名称和价格"],
          },
          {
            title: "或者使用 Chrome 扩展程序",
            items: [
              `在电脑上，安装<a href="${CHROME}" target="_blank" rel="noopener">适用于 Chrome 的 Giftpin 扩展程序</a>。`,
              "在您的礼物清单中，于 <b>{{manage.ext.title}}</b> 下点击 <b>{{manage.ext.copy}}</b>。打开扩展程序，把它粘贴到 <b>Manage link</b> 中，然后点击 <b>Connect</b>。这一步只需做一次。",
              "之后，在任何网站的任意商品页面，打开扩展程序，选择 <b>Quantity</b>，然后点击 <b>Add to registry</b>。",
            ],
            alts: ["Walmart 商品页面上的 Giftpin 扩展程序，带有数量和 Add to registry 按钮"],
          },
          {
            title: "在店里？扫描条形码",
            items: [
              "如果店铺提供此功能，请在手机上打开您的专属链接并点击 <b>{{manage.scan.open}}</b>。把摄像头对准标签或包装盒上的条形码，商品就会加入您的清单。",
              "手机询问时请允许使用摄像头。如果无法打开，请把条形码下方的数字输入到 <b>{{manage.scan.codeLabel}}</b> 中，然后点击 <b>{{manage.scan.lookUp}}</b>。",
              "让画面中只有一个条形码，以免误读旁边的条形码。",
            ],
          },
          {
            title: "微调您的清单",
            items: [
              "在 <b>{{manage.yourList}}</b> 下，打开任意商品，可以更改 <b>{{manage.item.qty}}</b>，添加 <b>{{manage.item.noteLabel}}</b>（例如尺码或颜色），或选择 <b>{{manage.item.category}}</b>，然后点击 <b>{{manage.item.update}}</b>。",
              "不知道添加什么？点击 <b>{{manage.ideas.open}}</b>，获取适合您场合的灵感。",
            ],
            alts: ["清单中一件正在编辑的商品，带有给宾客的备注、数量和分类"],
          },
        ],
      },
      {
        title: "分享",
        steps: [
          {
            title: "分享给宾客",
            items: [
              "在礼物清单顶部，点击 <b>{{manage.shareBtn}}</b>，通过邮件、短信、WhatsApp 或 Facebook 发送链接，或者点击 <b>{{manage.copyLink}}</b>。",
              "想把二维码放在请柬或指示牌上？点击分享按钮旁的 <b>{{manage.qr}}</b>，再点击 <b>{{manage.qr.download}}</b>。宾客用手机摄像头对准它，就能打开您的礼物清单。",
              "宾客能看到您的礼物以及还需要哪些。他们永远看不到您的邮箱或地址，也不需要账号。",
            ],
            alts: [
              "分享链接，带有复制链接、邮件、短信、WhatsApp 和 Facebook 按钮",
              "宾客看到的画面：礼物清单中有一件店内商品、一件已被认领的礼物，以及一件来自 Walmart 的商品",
            ],
          },
          {
            title: "和别人一起筹备",
            items: [
              "创建礼物清单后，系统会立即询问 <b>{{manage.setup.partnerTitle}}</b>您也可以稍后再做：点击 <b>{{manage.prefs.open}}</b>，向下滚动到 <b>{{manage.partner.title}}</b>，输入 <b>{{manage.partner.name}}</b> 和 <b>{{manage.partner.email}}</b>，然后点击 <b>{{manage.partner.add}}</b>。",
              "对方会收到自己的专属链接。他们可以添加礼物、查看已购买的内容并更改设置。他们的邮箱永远不会显示给宾客，点击 <b>{{manage.partner.remove}}</b> 会立即关闭他们的链接。",
            ],
          },
          {
            title: "选择谁可以查看",
            items: [
              "在礼物清单底部，点击 <b>{{manage.prefs.open}}</b>。在 <b>{{manage.prefs.settings}}</b> 下，使用 <b>{{manage.prefs.who}}</b>：<b>{{manage.prefs.priv.unlisted}}</b>、<b>{{manage.prefs.priv.password}}</b>，或在店铺的礼物清单查找页面上选择 <b>{{manage.prefs.priv.public}}</b>（默认为 <b>Find a gift registry</b>）。",
              "点击 <b>{{manage.prefs.save}}</b>。同一部分还可以更改名称、场合、日期和留言。如果店铺允许，还会有 <b>{{manage.lang.label}}</b>。",
            ],
            alts: ["“谁可以查看”菜单及其三个选项"],
          },
          {
            title: "让礼物寄给您",
            items: [
              "创建礼物清单后，系统会立即询问 <b>{{manage.setup.shipTitle}}</b>勾选复选框并输入您的配送地址，或者暂时跳过。",
              "之后如需更改，请点击 <b>{{manage.prefs.open}}</b>，然后在 <b>{{manage.ship.title}}</b> 下勾选复选框，输入您的地址并点击 <b>{{manage.save}}</b>。这样宾客就可以把本店的礼物直接寄给您。",
              "每位宾客在把礼物加入购物车时自行决定：寄给您，还是寄给自己。宾客永远看不到您的地址。",
            ],
            alts: ["“让宾客把礼物寄给我”部分，已勾选复选框并填写了配送地址"],
          },
        ],
      },
      {
        title: "在哪里点击保存",
        lede: "礼物清单只会保留您已保存的内容。页面的每个部分都有自己的按钮。",
        tint: true,
        steps: [
          {
            title: "哪个按钮保存什么",
            items: [
              "<b>{{manage.prefs.save}}</b> 在页面靠下位置的 <b>{{manage.prefs.open}}</b> 里，位于 <b>{{manage.prefs.settings}}</b> 的末尾。它会保存名称、场合、日期、留言以及谁可以查看。如果您更改了内容却没有点击它就离开，更改会丢失。",
              "<b>{{manage.ship.title}}</b> 中的 <b>{{manage.save}}</b> 就在它下方的同一面板里，用于保存您的配送地址。它与上面的按钮是分开的，如果两处都改了，请两个都点击。",
              "再往下，<b>{{manage.partner.title}}</b> 中的 <b>{{manage.partner.add}}</b> 会把链接发给您的伙伴并保存对方信息。",
              "商品上的 <b>{{manage.item.update}}</b> 用于保存该商品的数量、备注和分类。",
              "<b>{{manage.addToReg}}</b> 在您点击后会立即保存新商品。",
              "成功后，您会在页面顶部附近看到 <b>{{manage.flash.saved}}</b>。",
            ],
          },
        ],
      },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "宾客如何避免买到重复的礼物？",
        a: "在本店下的订单会自动更新您的礼物清单。对于来自其他网站的礼物，宾客在购买后点击“我已购买”，该商品就会显示为已被认领。改变主意的宾客可以在 24 小时内撤销。",
      },
      {
        q: "我怎么知道谁送了我什么？",
        a: "您的礼物清单有一份“谁送了什么”列表，方便您写感谢信；有人购买礼物时，Giftpin 也会给您发邮件。",
      },
      {
        q: "宾客可以一起凑钱买大件礼物吗？",
        a: "如果店铺提供此功能，可以。您的礼物清单可以把某件商品变成集体送礼，也可以设立一个礼金基金用于蜜月或买房，以店铺礼品卡的形式支付。",
      },
      {
        q: "我改了东西，但没有保存成功。",
        a: "请点击页面该部分的保存按钮：“编辑礼物清单和偏好设置”中的“保存更改”、“让宾客把礼物寄给我”下的“保存”，或商品上的“更新”。",
      },
      {
        q: "我可以删除我的礼物清单吗？",
        a: "可以。点击礼物清单底部的“编辑礼物清单和偏好设置”，然后点击“删除礼物清单”。这会移除所有商品以及谁买了什么的记录，且无法撤销。",
      },
    ],
  },
};
