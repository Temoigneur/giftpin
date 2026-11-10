import type { RawGuideCopy } from "./types";

const CHROME = "https://chromewebstore.google.com/detail/giftpin-%E2%80%94-add-to-registry/hfmielpmefknpgpekhfehnfdlhiobdkk";

export const zhTW: RawGuideCopy = {
  ui: {
    language: "語言",
    shotsNote: "截圖顯示的是畫面的英文版本。",
    shopifyNote:
      "Shopify 的畫面名稱（例如 Online Store → Navigation）以英文標示，與英文版 Shopify 後台一致。在您的語言中，這些名稱可能會顯示為翻譯後的文字。",
    finalCta: "準備好為您的顧客提供禮物清單了嗎？",
  },

  setup: {
    eyebrow: "設定指南",
    h1: `約十分鐘設定好 Giftpin<br><span class="grad-text">輕鬆上手</span>`,
    lede: "商家所需的一切，從安裝到第一份禮物清單。粗體文字就是您在畫面上會看到的內容。",
    metaTitle: "Giftpin 設定指南（適用於 Shopify 商家）",
    description:
      "如何安裝 Giftpin、將禮物清單按鈕和連結加入您的 Shopify 佈景主題、選擇場合與設定、找到每一個儲存按鈕，以及開啟 Pro 功能。",
    sections: [
      {
        title: "開始使用",
        steps: [
          {
            title: "安裝 Giftpin",
            items: [
              "在 Shopify App Store 開啟 Giftpin，然後點選 <b>Install</b>。",
              "同意權限畫面。Giftpin 會在您的 Shopify 後台開啟 <b>{{admin.nav.overview}}</b> 頁面。",
            ],
          },
          {
            title: "將 Giftpin 加入您的佈景主題",
            items: [
              "在 <b>{{admin.nav.overview}}</b> 中，前往 <b>{{admin.theme.title}}</b> 並選擇一個佈景主題。您可以先設定一份未發布的副本。",
              "點選 <b>{{admin.theme.btnAdd}}</b>。佈景主題編輯器會開啟，並已加入 Add to registry 按鈕。將它拖曳到您想要的位置，然後按下佈景主題編輯器右上角的 <b>Save</b>。",
              "回到 Giftpin，點選 <b>{{admin.theme.linksAdd}}</b>。這會在您的頁首下方加入建立、尋找和管理禮物清單的連結。在佈景主題編輯器中按下 <b>Save</b>。",
              "選擇性步驟，用於收藏清單：點選 <b>{{admin.theme.heartAdd}}</b>。這會在佈景主題編輯器中開啟商品頁面，並加入 <b>Save for later</b> 愛心。按下 <b>Save</b>。",
              "接著點選 <b>{{admin.theme.savedAdd}}</b>。這會在您的購物車頁面加入 <b>Saved items</b> 清單，讓顧客找到他們按過愛心的商品。按下 <b>Save</b>。",
              "這兩項不會自動啟用。在您於佈景主題編輯器中加入並按下 <b>Save</b> 之前，顧客不會看到愛心。愛心保存在顧客自己的瀏覽器中，不需要帳號，所以在新裝置上清單會是空的。",
              "想自己手動放置嗎？在佈景主題編輯器中開啟頁面，點選 <b>Add block</b>（或 <b>Add section</b>），開啟 <b>Apps</b> 群組，然後選擇 <b>Save for later</b> 或 <b>Saved items</b>。",
              "使用的是舊式（Online Store 2.0 之前）的佈景主題嗎？區塊在其中無法運作，但您的禮物清單頁面仍可使用：請在 <b>Online Store → Navigation</b> 中新增一個指向 <b>/apps/registry</b> 的選單項目。",
            ],
            alts: [
              "Giftpin 的總覽頁面，顯示「將 Giftpin 加入您的佈景主題」卡片，以及將按鈕加入商品頁面和加入禮物清單連結的按鈕",
              "Shopify 佈景主題編輯器，商品頁面上已選取 Add to registry 區塊",
            ],
          },
          {
            title: "檢查您的禮物清單頁面",
            items: [
              "在 <b>{{admin.nav.overview}}</b> 的 <b>{{admin.ov.pages}}</b> 底下，點選 <b>{{admin.ov.create}}</b>，查看顧客所使用的頁面。",
              "建立一份測試用的禮物清單，用 Add to registry 按鈕加入一項商品，然後開啟賓客連結，看看賓客所看到的畫面。",
              "顧客建立的每一份禮物清單，都會顯示在 Giftpin 選單的 <b>{{admin.nav.registries}}</b> 中。",
            ],
            alts: [
              "商店的商品頁面，「立即購買」下方有 Add to registry 按鈕，上方有建立、尋找和管理禮物清單的連結",
              "Giftpin 的禮物清單頁面，列出兩份婚禮禮物清單及其商品與進度",
            ],
          },
        ],
      },
      {
        title: "儲存按鈕在哪裡",
        lede: "變更必須儲存後才會生效，而每個畫面的按鈕位置都不一樣。以下是完整清單。",
        tint: true,
        steps: [
          {
            title: "在 Shopify 佈景主題編輯器中",
            items: [
              "<b>Save</b> 位於佈景主題編輯器的右上角。新增、移動或修改 Giftpin 區塊後，在您按下它之前，線上商店不會有任何變化。",
              "<b>{{admin.nav.overview}}</b> 上的 Giftpin 按鈕只會開啟已加入區塊的編輯器，不會替您儲存。",
            ],
          },
          {
            title: "在 Giftpin 的設定頁面",
            items: [
              "<b>{{admin.set.save}}</b> 位於頁面右上角的頁首。它會儲存從 <b>{{admin.set.occasions}}</b> 到 <b>{{admin.set.emails}}</b> 的所有內容。",
              "同樣的 <b>{{admin.set.save}}</b> 按鈕也會出現在該區塊底部，就在 <b>{{admin.set.emails}}</b> 的下方。兩個按鈕作用相同，請使用離您較近的那個。",
              "您會在畫面底部看到訊息 <b>{{admin.set.toast}}</b>，並在下方按鈕旁看到 <b>{{admin.set.saved}}</b>。",
              "<b>{{admin.set.funds}}</b>（其中包含 <b>{{admin.set.sell}}</b>）在該區段底部有自己的 <b>{{admin.set.save}}</b> 按鈕。頁首的按鈕不會儲存它：如果您在那裡做了任何變更，請按區段內的按鈕。",
              "<b>{{admin.set.runNow}}</b> 是一個動作，而不是設定，所以沒有需要儲存的內容。",
            ],
          },
          {
            title: "在 Giftpin 的其他頁面",
            items: [
              "<b>{{admin.nav.promotions}}</b>：填寫 <b>{{admin.promo.new}}</b>，然後點選表單底部的 <b>{{admin.promo.createBtn}}</b>。清單中的 <b>{{admin.promo.pause}}</b>、<b>{{admin.promo.resume}}</b> 和 <b>{{admin.promo.delete}}</b> 會立即生效。",
              "<b>{{admin.nav.inStore}}</b>：點選 <b>{{admin.ins.start}}</b> 底部的 <b>{{admin.ins.create}}</b>。",
              "<b>{{admin.reg.import}}</b>：選擇您的檔案，點選檢查檔案的按鈕，閱讀將會執行的動作，然後點選出現的匯入按鈕。",
              "<b>{{admin.nav.registries}}</b>、<b>{{admin.nav.analytics}}</b> 和 <b>{{admin.nav.overview}}</b> 只顯示資訊，所以沒有需要儲存的內容。",
            ],
          },
          {
            title: "在清單主人的管理頁面",
            items: [
              "清單主人有自己的頁面，從電子郵件中的私人連結開啟。請告訴他們要在哪裡儲存，因為禮物清單只會保留已儲存的內容。",
              "<b>{{manage.prefs.save}}</b> 位於 <b>{{manage.prefs.open}}</b> 裡面 <b>{{manage.prefs.settings}}</b> 的底部，靠近頁面下方。它會儲存名稱、場合、日期、留言、語言，以及誰可以查看。",
              "<b>{{manage.ship.title}}</b> 裡的 <b>{{manage.save}}</b> 會儲存運送地址。它和上面的按鈕是分開的。",
              "商品上的 <b>{{manage.item.update}}</b> 會儲存該商品的數量、備註和分類。",
              "首次設定時，按鈕是 <b>{{manage.setup.saveContinue}}</b> 和 <b>{{manage.setup.skip}}</b>。關於伴侶的第 2 步則是 <b>{{manage.partner.add}}</b> 和 <b>{{manage.partner.notNow}}</b>。",
            ],
          },
        ],
      },
      {
        title: "打造專屬於您的設定",
        lede: "全都在 Giftpin 的設定頁面中。",
        steps: [
          {
            title: "選擇您的場合",
            items: [
              "開啟 <b>{{admin.nav.settings}}</b>。在 <b>{{admin.set.occasions}}</b> 底下，勾選顧客可以建立的禮物清單類型：婚禮、迎嬰派對、生日、畢業、喬遷等等。",
              "勾選 <b>{{event.wishlist}}</b>，可建立沒有活動日期、可分享的清單，例如節慶願望清單。在您開啟之前，它是關閉的。",
              "按下 <b>{{admin.set.save}}</b>（右上角）。",
            ],
            alts: ["Giftpin 設定頁面，顯示場合清單以及來自其他商店商品的選項"],
          },
          {
            title: "決定是否接受其他商店的商品",
            items: [
              "在 <b>{{admin.set.ext}}</b> 底下，選擇 <b>{{admin.set.extOn}}</b>、<b>{{admin.set.extCapped}}</b> 或 <b>{{admin.set.extOff}}</b>。",
              "允許這些商品，會讓顧客選擇您的禮物清單作為主要清單。Giftpin 會在每個外部商品旁邊，建議您最相近的商品。",
            ],
          },
          {
            title: "決定商品售完時的處理方式",
            items: [
              "在 <b>{{admin.set.soldOut}}</b> 底下，選擇 <b>{{admin.set.soldOutShow}}</b> 或 <b>{{admin.set.soldOutHide}}</b>。",
              "每當賓客開啟禮物清單時，Giftpin 都會即時檢查您的庫存。商品一律會保留在清單上，所以補貨後它會自動回來。",
            ],
          },
          {
            title: "配合您商店的外觀與語言",
            items: [
              "在 <b>{{admin.set.appearance}}</b> 底下，設定 <b>{{admin.set.buttonLabel}}</b> 和 <b>{{admin.set.accent}}</b>。",
              "<b>{{admin.set.langLabel}}</b> 決定賓客在禮物清單頁面和清單電子郵件中看到的語言：英文、法文、西班牙文、德文或巴西葡萄牙文。",
              "Add to registry 按鈕和禮物清單連結在佈景主題編輯器中有各自的設定：文字、圖示、顏色、大小和間距。",
              "若要讓把清單放在其他地方的顧客也能使用您的按鈕，請在按鈕設定中勾選 <b>Also offer Babylist</b> 或 <b>Also offer \"Another registry\"</b>（為 Zola 等網站複製商品連結）。按鈕之後會詢問要加入哪一份清單。",
              "使用 Pro 時，<b>{{admin.set.branding}}</b> 會將您的標誌（<b>{{admin.set.logo}}</b>）、顏色和字型加到禮物清單頁面，並移除 Powered by Giftpin 的標示。",
            ],
            alts: ["Giftpin 設定頁面的外觀區段，含按鈕文字和強調色欄位"],
          },
          {
            title: "設定隱私",
            items: [
              "在 <b>{{admin.set.privacy}}</b> 底下，選擇是否要 <b>{{admin.set.hideBuyer}}</b>，以及是否開啟公開的尋找禮物清單頁面（<b>{{admin.set.find}}</b>）。只有擁有者同意的清單才會列在那裡。在您勾選之前，它是關閉的：在那之前，商店中的尋找連結會改為請訪客輸入禮物清單連結。 只有當清單的擁有者在其管理頁面的 <b>{{manage.prefs.who}}</b> 中也選擇 <b>{{manage.vis.public}}</b> 時，該清單才會列在那裡。",
            ],
          },
          {
            title: "提供清單專屬優惠（Pro）",
            items: [
              "在 <b>{{admin.set.perks}}</b> 底下，於 <b>{{admin.set.perksLabel}}</b> 中寫下您為在您這裡建立清單的人提供的優惠，每行一項：免費禮物包裝、清單達到某個金額時贈送禮物，等等。",
              "清單主人在建立清單時會看到這些優惠。按下 <b>{{admin.set.save}}</b>。",
            ],
          },
        ],
      },
      {
        title: "Pro",
        lede: "為想要更多功能的商店提供的選用加值功能。",
        steps: [
          {
            title: "開始使用 Pro",
            items: [
              "在 Giftpin 選單中開啟 <b>{{admin.nav.plan}}</b>，然後點選升級按鈕。您可享有 {{trialDays}} 天免費試用，之後 {{proName}} 每月 {{price}}。<b>{{admin.bill.cancel}}</b> 就在同一頁。",
            ],
          },
          {
            title: "集體送禮與禮金基金",
            items: [
              "在 Shopify 管理介面中，前往 <b>Products → Gift cards</b>，點擊 <b>Add a gift card product</b>。",
              "填寫標題和幾種金額，例如 25、50 和 100。若要在 giftpin.app 上販售，至少要有一種金額不超過 500（以您商店的幣別計）。在 <b>Sales channels and apps</b> 中保持勾選 <b>Online Store</b>，然後點擊 <b>Save gift card product</b>。",
              "在 <b>Settings → General → Order processing</b> 中，選擇 <b>Automatically fulfill only the gift cards</b>。Shopify 要等訂單完成處理後，才會發送禮品卡。",
              "在 Giftpin 中，開啟 <b>{{admin.nav.settings}}</b>。如果頁面原本就開著，請重新整理，讓新的禮品卡顯示出來。在 <b>{{admin.set.funds}}</b> 底下，於 <b>{{admin.set.fundsPick}}</b> 中選取您的禮品卡，然後按下該區段自己的 <b>{{admin.set.save}}</b>。",
              "現在登記人可以在管理頁面新增禮金基金：在 <b>{{manage.fund.title}}</b> 中填寫名稱和目標金額，然後點按 <b>{{manage.fund.add}}</b>。賓客用您禮品卡的金額，為基金或大型禮物出資。",
            ],
            alts: ["Shopify 的 Create gift card product 頁面，標題為 Redwood Essentials gift card，金額為 10、25、50 和 100", "Giftpin 設定中的集體送禮與禮金基金，已選好禮品卡並勾選在 giftpin.app 上架", "清單管理頁面上的禮金基金區塊，包含名稱、目標金額和備註欄位，以及新增基金按鈕"],
          },
          {
            id: "gift-cards",
            title: "在 giftpin.app 銷售禮品卡",
            items: [
              "這需要 Pro，以及上一步的禮品卡，並在 <b>{{admin.set.fundsPick}}</b> 中選取。如果那裡仍顯示 <b>{{admin.set.off}}</b>，您的商店就不會上架，儲存時 Giftpin 會顯示警告。",
              "在 Giftpin 中，開啟 <b>{{admin.nav.settings}}</b>。在 <b>{{admin.set.sell}}</b> 底下，勾選 <b>{{admin.set.listMine}}</b>，填寫 <b>{{admin.set.blurb}}</b>，然後按下該區段的 <b>{{admin.set.save}}</b>。",
              "您的商店現在會顯示在 <a href=\"/gift-cards?lang=zh-TW\">giftpin.app/gift-cards</a> 的您所在國家之下，而且您的禮物清單頁面會出現 <b>Rather give a gift card?</b> 連結。顧客在您自己的結帳流程中購買您的禮品卡，所以款項和任何未使用的餘額都歸您所有。以此方式售出的禮品卡會顯示在 Giftpin 的 <b>{{admin.nav.analytics}}</b> 中。",
              "Giftpin 會對以此方式售出的每張禮品卡收取 {{feePct}}%，列在您的 Shopify 帳單上，並在售出 {{holdDays}} 天後才收取，因此已退款的禮品卡絕不會被收費。免費試用期間不收取任何費用。",
            ],
            alts: ["商店的禮品卡頁面，顯示 $25、$50、$100 和 $250 的金額、直接以電子郵件寄送的勾選框和加入購物車按鈕"],
          },
          {
            title: "活動結束後的折扣與自動電子郵件",
            items: [
              "在 <b>{{admin.set.after}}</b> 底下，開啟 <b>{{admin.set.discount}}</b>，並設定 <b>{{admin.set.discountPct}}</b> 和 <b>{{admin.set.discountDays}}</b>。",
              "在 <b>{{admin.set.emails}}</b> 底下，選擇 <b>{{admin.set.guestRemind}}</b>、<b>{{admin.set.mostGone}}</b> 和 <b>{{admin.set.thanks}}</b>。",
              "按下 <b>{{admin.set.save}}</b>（右上角）。若想不必等一天就試用，請使用設定頁面底部的 <b>{{admin.set.runNow}}</b>。",
            ],
          },
          {
            title: "禮物清單促銷",
            items: [
              "開啟 <b>{{admin.nav.promotions}}</b>。在 <b>{{admin.promo.new}}</b> 底下，選擇 <b>{{admin.promo.typeSale}}</b> 或 <b>{{admin.promo.typeCoupon}}</b>，設定折扣和日期，然後點選 <b>{{admin.promo.createBtn}}</b>。",
              "促銷只適用於從禮物清單頁面加入購物車的禮物。以一般方式購買的同一商品，仍維持原價。",
              "促銷也會顯示在 Shopify 的 Discounts 頁面，名稱以「Giftpin:」開頭。",
            ],
          },
          {
            title: "數據分析與銷售報告",
            items: [
              "開啟 <b>{{admin.nav.analytics}}</b>，可查看隨時間變化的已建立禮物清單、已加入商品和已購買禮物、禮物的購買地點，以及逐月的銷售報告。<b>{{admin.an.csv}}</b> 可匯出報告。",
              "在 <b>{{admin.nav.registries}}</b> 底下，<b>{{admin.reg.csvRegs}}</b> 和 <b>{{admin.reg.csvPurch}}</b> 可匯出禮物清單和購買紀錄。",
            ],
          },
          {
            title: "店內模式與 Shopify POS",
            items: [
              "在 Giftpin 選單中開啟 <b>{{admin.nav.inStore}}</b>，即可在櫃檯找到顧客的禮物清單，或為他們建立一份。",
              "若要在 Shopify POS 中為禮物清單的禮物結帳，請加入 Giftpin 圖塊：在您的 Shopify 後台開啟 <b>Point of Sale</b>，進入 POS 編輯器，選擇 <b>Add tile → Apps</b>，然後選取 Giftpin。商品必須已發布到 Point of Sale 通路。 接著點擊畫面右上角的 <b>Save</b>，否則圖塊不會出現。",
              "清單主人也可以在您的店內用手機掃描商品條碼來加入商品：他們在管理頁面開啟 <b>{{manage.scan.open}}</b>。這需要您的商品有條碼（或 SKU），而且在畫面中清楚、完整地對準單一條碼時效果最好。",
            ],
          },
        ],
      },
      {
        title: "更多工具",
        lede: "您可能還沒注意到的小功能。",
        tint: true,
        steps: [
          {
            title: "從其他應用程式轉移禮物清單",
            items: [
              "開啟 <b>{{admin.nav.registries}}</b> 並點選 <b>{{admin.reg.import}}</b>。從舊的禮物清單應用程式匯出您的禮物清單為 CSV，每個商品一列，然後在 <b>{{admin.imp.fileLabel}}</b> 底下選擇該檔案。",
              "Giftpin 會依 SKU 或條碼將每個商品與您的商品配對，並在任何變更發生之前顯示它將執行的動作。只有在您的顧客預期會收到您關於轉移的通知時，才勾選 <b>{{admin.imp.email}}</b>。",
            ],
          },
          {
            title: "Shopify 後台中的禮物清單面板",
            items: [
              "在 Shopify 後台的訂單、顧客或商品頁面上，開啟 <b>More actions → Giftpin registry</b>，即可查看它屬於哪一份禮物清單、該顧客是否有禮物清單，或哪些禮物清單包含該商品。",
              "如果您沒有看到，這些擴充功能需要從應用程式的程式碼執行一次 <code>shopify app deploy</code>。",
            ],
          },
          {
            title: "Shopify Flow（Pro）",
            items: [
              "Giftpin 為 Shopify Flow 新增三個觸發條件：<b>Registry created</b>、<b>Registry event coming up</b> 和 <b>Registry gift bought</b>。您可以用它們寄電子郵件給清單主人、為顧客加標籤，或通知您的團隊。",
              "清單主人的電子郵件僅用於傳送與他們自己的禮物清單有關的訊息。向他們發送行銷內容仍須取得他們的同意。",
            ],
          },
          {
            title: "語言",
            items: [
              "賓客和清單主人看到的禮物清單頁面與電子郵件，使用的是您在 <b>{{admin.set.appearance}}</b> → <b>{{admin.set.langLabel}}</b> 下所選的語言。Giftpin 自己的後台頁面會在 Shopify 將語言提供給應用程式時，跟隨您的 Shopify 後台語言，否則使用您瀏覽器的語言。",
              "人們輸入的名稱和留言，以及您的商品標題，都會維持原本寫下的樣子。",
            ],
          },
        ],
      },
    ],
    faqTitle: "常見問題",
    faq: [
      {
        q: "我在哪裡可以看到顧客的禮物清單？",
        a: "開啟 Giftpin 選單中的「Registries」。「Overview」會顯示禮物清單營收、新顧客和已送出的禮物。",
      },
      {
        q: "清單主人或賓客需要帳號嗎？",
        a: "不需要。清單主人會透過電子郵件收到私人管理連結，賓客只需要禮物清單連結。",
      },
      {
        q: "我變更了設定，卻沒有任何反應。",
        a: "請確認您是否按下了儲存。在佈景主題編輯器中，它位於右上角。在 Giftpin 的設定頁面中，它位於右上角，並且在「自動電子郵件」下方再次出現，而「集體送禮與禮金基金」有自己的儲存按鈕。",
      },
      {
        q: "如果我解除安裝，佈景主題的區塊會怎麼樣？",
        a: "Shopify 會自動從您的佈景主題中移除這兩個 Giftpin 區塊。",
      },
      {
        q: "我卡住了，該聯絡誰？",
        a: "請寄電子郵件到 support@giftpin.app，並附上您商店的 .myshopify.com 網址，以及您當時想做的事。",
      },
    ],
  },

  registry: {
    eyebrow: "禮物清單指南",
    h1: `建立您的禮物清單<br><span class="grad-text">只需分享一個連結</span>`,
    lede: "如何建立 Giftpin 禮物清單、加入這間商店以及其他任何地方的禮物，並與賓客分享。粗體文字就是您在畫面上會看到的內容。",
    metaTitle: "如何使用 Giftpin 建立禮物清單",
    description:
      "如何在商店建立 Giftpin 禮物清單、加入該商店及任何其他網站的禮物、與賓客分享、儲存您的變更，以及讓禮物直接寄給您。",
    sections: [
      {
        title: "開始使用",
        steps: [
          {
            title: "建立您的禮物清單",
            items: [
              "在商店網站上，點選建立禮物清單的連結（預設為 <b>Create a gift registry</b>，通常在頁首下方或選單中；商店可能已更改文字）。您也可以在任何商品上按下 Add to registry 按鈕（預設為 <b>Add to registry</b>），系統會請您建立一份。",
              "在 <b>{{create.occasion}}</b> 選擇場合，然後填寫 <b>{{create.name}}</b>、<b>{{create.when}}</b>、<b>{{create.yourName}}</b> 和 <b>{{create.yourEmail}}</b>。",
              "在 <b>{{create.country}}</b> 選擇您賓客所在的國家。Giftpin 會用它來為這間商店沒有販售的東西推薦其他商店。",
              "您可以選擇性地寫下 <b>{{create.note}}</b>，然後點選 <b>{{create.submit}}</b>。",
            ],
            alts: ["建立禮物清單的表單，已填寫場合、清單名稱、日期、姓名、電子郵件和國家"],
          },
          {
            title: "妥善保管您的私人連結",
            items: [
              "Giftpin 會以電子郵件寄給您一個管理禮物清單的私人連結。您不需要帳號或密碼：這個連結就是您的入口，所以請保留這封郵件。它的有效期限為 90 天。",
              "弄丟了，或是失效了？在商店的建立禮物清單頁面，於 <b>已經有一份了嗎？</b> 底下輸入您的電子郵件，然後點選 <b>{{create.resendButton}}</b>。您收到的連結會列出您用該電子郵件建立的所有禮物清單。",
              "請勿分享這個連結。任何擁有它的人都可以編輯您的禮物清單。賓客會收到另一個不同的連結（請見下方的「分享」）。",
            ],
            alts: ["Giftpin 寄出的電子郵件，內有開啟我的禮物清單的按鈕"],
          },
        ],
      },
      {
        title: "加入您的禮物",
        lede: "可以來自這間商店，也可以來自任何其他網站。",
        tint: true,
        steps: [
          {
            title: "加入這間商店的商品",
            items: [
              "瀏覽商店，在任何商品頁面點選 <b>Add to registry</b>。您會看到 <b>Added to your registry</b> 和 <b>Back to your registry</b> 連結。",
              "在同一個商品上再次按下它，系統會詢問您總共想要幾個，因此不會不小心重複加入。",
              "使用另一支手機或電腦嗎？請先在那裡開啟電子郵件中的私人連結，這樣按鈕才知道哪一份是您的禮物清單。",
            ],
            alts: ["按下 Add to registry 之後的商品頁面，顯示 Added to your registry 和 Back to your registry 連結"],
          },
          {
            title: "加入任何其他網站的禮物",
            items: [
              "在您的禮物清單中，前往 <b>{{manage.addItems}}</b>，將商品網址貼到 <b>{{manage.productLink}}</b>，然後點選 <b>{{manage.lookUp}}</b>。Giftpin 會自動填入名稱、照片和價格。",
              "有些大型商店會封鎖這項功能。若發生這種情況，請自行輸入 <b>{{manage.name}}</b> 和 <b>{{manage.price}}</b>，然後點選 <b>{{manage.addToReg}}</b>。",
              "Giftpin 可能會顯示這間商店中類似的商品。點選 <b>{{manage.match.swap}}</b> 查看，或保留您原本的選擇。",
            ],
            alts: ["「加入商品」方塊，已查詢 Target 連結，顯示找到的照片、名稱和價格"],
          },
          {
            title: "或使用 Chrome 擴充功能",
            items: [
              `在電腦上，安裝<a href="${CHROME}" target="_blank" rel="noopener"> Chrome 版 Giftpin 擴充功能</a>。`,
              "在您的禮物清單中，於 <b>{{manage.ext.title}}</b> 底下點選 <b>{{manage.ext.copy}}</b>。開啟擴充功能，將連結貼到 <b>Manage link</b>，然後點選 <b>Connect</b>。這只需要做一次。",
              "之後，在任何網站的任何商品頁面，開啟擴充功能，選擇 <b>Quantity</b>，然後點選 <b>Add to registry</b>。",
            ],
            alts: ["Walmart 商品頁面上的 Giftpin 擴充功能，顯示數量和 Add to registry 按鈕"],
          },
          {
            title: "在店裡嗎？掃描條碼",
            items: [
              "如果商店有提供，請在手機上開啟您的私人連結，並點選 <b>{{manage.scan.open}}</b>。將相機對準標籤或包裝盒上的條碼，商品就會加入您的清單。",
              "手機詢問時，請允許使用相機。如果無法開啟，請將條碼下方的號碼輸入 <b>{{manage.scan.codeLabel}}</b>，然後點選 <b>{{manage.scan.lookUp}}</b>。",
              "請讓畫面只對準一個條碼，以免誤讀旁邊的條碼。",
            ],
          },
          {
            title: "微調您的清單",
            items: [
              "在 <b>{{manage.yourList}}</b> 底下，開啟任一商品，即可更改 <b>{{manage.item.qty}}</b>、新增 <b>{{manage.item.noteLabel}}</b>（例如尺寸或顏色）或選擇 <b>{{manage.item.category}}</b>，然後點選 <b>{{manage.item.update}}</b>。",
              "不知道該加入什麼嗎？點選 <b>{{manage.ideas.open}}</b>，看看適合您場合的點子。",
            ],
            alts: ["清單上已開啟編輯的一項商品，顯示給賓客的備註、數量和分類"],
          },
        ],
      },
      {
        title: "分享出去",
        steps: [
          {
            title: "與賓客分享",
            items: [
              "在禮物清單頂端，點選 <b>{{manage.shareBtn}}</b>，透過電子郵件、簡訊、WhatsApp 或 Facebook 傳送連結，或點選 <b>{{manage.copyLink}}</b>。",
              "想把代碼放在邀請函或看板上嗎？點選分享按鈕旁的 <b>{{manage.qr}}</b>，再點選 <b>{{manage.qr.download}}</b>。賓客用手機相機對準它，就能開啟您的禮物清單。",
              "賓客可以看到您的禮物以及還需要什麼。他們永遠看不到您的電子郵件或地址，也不需要帳號。",
            ],
            alts: [
              "分享連結，附有複製連結、電子郵件、簡訊、WhatsApp 和 Facebook 按鈕",
              "賓客所看到的畫面：禮物清單中有一項商店商品、一份已有人處理的禮物，以及一項來自 Walmart 的商品",
            ],
          },
          {
            title: "與他人一起規劃",
            items: [
              "建立禮物清單之後，我們會立刻詢問 <b>{{manage.setup.partnerTitle}}</b> 您也可以稍後再做：點選 <b>{{manage.prefs.open}}</b>，捲動到 <b>{{manage.partner.title}}</b>，輸入 <b>{{manage.partner.name}}</b> 和 <b>{{manage.partner.email}}</b>，然後點選 <b>{{manage.partner.add}}</b>。",
              "對方會收到自己的私人連結。他們可以加入禮物、查看已購買的項目並更改設定。他們的電子郵件絕不會顯示給賓客，而 <b>{{manage.partner.remove}}</b> 會立即停用他們的連結。",
            ],
          },
          {
            title: "選擇誰可以查看",
            items: [
              "在禮物清單底部，點選 <b>{{manage.prefs.open}}</b>。在 <b>{{manage.prefs.settings}}</b> 底下，使用 <b>{{manage.prefs.who}}</b>：<b>{{manage.prefs.priv.unlisted}}</b>、<b>{{manage.prefs.priv.password}}</b>，或在商店的尋找禮物清單頁面（預設為 <b>Find a gift registry</b>）上的 <b>{{manage.prefs.priv.public}}</b>。",
              "點選 <b>{{manage.prefs.save}}</b>。同一區段也可以更改名稱、場合、日期和留言。如果商店允許，還會有 <b>{{manage.lang.label}}</b>。",
            ],
            alts: ["「誰可以查看」選單及其三個選項"],
          },
          {
            title: "讓禮物直接寄給您",
            items: [
              "建立禮物清單之後，我們會立刻詢問 <b>{{manage.setup.shipTitle}}</b> 請勾選方塊並輸入您的運送地址，或先略過。",
              "之後若要更改，請點選 <b>{{manage.prefs.open}}</b>，然後在 <b>{{manage.ship.title}}</b> 底下勾選方塊、輸入您的地址，並點選 <b>{{manage.save}}</b>。賓客就可以將在這間商店購買的禮物直接寄給您。",
              "每位賓客在將禮物加入購物車時自行決定：寄給您，或寄給自己。賓客永遠看不到您的地址。",
            ],
            alts: ["「讓賓客將禮物寄給我」區段，方塊已勾選並填入運送地址"],
          },
        ],
      },
      {
        title: "在哪裡按下儲存",
        lede: "禮物清單只會保留您已儲存的內容。頁面的每個部分都有自己的按鈕。",
        tint: true,
        steps: [
          {
            title: "哪個按鈕儲存什麼",
            items: [
              "<b>{{manage.prefs.save}}</b> 位於 <b>{{manage.prefs.open}}</b> 裡面 <b>{{manage.prefs.settings}}</b> 的最後，靠近頁面底部。它會儲存名稱、場合、日期、留言，以及誰可以查看。如果您做了變更卻沒有按它就離開，變更就會遺失。",
              "<b>{{manage.ship.title}}</b> 裡的 <b>{{manage.save}}</b>，就在同一個面板中它的下方，會儲存您的運送地址。它與上面的按鈕是分開的，所以如果兩邊都改了，請兩個都按。",
              "再往下，<b>{{manage.partner.title}}</b> 中的 <b>{{manage.partner.add}}</b> 會將連結寄給您的夥伴並儲存他們的資料。",
              "商品上的 <b>{{manage.item.update}}</b> 會儲存該商品的數量、備註和分類。",
              "<b>{{manage.addToReg}}</b> 在您點選的當下就會儲存新商品。",
              "成功之後，您會在頁面頂端附近看到 <b>{{manage.flash.saved}}</b>。",
            ],
          },
        ],
      },
    ],
    faqTitle: "常見問題",
    faq: [
      {
        q: "賓客如何避免買到相同的東西？",
        a: "在這間商店下的訂單會自動更新您的禮物清單。對於來自其他網站的禮物，賓客在購買後點選「我買了這個」，該商品就會顯示為已被預訂。改變心意的賓客可以在 24 小時內撤銷。",
      },
      {
        q: "我怎麼知道誰送了我什麼？",
        a: "您的禮物清單有一份「誰送了什麼」清單，方便您寫感謝函，而且當有人購買禮物時，Giftpin 會寄電子郵件通知您。",
      },
      {
        q: "賓客可以共同出資購買大型禮物嗎？",
        a: "如果商店有提供，可以。您的禮物清單可以將某項商品變成集體送禮，或為蜜月旅行或房子設立禮金基金，並以該商店的禮品卡支付。",
      },
      {
        q: "我改了東西，但沒有保留下來。",
        a: "請按下頁面該部分的儲存按鈕：在「編輯禮物清單與偏好設定」中按「儲存變更」，在「讓賓客將禮物寄給我」下按「儲存」，或在商品上按「更新」。",
      },
      {
        q: "我可以刪除我的禮物清單嗎？",
        a: "可以。點選禮物清單底部的「編輯禮物清單與偏好設定」，然後點選「刪除禮物清單」。這會移除所有商品以及誰買了什麼的紀錄，而且無法復原。",
      },
    ],
  },
};
