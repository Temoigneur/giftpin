import type { RawGuideCopy } from "./types";

const CHROME = "https://chromewebstore.google.com/detail/giftpin-%E2%80%94-add-to-registry/hfmielpmefknpgpekhfehnfdlhiobdkk";

export const ja: RawGuideCopy = {
  ui: {
    language: "言語",
    shotsNote: "スクリーンショットは英語版の画面です。",
    shopifyNote:
      "Shopifyの画面名（たとえば Online Store → Navigation）は、英語版のShopify管理画面と同じく英語で表記しています。お使いの言語では翻訳されて表示されることがあります。",
    finalCta: "お客様にギフトリストを提供しませんか？",
  },

  setup: {
    eyebrow: "セットアップガイド",
    h1: `Giftpinを設定しましょう<br><span class="grad-text">所要時間は約10分</span>`,
    lede: "インストールから最初のギフトリストまで、ストアオーナーに必要なことをすべて紹介します。太字は、画面に表示される文字そのままです。",
    metaTitle: "Shopifyストアオーナー向け Giftpin セットアップガイド",
    description:
      "Giftpinのインストール方法、Shopifyテーマへのボタンとリンクの追加、用途と設定の選び方、すべての保存ボタンの場所、Pro機能の有効化までを説明します。",
    sections: [
      {
        title: "はじめに",
        steps: [
          {
            title: "Giftpinをインストールする",
            items: [
              "Shopify App StoreでGiftpinを開き、<b>Install</b> をクリックします。",
              "権限の確認画面を承認します。Shopify管理画面の中で、Giftpinの <b>{{admin.nav.overview}}</b> ページが開きます。",
            ],
          },
          {
            title: "テーマにGiftpinを追加する",
            items: [
              "<b>{{admin.nav.overview}}</b> の <b>{{admin.theme.title}}</b> でテーマを選びます。先に非公開の複製で設定することもできます。",
              "<b>{{admin.theme.btnAdd}}</b> をクリックします。Add to registry ボタンが追加された状態でテーマエディタが開きます。好きな場所にドラッグして、テーマエディタの右上にある <b>Save</b> を押してください。",
              "Giftpinに戻って <b>{{admin.theme.linksAdd}}</b> をクリックします。ヘッダーの下に、ギフトリストの作成・検索・管理へのリンクが追加されます。テーマエディタで <b>Save</b> を押してください。",
              "お気に入りリストを使う場合（任意）：<b>{{admin.theme.heartAdd}}</b> をクリックします。テーマエディタで商品ページが開き、<b>Save for later</b> のハートが追加されます。<b>Save</b> を押してください。",
              "次に <b>{{admin.theme.savedAdd}}</b> をクリックします。カートページに <b>Saved items</b> リストが追加され、お客様がハートを付けた商品を見つけられます。<b>Save</b> を押してください。",
              "この2つは自動では有効になりません。テーマエディタで追加して <b>Save</b> を押すまで、お客様にハートは表示されません。ハートはお客様のブラウザ内に保存され、アカウントは不要です。そのため、新しい端末ではリストが空になります。",
              "自分で配置したい場合は、テーマエディタでページを開き、<b>Add block</b>（または <b>Add section</b>）をクリックして、<b>Apps</b> グループから <b>Save for later</b> または <b>Saved items</b> を選びます。",
              "古いテーマ（Online Store 2.0より前）をお使いですか？ブロックは動作しませんが、ギフトリストのページは使えます。<b>Online Store → Navigation</b> で、<b>/apps/registry</b> を指すメニュー項目を追加してください。",
            ],
            alts: [
              "テーマにGiftpinを追加するカードと、商品ページへのボタン追加・リストへのリンク追加ボタンがあるGiftpinの概要ページ",
              "商品ページでAdd to registryブロックを選択したShopifyのテーマエディタ",
            ],
          },
          {
            title: "ギフトリストのページを確認する",
            items: [
              "<b>{{admin.nav.overview}}</b> の <b>{{admin.ov.pages}}</b> で <b>{{admin.ov.create}}</b> をクリックすると、お客様が使うページを確認できます。",
              "テスト用のギフトリストを作り、Add to registry ボタンで商品を追加して、ゲスト用リンクを開き、ゲストに見える画面を確認しましょう。",
              "お客様が作成したギフトリストは、Giftpinのメニューの <b>{{admin.nav.registries}}</b> に表示されます。",
            ],
            alts: [
              "Buy it nowの下にAdd to registryボタン、上にギフトリストの作成・検索・管理リンクがあるストアの商品ページ",
              "2件のウェディングのギフトリストとそのアイテム・進み具合を表示したGiftpinのリストページ",
            ],
          },
        ],
      },
      {
        title: "保存ボタンの場所",
        lede: "変更は保存して初めて反映されます。保存ボタンの場所は画面ごとに違います。以下が一覧です。",
        tint: true,
        steps: [
          {
            title: "Shopifyのテーマエディタ",
            items: [
              "<b>Save</b> はテーマエディタの右上にあります。Giftpinのブロックを追加・移動・変更しても、これを押すまでは公開中のストアに何も反映されません。",
              "<b>{{admin.nav.overview}}</b> のGiftpinのボタンは、ブロックを追加した状態でエディタを開くだけです。代わりに保存はされません。",
            ],
          },
          {
            title: "Giftpinの設定ページ",
            items: [
              "<b>{{admin.set.save}}</b> はページ右上のヘッダーにあります。<b>{{admin.set.occasions}}</b> から <b>{{admin.set.emails}}</b> までのすべてを保存します。",
              "同じ <b>{{admin.set.save}}</b> ボタンが、そのブロックの下部（<b>{{admin.set.emails}}</b> のすぐ下）にもあります。どちらも同じ働きなので、近いほうを使ってください。",
              "画面の下に <b>{{admin.set.toast}}</b> というメッセージが表示され、下のボタンの横には <b>{{admin.set.saved}}</b> と表示されます。",
              "<b>{{admin.set.funds}}</b>（その中の <b>{{admin.set.sell}}</b> を含む）には、そのセクションの下部に専用の <b>{{admin.set.save}}</b> ボタンがあります。ヘッダーのボタンでは保存されません。そこで何かを変更したら、セクション内のボタンを押してください。",
              "<b>{{admin.set.runNow}}</b> は設定ではなく操作なので、保存するものはありません。",
            ],
          },
          {
            title: "Giftpinのそのほかのページ",
            items: [
              "<b>{{admin.nav.promotions}}</b>：<b>{{admin.promo.new}}</b> に入力し、フォームの下部にある <b>{{admin.promo.createBtn}}</b> をクリックします。一覧の <b>{{admin.promo.pause}}</b>、<b>{{admin.promo.resume}}</b>、<b>{{admin.promo.delete}}</b> はすぐに実行されます。",
              "<b>{{admin.nav.inStore}}</b>：<b>{{admin.ins.start}}</b> の下部にある <b>{{admin.ins.create}}</b> をクリックします。",
              "<b>{{admin.reg.import}}</b>：ファイルを選び、確認用のボタンをクリックして内容を確かめてから、表示される「インポート」ボタンをクリックします。",
              "<b>{{admin.nav.registries}}</b>、<b>{{admin.nav.analytics}}</b>、<b>{{admin.nav.overview}}</b> は情報の表示のみなので、保存するものはありません。",
            ],
          },
          {
            title: "リストの作成者の管理ページ",
            items: [
              "リストの作成者には専用のページがあり、メールのプライベートリンクから開きます。ギフトリストは保存した内容しか残らないので、どこで保存するかを伝えてあげてください。",
              "<b>{{manage.prefs.save}}</b> は、ページ下部の <b>{{manage.prefs.open}}</b> の中にある <b>{{manage.prefs.settings}}</b> の末尾にあります。名前、用途、日付、メッセージ、言語、公開範囲を保存します。",
              "<b>{{manage.ship.title}}</b> の中の <b>{{manage.save}}</b> は、配送先の住所を保存します。上のボタンとは別のボタンです。",
              "アイテムの <b>{{manage.item.update}}</b> は、そのアイテムの数量、メモ、カテゴリを保存します。",
              "最初のセットアップ中のボタンは <b>{{manage.setup.saveContinue}}</b> と <b>{{manage.setup.skip}}</b> です。パートナーについての2つ目のステップでは、代わりに <b>{{manage.partner.add}}</b> と <b>{{manage.partner.notNow}}</b> です。",
            ],
          },
        ],
      },
      {
        title: "ストアに合わせて設定する",
        lede: "すべてGiftpinの設定ページで行います。",
        steps: [
          {
            title: "用途を選ぶ",
            items: [
              "<b>{{admin.nav.settings}}</b> を開きます。<b>{{admin.set.occasions}}</b> で、お客様が作れるギフトリストの種類（結婚、ベビーシャワー、誕生日、卒業、新築祝いなど）にチェックを入れます。",
              "<b>{{event.wishlist}}</b> にチェックを入れると、ホリデーのほしいものリストのような、日付のない共有用リストになります。オンにするまでは無効です。",
              "<b>{{admin.set.save}}</b>（右上）を押します。",
            ],
            alts: ["用途のチェックリストと、ほかのストアの商品に関する選択肢が表示されたGiftpinの設定"],
          },
          {
            title: "ほかのストアの商品について決める",
            items: [
              "<b>{{admin.set.ext}}</b> で、<b>{{admin.set.extOn}}</b>、<b>{{admin.set.extCapped}}</b>、<b>{{admin.set.extOff}}</b> のいずれかを選びます。",
              "許可すると、お客様があなたのギフトリストをメインとして選んでくれます。Giftpinは、ほかのストアの商品ごとに、いちばん近いあなたの商品を提案します。",
            ],
          },
          {
            title: "商品が売り切れたときの動作を決める",
            items: [
              "<b>{{admin.set.soldOut}}</b> で、<b>{{admin.set.soldOutShow}}</b> または <b>{{admin.set.soldOutHide}}</b> を選びます。",
              "Giftpinは、ゲストがギフトリストを開くたびに最新の在庫を確認します。アイテムは常にギフトリストに残るので、再入荷すれば自動的に元に戻ります。",
            ],
          },
          {
            title: "ストアの見た目と言語に合わせる",
            items: [
              "<b>{{admin.set.appearance}}</b> で、<b>{{admin.set.buttonLabel}}</b> と <b>{{admin.set.accent}}</b> を設定します。",
              "<b>{{admin.set.langLabel}}</b> では、ギフトリストのページとメールでゲストに表示する言語（英語、フランス語、スペイン語、ドイツ語、ブラジルポルトガル語）を選びます。",
              "Add to registry ボタンとギフトリストのリンクには、テーマエディタに専用の設定（ラベル、アイコン、色、サイズ、余白）があります。",
              "ほかの場所でギフトリストを作っているお客様にもボタンを使ってもらうには、ボタンの設定で <b>Also offer Babylist</b> または <b>Also offer \"Another registry\"</b>（Zolaなどのサイト向けに商品リンクをコピー）にチェックを入れます。すると、ボタンがどのリストに追加するかを尋ねます。",
              "Proでは、<b>{{admin.set.branding}}</b> でロゴ（<b>{{admin.set.logo}}</b>）、色、フォントをギフトリストのページに追加でき、Powered by Giftpin の表記もなくせます。",
            ],
            alts: ["ボタンのラベルとアクセントカラーの欄がある、Giftpin設定の外観セクション"],
          },
          {
            title: "プライバシーを設定する",
            items: [
              "<b>{{admin.set.privacy}}</b> で、<b>{{admin.set.hideBuyer}}</b> かどうかと、公開のギフトリスト検索ページ（<b>{{admin.set.find}}</b>）を有効にするかどうかを選びます。ここに表示されるのは、作成者が公開に同意したギフトリストだけです。チェックを入れるまではオフで、それまではストアの検索リンクから、ギフトリストのリンクの入力を求める画面が開きます。",
            ],
          },
          {
            title: "ギフトリストの特典を用意する（Pro）",
            items: [
              "<b>{{admin.set.perks}}</b> の <b>{{admin.set.perksLabel}}</b> に、あなたのストアで登録した人への特典を1行に1つずつ書きます。たとえば、無料のギフトラッピングや、ギフトリストが一定の金額に達したときのプレゼントなどです。",
              "リストの作成者には、ギフトリストを作成する画面で表示されます。<b>{{admin.set.save}}</b> を押してください。",
            ],
          },
        ],
      },
      {
        title: "Pro",
        lede: "もっと活用したいストア向けのオプションです。",
        steps: [
          {
            title: "Proを始める",
            items: [
              "Giftpinのメニューで <b>{{admin.nav.plan}}</b> を開き、アップグレードのボタンをクリックします。{{trialDays}}日間の無料トライアルがあり、その後{{proName}}は月額{{price}}です。<b>{{admin.bill.cancel}}</b> も同じページにあります。",
            ],
          },
          {
            title: "みんなでギフトとキャッシュファンド",
            items: [
              "Shopify管理画面で <b>Products → Gift cards</b> を開き、<b>Add a gift card product</b> をクリックします。",
              "タイトルと、25、50、100 などの金額をいくつか設定します。giftpin.appで販売するには、ストアの通貨で500以下の金額が1つ以上必要です。<b>Sales channels and apps</b> の <b>Online Store</b> はオンのままにして、<b>Save gift card product</b> をクリックします。",
              "<b>Settings → General → Order processing</b> で <b>Automatically fulfill only the gift cards</b> を選びます。Shopifyは、注文が処理済みになってからギフトカードを送信します。",
              "Giftpinで <b>{{admin.nav.settings}}</b> を開きます。すでに開いていた場合は、新しいギフトカードが表示されるようにページを再読み込みしてください。<b>{{admin.set.funds}}</b> の <b>{{admin.set.fundsPick}}</b> でギフトカードを選び、そのセクションの <b>{{admin.set.save}}</b> を押します。",
              "これで登録者は管理ページからキャッシュファンドを追加できます。<b>{{manage.fund.title}}</b> で名前と目標額を入力し、<b>{{manage.fund.add}}</b> をタップします。ゲストはギフトカードの金額で、ファンドや大きなアイテムに出し合えます。",
            ],
            alts: ["Shopifyの「Create gift card product」ページ。タイトルはRedwood Essentials gift card、金額は10、25、50、100", "Giftpinの設定、みんなでギフトとファンド。ギフトカードを選び、giftpin.appへの掲載にチェックが入っている", "レジストリ管理ページのキャッシュファンド欄。名前、目標額、メモの入力欄と「ファンドを追加」ボタン"],
          },
          {
            id: "gift-cards",
            title: "giftpin.appでギフトカードを販売する",
            items: [
              "Proと、上のステップのギフトカードが必要です。<b>{{admin.set.fundsPick}}</b> で選ばれている必要があり、まだ <b>{{admin.set.off}}</b> のままだとストアは掲載されず、保存時にGiftpinが警告を表示します。",
              "Giftpinで <b>{{admin.nav.settings}}</b> を開きます。<b>{{admin.set.sell}}</b> で <b>{{admin.set.listMine}}</b> にチェックを入れ、<b>{{admin.set.blurb}}</b> を追加して、そのセクションの <b>{{admin.set.save}}</b> を押します。",
              "あなたのストアが <a href=\"/gift-cards?lang=ja\">giftpin.app/gift-cards</a> の国別の欄に表示され、ギフトリストのページには <b>Rather give a gift card?</b> のリンクが追加されます。お客様はあなた自身のチェックアウトでギフトカードを購入するので、代金と未使用の残高はあなたのものです。この方法で販売されたギフトカードは、Giftpinの <b>{{admin.nav.analytics}}</b> に表示されます。",
              "Giftpinは、この方法で販売されたギフトカード1枚ごとに{{feePct}}%を、販売の{{holdDays}}日後にShopifyの請求書に加えて請求します。返金されたカードが請求されることはありません。無料トライアル中は手数料はかかりません。",
            ],
            alts: ["ストアのギフトカードページ。$25、$50、$100、$250の金額、メールで直接送るチェックボックス、カートに追加ボタン"],
          },
          {
            title: "イベント後の割引と自動メール",
            items: [
              "<b>{{admin.set.after}}</b> で <b>{{admin.set.discount}}</b> をオンにし、<b>{{admin.set.discountPct}}</b> と <b>{{admin.set.discountDays}}</b> を設定します。",
              "<b>{{admin.set.emails}}</b> で、<b>{{admin.set.guestRemind}}</b>、<b>{{admin.set.mostGone}}</b>、<b>{{admin.set.thanks}}</b> を選びます。",
              "<b>{{admin.set.save}}</b>（右上）を押します。1日待たずに試すには、設定の下部にある <b>{{admin.set.runNow}}</b> を使ってください。",
            ],
          },
          {
            title: "ギフトリストのプロモーション",
            items: [
              "<b>{{admin.nav.promotions}}</b> を開きます。<b>{{admin.promo.new}}</b> で <b>{{admin.promo.typeSale}}</b> または <b>{{admin.promo.typeCoupon}}</b> を選び、割引と期間を設定して <b>{{admin.promo.createBtn}}</b> をクリックします。",
              "プロモーションが適用されるのは、ギフトリストのページからカートに入れたギフトだけです。同じ商品を通常の方法で買った場合は、ふだんの価格のままです。",
              "プロモーションは、Shopifyの Discounts ページにも「Giftpin:」で始まる名前で表示されます。",
            ],
          },
          {
            title: "分析と売上レポート",
            items: [
              "<b>{{admin.nav.analytics}}</b> を開くと、作成されたギフトリスト、追加されたアイテム、購入されたギフトの推移、ギフトを購入した場所、月ごとの売上レポートを確認できます。<b>{{admin.an.csv}}</b> でレポートを書き出せます。",
              "<b>{{admin.nav.registries}}</b> の <b>{{admin.reg.csvRegs}}</b> と <b>{{admin.reg.csvPurch}}</b> で、ギフトリストと購入の一覧を書き出せます。",
            ],
          },
          {
            title: "店頭モードとShopify POS",
            items: [
              "Giftpinのメニューで <b>{{admin.nav.inStore}}</b> を開くと、お客様のギフトリストを探したり、カウンターでお客様の代わりに作成したりできます。",
              "Shopify POSでギフトリストのギフトを会計するには、Giftpinのタイルを追加します。Shopify管理画面で <b>Point of Sale</b> を開き、POSエディタで <b>Add tile → Embedded Apps</b> を選んで、Giftpinを選択してください。商品はPoint of Saleチャネルに公開されている必要があります。",
              "リストの作成者は、お店で商品のバーコードをスマートフォンでスキャンして追加することもできます。管理ページの <b>{{manage.scan.open}}</b> を開きます。商品にバーコード（またはSKU）が必要で、1つのバーコードを画面いっぱいにはっきり映すと読み取りやすくなります。",
            ],
          },
        ],
      },
      {
        title: "そのほかのツール",
        lede: "見逃しがちな、ちょっとした機能です。",
        tint: true,
        steps: [
          {
            title: "ほかのアプリからギフトリストを移行する",
            items: [
              "<b>{{admin.nav.registries}}</b> を開いて <b>{{admin.reg.import}}</b> をクリックします。以前のアプリからギフトリストを、1アイテムを1行としてCSVで書き出し、<b>{{admin.imp.fileLabel}}</b> でそのファイルを選びます。",
              "Giftpinは、SKUまたはバーコードで各アイテムをあなたの商品に対応づけ、何かを変更する前に、これから行う内容を表示します。<b>{{admin.imp.email}}</b> にチェックを入れるのは、移行についてお客様がご連絡を待っている場合だけにしてください。",
            ],
          },
          {
            title: "Shopify管理画面のギフトリストパネル",
            items: [
              "Shopify管理画面の注文、顧客、商品のページで <b>More actions → Giftpin registry</b> を開くと、どのギフトリストに属するか、その人がギフトリストを持っているか、その商品がどのギフトリストに入っているかを確認できます。",
              "表示されない場合は、アプリのコードから一度だけ <code>shopify app deploy</code> を実行して、拡張機能をデプロイする必要があります。",
            ],
          },
          {
            title: "Shopify Flow（Pro）",
            items: [
              "Giftpinは、Shopify Flowに3つのトリガーを追加します。<b>Registry created</b>、<b>Registry event coming up</b>、<b>Registry gift bought</b> です。リストの作成者へのメール、顧客へのタグ付け、チームへの通知に使えます。",
              "リストの作成者へのメールは、そのギフトリストに関するお知らせ用です。マーケティングの配信には、引き続き本人の同意が必要です。",
            ],
          },
          {
            title: "言語",
            items: [
              "ゲストとリストの作成者には、<b>{{admin.set.appearance}}</b> → <b>{{admin.set.langLabel}}</b> で選んだ言語で、ギフトリストのページとメールが表示されます。Giftpinの管理ページは、Shopifyがアプリに言語を渡している場合はShopify管理画面の言語に、そうでない場合はブラウザの言語に従います。",
              "人が入力した名前やメッセージ、そしてあなたの商品名は、入力されたままの表記で表示されます。",
            ],
          },
        ],
      },
    ],
    faqTitle: "よくある質問",
    faq: [
      {
        q: "お客様のギフトリストはどこで見られますか？",
        a: "Giftpinのメニューで「リスト」を開いてください。「概要」では、ギフトリストの売上、新規のお客様、贈られたギフトを確認できます。",
      },
      {
        q: "リストの作成者やゲストにアカウントは必要ですか？",
        a: "いいえ。リストの作成者にはプライベートな管理リンクがメールで届き、ゲストに必要なのはギフトリストのリンクだけです。",
      },
      {
        q: "設定を変えたのに、何も変わりません。",
        a: "「保存」を押したかご確認ください。テーマエディタでは右上にあります。Giftpinの設定ページでは右上と、「自動メール」の下の2か所にあり、「みんなでギフトとキャッシュファンド」には専用の「保存」があります。",
      },
      {
        q: "アンインストールすると、テーマのブロックはどうなりますか？",
        a: "ShopifyがテーマからGiftpinの2つのブロックを自動的に削除します。",
      },
      {
        q: "困ったときは、どこに連絡すればよいですか？",
        a: "ストアの .myshopify.com のアドレスと、やろうとしていたことを書いて、support@giftpin.app までメールをお送りください。",
      },
    ],
  },

  registry: {
    eyebrow: "ギフトリストガイド",
    h1: `ギフトリストを作って<br><span class="grad-text">リンクを1つだけ共有しましょう</span>`,
    lede: "Giftpinのギフトリストの作り方、このストアやほかのサイトからのギフトの追加方法、ゲストへの共有方法を紹介します。太字は、画面に表示される文字そのままです。",
    metaTitle: "Giftpinでギフトリストを作る方法",
    description:
      "ストアでGiftpinのギフトリストを作り、そのストアやほかのサイトのギフトを追加して、ゲストに共有し、変更を保存して、ギフトを自宅に届けてもらう方法を説明します。",
    sections: [
      {
        title: "はじめに",
        steps: [
          {
            title: "ギフトリストを作る",
            items: [
              "ストアのサイトで、ギフトリストを作成するリンク（初期設定では <b>Create a gift registry</b>、多くはヘッダーの下かメニュー内にあります。ストアによって文言が変更されていることもあります）をクリックします。どの商品でも Add to registry ボタン（初期設定では <b>Add to registry</b>）を押せば、ギフトリストの作成をご案内します。",
              "<b>{{create.occasion}}</b> で用途を選び、<b>{{create.name}}</b>、<b>{{create.when}}</b>、<b>{{create.yourName}}</b>、<b>{{create.yourEmail}}</b> を入力します。",
              "<b>{{create.country}}</b> で、ゲストのいる国を選びます。Giftpinは、このストアで扱っていないものについて、おすすめのストアを提案するためにこれを使います。",
              "必要に応じて <b>{{create.note}}</b> を書き、<b>{{create.submit}}</b> をクリックします。",
            ],
            alts: ["用途、ギフトリスト名、日付、名前、メールアドレス、国を入力した、ギフトリスト作成フォーム"],
          },
          {
            title: "プライベートリンクを保管する",
            items: [
              "Giftpinから、ギフトリストを管理するためのプライベートリンクがメールで届きます。アカウントもパスワードも不要です。このリンクが入口になるので、メールは大切に保管してください。リンクは90日間有効です。",
              "なくしてしまった、または使えなくなったときは、ストアのギフトリスト作成ページの <b>すでにお持ちですか？</b> にメールアドレスを入力して、<b>{{create.resendButton}}</b> をクリックしてください。届いたリンクには、そのメールアドレスで作成したすべてのギフトリストが表示されます。",
              "このリンクは絶対に共有しないでください。持っている人は誰でもギフトリストを編集できます。ゲスト用には別のリンクがあります（下の「共有する」を参照）。",
            ],
            alts: ["Giftpinから届くメール。ギフトリストを開くボタンがあります"],
          },
        ],
      },
      {
        title: "ギフトを追加する",
        lede: "このストアからも、ほかのどのサイトからも追加できます。",
        tint: true,
        steps: [
          {
            title: "このストアの商品を追加する",
            items: [
              "ストアを見て回り、どの商品ページでも <b>Add to registry</b> をクリックします。<b>Added to your registry</b> と、<b>Back to your registry</b> のリンクが表示されます。",
              "同じ商品でもう一度押すと、合計でいくつほしいかを尋ねられるので、うっかり二重に追加されることはありません。",
              "別のスマートフォンやパソコンを使うときは、先にそちらで、メールに届いたプライベートリンクを開いてください。そうすると、ボタンがどれがあなたのギフトリストかを認識できます。",
            ],
            alts: ["Add to registryを押したあとの商品ページ。Added to your registryと、Back to your registryのリンクが表示されています"],
          },
          {
            title: "ほかのサイトのギフトを追加する",
            items: [
              "ギフトリストの <b>{{manage.addItems}}</b> で、商品のアドレスを <b>{{manage.productLink}}</b> に貼り付け、<b>{{manage.lookUp}}</b> をクリックします。Giftpinが名前、写真、価格を入力します。",
              "大手ストアの中には、この取得をブロックするところがあります。その場合は、<b>{{manage.name}}</b> と <b>{{manage.price}}</b> を自分で入力して、<b>{{manage.addToReg}}</b> をクリックしてください。",
              "Giftpinが、このストアの似た商品を提案することがあります。<b>{{manage.match.swap}}</b> をクリックして確認するか、元のアイテムのままにしてください。",
            ],
            alts: ["Targetのリンクを読み込んだ「アイテムを追加」ボックス。見つかった写真、名前、価格が表示されています"],
          },
          {
            title: "Chrome拡張機能を使う",
            items: [
              `パソコンで、<a href="${CHROME}" target="_blank" rel="noopener">Chrome用のGiftpin拡張機能</a>をインストールします。`,
              "ギフトリストの <b>{{manage.ext.title}}</b> で <b>{{manage.ext.copy}}</b> をクリックします。拡張機能を開き、<b>Manage link</b> に貼り付けて <b>Connect</b> をクリックします。これは最初の1回だけです。",
              "あとは、どのサイトの商品ページでも、拡張機能を開いて <b>Quantity</b> を選び、<b>Add to registry</b> をクリックするだけです。",
            ],
            alts: ["Walmartの商品ページで表示したGiftpin拡張機能。数量とAdd to registryボタンがあります"],
          },
          {
            title: "お店にいるときは、バーコードをスキャン",
            items: [
              "ストアが対応している場合は、スマートフォンでプライベートリンクを開き、<b>{{manage.scan.open}}</b> をタップします。値札や箱のバーコードにカメラを向けると、その商品がリストに追加されます。",
              "スマートフォンから求められたら、カメラを許可してください。カメラが開かない場合は、バーコードの下の番号を <b>{{manage.scan.codeLabel}}</b> に入力して、<b>{{manage.scan.lookUp}}</b> をタップします。",
              "隣のバーコードを間違って読み取らないよう、画面いっぱいに1つのバーコードを映してください。",
            ],
          },
          {
            title: "リストを整える",
            items: [
              "<b>{{manage.yourList}}</b> でアイテムを開くと、<b>{{manage.item.qty}}</b> の変更、<b>{{manage.item.noteLabel}}</b>（サイズや色など）の追加、<b>{{manage.item.category}}</b> の選択ができます。そのあと <b>{{manage.item.update}}</b> をクリックします。",
              "何を追加すればよいか迷ったら、<b>{{manage.ideas.open}}</b> をタップすると、用途に合ったアイデアが見られます。",
            ],
            alts: ["編集のために開いたリストのアイテム。ゲスト向けのメモ、数量、カテゴリが表示されています"],
          },
        ],
      },
      {
        title: "共有する",
        steps: [
          {
            title: "ゲストに共有する",
            items: [
              "ギフトリストの上部で <b>{{manage.shareBtn}}</b> をクリックし、メール、テキストメッセージ、WhatsApp、Facebookでリンクを送るか、<b>{{manage.copyLink}}</b> をクリックします。",
              "招待状や看板に載せるコードがよければ、共有ボタンの横の <b>{{manage.qr}}</b> をクリックし、続けて <b>{{manage.qr.download}}</b> をクリックします。ゲストがスマートフォンのカメラを向けると、ギフトリストが開きます。",
              "ゲストには、あなたのギフトと、まだ必要なものが表示されます。メールアドレスや住所は見えず、アカウントも不要です。",
            ],
            alts: [
              "リンクをコピー、メール、テキストメッセージ、WhatsApp、Facebookのボタンがある共有リンク",
              "ゲストに見える画面。ストアのアイテム、すでに手配済みのギフト、Walmartのアイテムがあるギフトリスト",
            ],
          },
          {
            title: "誰かと一緒に準備する",
            items: [
              "ギフトリストを作成した直後に、<b>{{manage.setup.partnerTitle}}</b> とお尋ねします。あとから設定することもできます。<b>{{manage.prefs.open}}</b> をクリックし、<b>{{manage.partner.title}}</b> までスクロールして、<b>{{manage.partner.name}}</b> と <b>{{manage.partner.email}}</b> を入力し、<b>{{manage.partner.add}}</b> をクリックします。",
              "相手には専用のプライベートリンクが届きます。ギフトの追加、購入済みの確認、設定の変更ができます。相手のメールアドレスがゲストに表示されることはなく、<b>{{manage.partner.remove}}</b> を押せば、そのリンクはすぐに無効になります。",
            ],
          },
          {
            title: "見られる人を選ぶ",
            items: [
              "ギフトリストの下部で <b>{{manage.prefs.open}}</b> をクリックします。<b>{{manage.prefs.settings}}</b> の <b>{{manage.prefs.who}}</b> で、<b>{{manage.prefs.priv.unlisted}}</b>、<b>{{manage.prefs.priv.password}}</b>、またはストアの検索ページ（初期設定では <b>Find a gift registry</b>）に表示される <b>{{manage.prefs.priv.public}}</b> から選びます。",
              "<b>{{manage.prefs.save}}</b> をクリックします。同じセクションで、名前、用途、日付、メッセージも変更できます。ストアが許可している場合は、<b>{{manage.lang.label}}</b> も選べます。",
            ],
            alts: ["3つの選択肢がある「このギフトリストを見られる人」メニュー"],
          },
          {
            title: "ギフトを自宅に届けてもらう",
            items: [
              "ギフトリストを作成した直後に、<b>{{manage.setup.shipTitle}}</b> とお尋ねします。チェックボックスにチェックを入れて配送先の住所を入力するか、いったんスキップしてください。",
              "あとから変更するには、<b>{{manage.prefs.open}}</b> をクリックし、<b>{{manage.ship.title}}</b> でチェックボックスにチェックを入れて住所を入力し、<b>{{manage.save}}</b> をクリックします。これで、ゲストはこのストアのギフトをあなたに直接配送できます。",
              "ギフトをカートに入れるとき、あなたに届けるか、自分宛てに送るかは、ゲストがそのつど決めます。ゲストにあなたの住所が見えることはありません。",
            ],
            alts: ["チェックを入れた「ゲストが私にギフトを配送できるようにする」セクションと、入力済みの配送先住所"],
          },
        ],
      },
      {
        title: "保存ボタンを押す場所",
        lede: "ギフトリストは、保存した内容しか残りません。ページの各部分に、それぞれ専用のボタンがあります。",
        tint: true,
        steps: [
          {
            title: "どのボタンで何が保存されるか",
            items: [
              "<b>{{manage.prefs.save}}</b> は、ページ下部の <b>{{manage.prefs.open}}</b> の中にある <b>{{manage.prefs.settings}}</b> の末尾にあります。名前、用途、日付、メッセージ、公開範囲を保存します。変更したあとにこのボタンを押さずに離れると、変更は失われます。",
              "同じパネルのすぐ下にある <b>{{manage.ship.title}}</b> の中の <b>{{manage.save}}</b> は、配送先の住所を保存します。上のボタンとは別なので、両方を変更した場合は両方を押してください。",
              "その下の <b>{{manage.partner.title}}</b> にある <b>{{manage.partner.add}}</b> は、パートナーにリンクを送り、その内容を保存します。",
              "アイテムの <b>{{manage.item.update}}</b> は、そのアイテムの数量、メモ、カテゴリを保存します。",
              "<b>{{manage.addToReg}}</b> は、クリックするとすぐに新しいアイテムを保存します。",
              "うまく保存できると、ページの上のほうに <b>{{manage.flash.saved}}</b> と表示されます。",
            ],
          },
        ],
      },
    ],
    faqTitle: "よくある質問",
    faq: [
      {
        q: "ゲストが同じものを買ってしまうのを防ぐには？",
        a: "このストアでの注文は、自動的にギフトリストに反映されます。ほかのサイトのギフトは、ゲストが購入後に「購入しました」をタップすると、アイテムが確保済みとして表示されます。気が変わったゲストは、24時間以内なら取り消せます。",
      },
      {
        q: "誰から何をもらったか、どうすればわかりますか？",
        a: "ギフトリストには、お礼状用の「誰が何を贈ったか」の一覧があり、誰かがギフトを購入すると、Giftpinからメールでお知らせします。",
      },
      {
        q: "ゲストは高価なものをみんなで贈れますか？",
        a: "ストアが対応していれば可能です。アイテムを「みんなでギフト」にしたり、新婚旅行や住まいのための「キャッシュファンド」を設けたりできます。支払いは、そのストアのギフトカードで行われます。",
      },
      {
        q: "変更したのに、保存されていませんでした。",
        a: "ページのその部分の保存ボタンを押してください。「ギフトリストと設定を編集」の「変更を保存」、「ゲストが私にギフトを配送できるようにする」の「保存」、アイテムの「更新」があります。",
      },
      {
        q: "ギフトリストを削除できますか？",
        a: "はい。ギフトリストの下部にある「ギフトリストと設定を編集」をクリックし、「ギフトリストを削除」をクリックします。すべてのアイテムと、誰が何を買ったかの記録が削除され、元に戻すことはできません。",
      },
    ],
  },
};
