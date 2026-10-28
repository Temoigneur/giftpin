// "Add to any registry": adds the product to the shopper's Babylist registry
// using Babylist's own retailer script (babylist.com/add-to-babylist-integration).
// Loaded only when the merchant ticks "Also offer Babylist", so stores that
// leave it off ship nothing extra. giftpin.js wires the button to this.
(function () {
  "use strict";

  // Babylist's retailer script, loaded at most once per page and only when a
  // shopper picks Babylist. Its config object must exist before it runs.
  var babylistLoading = null;
  function loadBabylist(partner) {
    if (babylistLoading) return babylistLoading;
    babylistLoading = new Promise(function (resolve, reject) {
      function found() {
        var bl = window.bl;
        return bl && (typeof bl.addToRegistry === "function" || typeof bl.addToBabylist === "function")
          ? bl
          : null;
      }
      if (found()) return resolve(found());
      window._bl = window._bl || { partner: partner };
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://www.babylist.com/add.js";
      script.onload = function () {
        // The script may set up its global a moment after it runs.
        var tries = 0;
        (function check() {
          var bl = found();
          if (bl) return resolve(bl);
          if (++tries > 20) return reject(new Error("Babylist script not ready"));
          setTimeout(check, 100);
        })();
      };
      script.onerror = function () {
        reject(new Error("Babylist script failed to load"));
      };
      document.head.appendChild(script);
    });
    babylistLoading.catch(function () {
      babylistLoading = null;
    });
    return babylistLoading;
  }

  function babylistProduct(root, variantId) {
    var el = root.querySelector("[data-giftpin-babylist-product]");
    var product;
    try {
      product = el ? JSON.parse(el.textContent) : null;
    } catch (_) {
      product = null;
    }
    if (!product) return null;

    var variants = product.variants || [];
    var variant =
      variants.filter(function (v) { return String(v.id) === String(variantId || ""); })[0] || variants[0] || {};

    var image = variant.image || product.image;
    var scraped = [];
    if (variant.barcode) scraped.push({ key: "gtin", value: variant.barcode });
    if (variant.sku) scraped.push({ key: "sku", value: variant.sku });
    if (product.vendor) scraped.push({ key: "brand", value: product.vendor });

    return {
      title: variant.title ? product.title + " - " + variant.title : product.title,
      price: typeof variant.price === "number" ? (variant.price / 100).toFixed(2) : "",
      images: image ? [image.indexOf("//") === 0 ? "https:" + image : image] : [],
      url: product.url + (variant.id ? "?variant=" + variant.id : ""),
      scraped_data: scraped,
    };
  }

  function add(root, variantId) {
    var info = babylistProduct(root, variantId);
    if (!info) return Promise.reject(new Error("no product data"));
    return loadBabylist(root.dataset.babylistPartner).then(function (bl) {
      // Babylist's integration page describes bl.addToBabylist but every
      // example on it calls bl.addToRegistry, so accept either.
      var fn = bl.addToRegistry || bl.addToBabylist;
      fn.call(bl, info);
    });
  }

  window.GiftpinBabylist = { add: add };
})();
