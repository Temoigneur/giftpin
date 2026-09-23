/**
 * Giftpin browser extension — popup logic.
 *
 * No background service worker: everything here runs in the popup's own
 * privileged context, which is enough to call chrome.scripting (to read the
 * active tab, granted via the activeTab permission + the click that opened
 * this popup) and to fetch cross-origin to *.myshopify.com (granted via
 * host_permissions in manifest.json — that's what lets this skip CORS
 * entirely rather than needing the server to allow chrome-extension://
 * origins).
 *
 * Auth model: the registrant pastes their existing "manage your registry"
 * link once. The token in it is the same credential the manage page itself
 * uses (see app/models/registry.server.ts's authorizeManage) — there is no
 * separate extension login, and no server-side registration step beyond
 * verifying that token the first time (see ext-verify in
 * app/proxy/router.server.ts).
 */
(function () {
  "use strict";

  var connectView = document.getElementById("connectView");
  var addView = document.getElementById("addView");
  var manageLinkInput = document.getElementById("manageLink");
  var connectBtn = document.getElementById("connectBtn");
  var connectStatus = document.getElementById("connectStatus");

  var registryName = document.getElementById("registryName");
  var previewImage = document.getElementById("previewImage");
  var previewTitle = document.getElementById("previewTitle");
  var previewPrice = document.getElementById("previewPrice");
  var qtyInput = document.getElementById("qty");
  var addBtn = document.getElementById("addBtn");
  var addStatus = document.getElementById("addStatus");
  var dupPanel = document.getElementById("dupPanel");
  var dupMessage = document.getElementById("dupMessage");
  var dupQtyInput = document.getElementById("dupQty");
  var dupConfirmBtn = document.getElementById("dupConfirmBtn");
  var dupCancelBtn = document.getElementById("dupCancelBtn");
  var disconnectLink = document.getElementById("disconnectLink");

  var STORAGE_KEY = "giftpin_connection"; // { proxyBase, token, title }
  var extracted = null; // metadata read off the current page, once per popup open
  var pendingDup = null; // { itemId } while the duplicate-confirm panel is showing

  function setStatus(el, message, isError) {
    el.textContent = message || "";
    el.className = "status" + (isError ? " error" : "");
  }

  function getConnection() {
    return new Promise(function (resolve) {
      chrome.storage.local.get([STORAGE_KEY], function (result) {
        resolve(result[STORAGE_KEY] || null);
      });
    });
  }

  function saveConnection(conn) {
    return new Promise(function (resolve) {
      var data = {};
      data[STORAGE_KEY] = conn;
      chrome.storage.local.set(data, resolve);
    });
  }

  function clearConnection() {
    return new Promise(function (resolve) {
      chrome.storage.local.remove([STORAGE_KEY], resolve);
    });
  }

  // ---- connect --------------------------------------------------------

  function parseManageLink(raw) {
    try {
      var url = new URL(raw.trim());
      var token = url.searchParams.get("t");
      if (!token) return null;
      // Keep everything up to the proxy's own base path (e.g. ".../apps/
      // registry"), so this still works if a merchant renamed the proxy path
      // in their theme block settings.
      var path = url.pathname.replace(/\/manage\/?$/, "");
      return { proxyBase: url.origin + path, token: token };
    } catch (_) {
      return null;
    }
  }

  connectBtn.addEventListener("click", function () {
    var parsed = parseManageLink(manageLinkInput.value || "");
    if (!parsed) {
      var pasted = (manageLinkInput.value || "");
      var isShareLink = /\/r\/[^/?#]+/.test(pasted) && pasted.indexOf("t=") === -1;
      setStatus(
        connectStatus,
        isShareLink
          ? "That's your guest share link. Paste your private manage link instead: open your registry's manage page and use \u201cCopy link\u201d."
          : "That doesn't look like a manage link. Paste the private manage link (it contains ?t=) from your registry's manage page or email.",
        true,
      );
      return;
    }

    connectBtn.disabled = true;
    setStatus(connectStatus, "Connecting…");

    fetch(parsed.proxyBase + "/ext-verify?t=" + encodeURIComponent(parsed.token), {
      headers: { Accept: "application/json" },
    })
      .then(function (r) { return r.json(); })
      .then(function (result) {
        connectBtn.disabled = false;
        if (!result || !result.ok) {
          setStatus(connectStatus, (result && result.error) || "That link isn't working. Ask for a new one from your registry.", true);
          return;
        }
        return saveConnection({ proxyBase: parsed.proxyBase, token: parsed.token, title: result.title }).then(showAddView);
      })
      .catch(function () {
        connectBtn.disabled = false;
        setStatus(connectStatus, "Couldn't reach your store. Check your connection and try again.", true);
      });
  });

  disconnectLink.addEventListener("click", function (e) {
    e.preventDefault();
    clearConnection().then(showConnectView);
  });

  // ---- reading the current page ----------------------------------------

  function showConnectView() {
    addView.hidden = true;
    connectView.hidden = false;
  }

  function showAddView() {
    getConnection().then(function (conn) {
      if (!conn) { showConnectView(); return; }
      connectView.hidden = true;
      addView.hidden = false;
      registryName.textContent = conn.title || "Your registry";
      readCurrentPage();
    });
  }

  function readCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0];
      if (!tab || !tab.id) {
        previewTitle.textContent = "Couldn't read this page";
        return;
      }
      chrome.scripting.executeScript(
        { target: { tabId: tab.id }, func: extractProductMetadata },
        function (results) {
          var data = results && results[0] && results[0].result;
          if (!data || !data.title) {
            previewTitle.textContent = "Couldn't find a product on this page";
            previewPrice.textContent = "";
            addBtn.disabled = true;
            return;
          }
          extracted = data;
          previewTitle.textContent = data.title;
          previewPrice.textContent = data.price ? data.price + (data.currency ? " " + data.currency : "") : "";
          if (data.imageUrl) previewImage.src = data.imageUrl;
          addBtn.disabled = false;
        }
      );
    });
  }

  // Injected into the page itself via chrome.scripting.executeScript, so it
  // runs in the PAGE's context and can only read what the page already
  // rendered — same as View Source. That's deliberate: it's what lets this
  // work on sites (Amazon included) that block a server-side fetch of the
  // same URL. Keep this function self-contained — it's serialized and run
  // out of context, so it can't reference anything from the rest of this
  // file.
  function extractProductMetadata() {
    function meta(name) {
      var el = document.querySelector('meta[property="' + name + '"], meta[name="' + name + '"]');
      return el ? el.getAttribute("content") : null;
    }

    // Shared by every DOM-fallback path below (Amazon, generic Microdata).
    // Retailers render price as one string like "$8.82" or "USD$17.99" —
    // this splits the leading currency symbol/code from the numeric amount.
    // Never used on JSON-LD/meta values, which are already plain numbers.
    function parsePriceText(text) {
      var m = String(text || "").trim().match(/([\d,]+\.?\d*)/);
      return m ? m[1].replace(/,/g, "") : null;
    }

    // The symbol alone is ambiguous ("$" is USD, CAD, AUD, ...) — infer from
    // the store's own domain instead. Good enough for the common cases;
    // falls back to USD (the plurality case for .com) rather than guessing
    // wrong silently.
    function currencyFromHost(host) {
      if (/\.ca$/i.test(host)) return "CAD";
      if (/\.co\.uk$/i.test(host)) return "GBP";
      if (/\.com\.au$/i.test(host)) return "AUD";
      if (/\.co\.jp$/i.test(host)) return "JPY";
      if (/\.in$/i.test(host)) return "INR";
      if (/\.(de|fr|it|es|nl)$/i.test(host)) return "EUR";
      return "USD";
    }

    var jsonLd = null;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        var candidates = Array.isArray(data) ? data : [data].concat(data["@graph"] || []);
        for (var j = 0; j < candidates.length; j++) {
          var c = candidates[j];
          var type = c && c["@type"];
          if (type === "Product" || (Array.isArray(type) && type.indexOf("Product") !== -1)) {
            jsonLd = c;
            break;
          }
        }
        if (jsonLd) break;
      } catch (_) {
        /* not every ld+json block on a page is a Product — skip and keep looking */
      }
    }

    var offer = jsonLd && jsonLd.offers ? (Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers) : null;

    var title = (jsonLd && jsonLd.name) || meta("og:title") || meta("twitter:title") || document.title;
    var imageRaw = (jsonLd && jsonLd.image) || meta("og:image") || meta("twitter:image");
    var firstImage = Array.isArray(imageRaw) ? imageRaw[0] : imageRaw;
    // Some sites' JSON-LD `image` is an array of ImageObject
    // ({"@type":"ImageObject","contentURL":"...",...}) rather than plain URL
    // strings — confirmed live on Etsy, whose Product schema does this.
    // Unwrap it instead of stringifying the object (which previously
    // produced the literal text "[object Object]" and silently broke image
    // extraction on every Etsy listing despite a working og:image fallback
    // being available and unused).
    var imageUrl = firstImage && typeof firstImage === "object"
      ? (firstImage.contentURL || firstImage.url || null)
      : firstImage;
    var price = (offer && (offer.price || offer.lowPrice)) || meta("product:price:amount") || meta("og:price:amount");
    var currency = (offer && offer.priceCurrency) || meta("product:price:currency") || meta("og:price:currency");

    // Generic schema.org Microdata fallback (itemprop="price"/"image"/
    // "priceCurrency") — a real, independent structured-data convention a
    // number of large retailers use instead of (or without) JSON-LD/OG tags.
    // Confirmed live on walmart.com, which has neither og:price nor a
    // Product JSON-LD block but does render `<span itemprop="price">`.
    // Deliberately generic (no site check) since it's a documented web
    // standard, not one retailer's markup.
    if (!price) {
      var priceMicrodata = document.querySelector('[itemprop="price"]');
      if (priceMicrodata) {
        price = parsePriceText(priceMicrodata.getAttribute("content") || priceMicrodata.textContent);
        if (price && !currency) {
          var currencyMicrodata = document.querySelector('[itemprop="priceCurrency"]');
          currency = (currencyMicrodata && (currencyMicrodata.getAttribute("content") || currencyMicrodata.textContent)) || null;
        }
      }
    }
    if (!imageUrl) {
      var imageMicrodata = document.querySelector('[itemprop="image"]');
      if (imageMicrodata) {
        imageUrl = imageMicrodata.getAttribute("content") || imageMicrodata.src || null;
      }
    }

    // Site-specific fallbacks, only reached when both the generic pass and
    // the Microdata pass above found nothing. Each is confirmed live
    // against a real product page on that site.
    var host = location.hostname;

    // Amazon's real product pages carry none of the generic signals above —
    // no og:image, no og:title, no JSON-LD Product block, no
    // product:price:* meta, no Microdata (confirmed live against a real
    // listing, zero matches for all of them) — presumably deliberate
    // anti-scraping.
    if ((!imageUrl || !price) && /(^|\.)amazon\.[a-z.]+$/i.test(host)) {
      if (!imageUrl) {
        var landing = document.querySelector("#landingImage") || document.querySelector("#imgTagWrapperId img");
        if (landing) {
          // data-old-hires is the highest-resolution copy Amazon ships;
          // falls back to whatever's actually rendered if that's absent.
          imageUrl = landing.getAttribute("data-old-hires") || landing.src || null;
        }
      }
      if (!price) {
        var amazonPriceEl =
          document.querySelector("#corePrice_feature_div .a-price .a-offscreen") ||
          document.querySelector(".a-price .a-offscreen");
        if (amazonPriceEl) price = parsePriceText(amazonPriceEl.textContent);
      }
    }

    // target.com's product pages have og:title/og:image (so title/image
    // already come through the generic pass above) but no price signal of
    // any kind — no og:price, no JSON-LD Product/offers, no Microdata.
    // Confirmed live against a real listing.
    if (!price && /(^|\.)target\.com$/i.test(host)) {
      var targetPriceEl = document.querySelector('[data-test="product-price"]');
      if (targetPriceEl) price = parsePriceText(targetPriceEl.textContent);
    }

    // wayfair.com has og:title/og:image (title/image already come through
    // the generic pass above) but no og:price, JSON-LD Product/offers, or
    // Microdata price signal at all — confirmed live. It does render its own
    // `[data-test-id="PriceDisplay"]` attribute, but that attribute appears
    // dozens of times per page (related items, "frequently bought
    // together", reviews) — confirmed live, ~60 matches on one product page
    // — so grabbing the first DOM match is unreliable. Instead, pick
    // whichever match sits structurally closest to the page's <h1> (the
    // product title): confirmed live to reliably land on the real buy-box
    // price rather than an unrelated one elsewhere on the page. Crossed-out
    // "was" prices render in an <s> tag and are skipped.
    if (!price && /(^|\.)wayfair\.com$/i.test(host)) {
      var wfH1 = document.querySelector("h1");
      var wfCandidates = [];
      var wfAll = document.querySelectorAll('[data-test-id="PriceDisplay"]');
      for (var wi = 0; wi < wfAll.length; wi++) {
        if (wfAll[wi].tagName !== "S") wfCandidates.push(wfAll[wi]);
      }
      if (wfH1 && wfCandidates.length) {
        var wfH1Path = [];
        for (var wfNode = wfH1; wfNode; wfNode = wfNode.parentElement) wfH1Path.push(wfNode);
        var wfBest = null;
        var wfBestDist = Infinity;
        for (var wj = 0; wj < wfCandidates.length; wj++) {
          var wfDist = 0;
          var wfFound = false;
          for (var wfNode2 = wfCandidates[wj]; wfNode2; wfNode2 = wfNode2.parentElement) {
            var wfIdx = wfH1Path.indexOf(wfNode2);
            if (wfIdx !== -1) {
              wfDist += wfIdx;
              wfFound = true;
              break;
            }
            wfDist++;
          }
          if (wfFound && wfDist < wfBestDist) {
            wfBestDist = wfDist;
            wfBest = wfCandidates[wj];
          }
        }
        if (wfBest) price = parsePriceText(wfBest.textContent);
      }
    }

    if (price && !currency) currency = currencyFromHost(host);

    return {
      title: title ? String(title).trim().slice(0, 300) : null,
      imageUrl: imageUrl ? String(imageUrl) : null,
      price: price ? String(price) : null,
      currency: currency ? String(currency) : null,
      url: location.href,
    };
  }

  // ---- add --------------------------------------------------------------

  addBtn.addEventListener("click", function () {
    if (!extracted) return;
    addBtn.disabled = true;
    setStatus(addStatus, "Adding…");

    getConnection().then(function (conn) {
      if (!conn) { showConnectView(); return; }

      fetch(conn.proxyBase + "/ext-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: conn.token,
          title: extracted.title,
          url: extracted.url,
          imageUrl: extracted.imageUrl,
          price: extracted.price,
          currency: extracted.currency,
          qty: Number(qtyInput.value) || 1,
        }),
      })
        .then(function (r) { return r.json(); })
        .then(handleAddResult)
        .catch(function () {
          addBtn.disabled = false;
          setStatus(addStatus, "Couldn't add that. Check your connection and try again.", true);
        });
    });
  });

  function handleAddResult(result) {
    addBtn.disabled = false;

    if (result && result.ok && result.duplicate) {
      pendingDup = { itemId: result.itemId };
      dupMessage.textContent = "Already on this registry — currently want " + result.currentQty + ". How many total?";
      dupQtyInput.value = String((result.currentQty || 1) + 1);
      dupPanel.hidden = false;
      setStatus(addStatus, "");
      return;
    }

    if (result && result.ok) {
      setStatus(addStatus, "Added to your registry");
      return;
    }

    setStatus(addStatus, (result && result.error) || "Couldn't add that.", true);
  }

  dupConfirmBtn.addEventListener("click", function () {
    if (!pendingDup) return;
    dupConfirmBtn.disabled = true;
    setStatus(addStatus, "Updating…");

    getConnection().then(function (conn) {
      fetch(conn.proxyBase + "/ext-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: conn.token,
          itemId: pendingDup.itemId,
          confirmQty: Number(dupQtyInput.value) || 1,
        }),
      })
        .then(function (r) { return r.json(); })
        .then(function (result) {
          dupConfirmBtn.disabled = false;
          dupPanel.hidden = true;
          pendingDup = null;
          setStatus(addStatus, result && result.ok ? "Registry updated" : (result && result.error) || "Couldn't update that.", !(result && result.ok));
        })
        .catch(function () {
          dupConfirmBtn.disabled = false;
          setStatus(addStatus, "Couldn't update that. Please try again.", true);
        });
    });
  });

  dupCancelBtn.addEventListener("click", function () {
    pendingDup = null;
    dupPanel.hidden = true;
    setStatus(addStatus, "");
  });

  // ---- boot ---------------------------------------------------------------

  getConnection().then(function (conn) {
    if (conn) showAddView();
    else showConnectView();
  });
})();
