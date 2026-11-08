(function () {
  "use strict";

  var ready =
    document.readyState === "loading"
      ? function (fn) {
          document.addEventListener("DOMContentLoaded", fn);
        }
      : function (fn) {
          fn();
        };

  ready(function () {
    var roots = document.querySelectorAll("[data-giftpin-root]");
    // A merchant can end up with the block twice on one product template
    // (added by hand, then again from the app's "Add Giftpin to your theme"
    // link). Show one button per product; the theme editor still shows every
    // copy so the merchant can see and remove the extra one.
    var designMode = !!(window.Shopify && window.Shopify.designMode);
    var seen = {};
    for (var i = 0; i < roots.length; i++) {
      if (roots[i].getAttribute("data-giftpin-ready")) continue;
      var productId = roots[i].getAttribute("data-product-id");
      if (!designMode && productId && seen[productId]) {
        roots[i].hidden = true;
        roots[i].style.display = "none";
        continue;
      }
      if (productId) seen[productId] = true;
      roots[i].setAttribute("data-giftpin-ready", "1");
      init(roots[i]);
    }
  });

  function init(root) {
    var openBtn = root.querySelector("[data-giftpin-open]");
    var picker = root.querySelector("[data-giftpin-picker]");
    var select = root.querySelector("[data-giftpin-select]");
    var qtyInput = root.querySelector("[data-giftpin-qty]");
    var confirmBtn = root.querySelector("[data-giftpin-confirm]");
    var statusEl = root.querySelector("[data-giftpin-status]");
    var labelEl = root.querySelector("[data-giftpin-label]");
    var dupPanel = root.querySelector("[data-giftpin-dup]");
    var dupMessageEl = root.querySelector("[data-giftpin-dup-message]");
    var dupQtyInput = root.querySelector("[data-giftpin-dup-qty]");
    var dupConfirmBtn = root.querySelector("[data-giftpin-dup-confirm]");
    var dupCancelBtn = root.querySelector("[data-giftpin-dup-cancel]");

    if (!openBtn) return;

    var proxy = (root.dataset.proxy || "/apps/registry").replace(/\/+$/, "");
    var registries = null;
    var pendingDup = null;

    // Registry sale or coupon on this product (Pro stores with a promotion
    // running). The server answers with the line to show, or null.
    var dealEl = root.querySelector("[data-giftpin-deal]");
    if (dealEl && root.dataset.productId) {
      fetch(
        proxy + "/deal?product=" + encodeURIComponent(root.dataset.productId) +
          "&price=" + encodeURIComponent(root.dataset.price || ""),
        { headers: { Accept: "application/json" }, credentials: "same-origin" }
      )
        .then(function (response) { return response.ok ? response.json() : null; })
        .then(function (body) {
          if (body && body.text) {
            dealEl.textContent = body.text;
            dealEl.hidden = false;
          }
        })
        .catch(function () {});
    }

    function status(message, isError) {
      if (!statusEl) return;
      statusEl.textContent = message || "";
      statusEl.className = "giftpin-status" + (isError ? " giftpin-status--error" : "");
    }

    function currentVariantId() {
      var fromUrl = new URLSearchParams(window.location.search).get("variant");
      if (fromUrl) return fromUrl;

      var input = document.querySelector(
        'form[action*="/cart/add"] [name="id"]:not([disabled])'
      );
      if (input && input.value) return input.value;

      return root.dataset.variantId;
    }

    ["variant:change", "variantChange", "product:variant-change"].forEach(function (name) {
      document.addEventListener(name, function (event) {
        var variant = event && event.detail && (event.detail.variant || event.detail);
        if (variant && variant.id) root.dataset.variantId = String(variant.id);
      });
    });

    window.addEventListener("popstate", function () {
      var id = currentVariantId();
      if (id) root.dataset.variantId = String(id);
    });

    // Must match REGISTRIES_STORAGE_KEY in app/shared/storage-keys.ts (the
    // manage page writes it). LEGACY_KEY covers browsers that last opened
    // their registry before the rename.
    var STORE_KEY = "giftpin.registries";
    var LEGACY_KEY = "registro.registries";

    function localRegistries() {
      try {
        var raw = window.localStorage.getItem(STORE_KEY) || window.localStorage.getItem(LEGACY_KEY);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(function (r) { return r && r.id && r.token; }) : [];
      } catch (_) {
        return [];
      }
    }

    function loadRegistries() {
      var local = localRegistries();
      if (local.length > 0) return Promise.resolve({ registries: local });

      if (!root.dataset.customerId) return Promise.resolve({ registries: [] });

      return fetch(proxy + "/my-registries", {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      })
        .then(function (response) {
          return response.ok ? response.json() : { registries: [] };
        })
        .catch(function () {
          return { registries: [] };
        });
    }

    function add(registryId, qty) {
      var match = localRegistries().filter(function (r) { return r.id === registryId; })[0];
      var token = match ? match.token : null;

      return fetch(proxy + "/add-from-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          registryId: registryId,
          token: token,
          productId: root.dataset.productId,
          variantId: currentVariantId(),
          title: root.dataset.productTitle,
          imageUrl: root.dataset.productImage,
          price: root.dataset.price,
          currency: root.dataset.currency,
          qty: qty || 1,
        }),
      }).then(function (response) {
        return response.json();
      }).then(function (result) {
        result._registryId = registryId;
        result._token = token;
        return result;
      });
    }

    function confirmDuplicateQty(registryId, token, itemId, desiredQty) {
      return fetch(proxy + "/add-from-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          registryId: registryId,
          token: token,
          itemId: itemId,
          confirmQty: desiredQty,
        }),
      }).then(function (response) {
        return response.json();
      });
    }

    function goCreate() {
      window.location.href =
        proxy +
        "?return=" +
        encodeURIComponent(window.location.pathname + window.location.search);
    }

    // "Add to any registry": when the merchant turns on another registry
    // option, the button first asks which registry, so shoppers who keep
    // theirs elsewhere still get a reason to use this store's button. Each
    // option button carries data-giftpin-option="<key>" and is handled by
    // CHOICES[key]; a handler returns a promise so its button can show it's
    // busy. To add a registry, add its toggle and button in
    // add-to-registry.liquid and its handler here.
    var choicePanel = root.querySelector("[data-giftpin-choice]");
    var offersChoice = !!(root.dataset.offersChoice && choicePanel);

    var CHOICES = {
      store: function () {
        startGiftpinAdd();
        return Promise.resolve();
      },
      babylist: function () {
        var babylist = window.GiftpinBabylist;
        return (babylist ? babylist.add(root, currentVariantId()) : Promise.reject(new Error("not loaded")))
          .then(function () {
            status("");
          })
          .catch(function (err) {
            status(root.dataset.labelBabylistError || "Couldn't open Babylist. Please try again.", true);
            throw err;
          });
      },
      // Zola, The Knot and most other registries have no retailer button,
      // only their own app or browser button that takes a product link.
      other: function () {
        var variantId = currentVariantId();
        var link =
          window.location.origin + window.location.pathname + (variantId ? "?variant=" + variantId : "");
        return copyText(link).then(
          function () {
            status(
              root.dataset.labelLinkCopied ||
                "Product link copied. In your other registry, paste it where it asks for a link.",
            );
          },
          function (err) {
            window.prompt(labelKey("copy_prompt", "Copy this link:"), link);
            throw err;
          },
        );
      },
    };

    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        var field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        var ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (_) {}
        document.body.removeChild(field);
        if (ok) resolve();
        else reject(new Error("copy failed"));
      });
    }

    openBtn.addEventListener("click", function () {
      if (offersChoice) {
        choicePanel.hidden = !choicePanel.hidden;
        if (picker) picker.hidden = true;
        if (dupPanel) dupPanel.hidden = true;
        status("");
        return;
      }
      startGiftpinAdd();
    });

    if (choicePanel) {
      choicePanel.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-giftpin-option]");
        var handler = btn && CHOICES[btn.getAttribute("data-giftpin-option")];
        if (!handler || btn.disabled) return;
        btn.disabled = true;
        handler()
          .then(
            function () {
              choicePanel.hidden = true;
            },
            function () {},
          )
          .then(function () {
            btn.disabled = false;
          });
      });
    }

    function startGiftpinAdd() {
      openBtn.disabled = true;
      status(labelKey("adding", "Adding..."));

      var pending = registries ? Promise.resolve({ registries: registries }) : loadRegistries();

      pending
        .then(function (data) {
          registries = data.registries || [];

          if (registries.length === 0) {
            status("");
            goCreate();
            return;
          }

          if (registries.length === 1) {
            return add(registries[0].id, 1).then(handleResult);
          }

          if (picker && select) {
            select.innerHTML = "";
            registries.forEach(function (registry) {
              var option = document.createElement("option");
              option.value = registry.id;
              option.textContent = registry.title;
              select.appendChild(option);
            });
            picker.hidden = false;
            openBtn.disabled = false;
            status("");
          }
        })
        .catch(function () {
          status(labelKey("error", "Couldn't add that. Please try again."), true);
          openBtn.disabled = false;
        });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        confirmBtn.disabled = true;
        status(labelKey("adding", "Adding..."));
        add(select.value, Number(qtyInput && qtyInput.value) || 1)
          .then(function (result) {
            handleResult(result);
            confirmBtn.disabled = false;
            if (picker) picker.hidden = true;
          })
          .catch(function () {
            status(labelKey("error", "Couldn't add that. Please try again."), true);
            confirmBtn.disabled = false;
          });
      });
    }

    function handleResult(result) {
      openBtn.disabled = false;

      if (result && result.ok && result.duplicate) {
        showDuplicatePrompt(result);
        return;
      }

      if (result && result.ok) {
        status(labelKey("added", "Added to your registry"));
        showBackLink(result._registryId, result._token);
        if (labelEl) {
          var original = labelEl.textContent;
          labelEl.textContent = labelKey("added_short", "Added");
          setTimeout(function () {
            labelEl.textContent = original;
          }, 2500);
        }
      } else {
        status((result && result.error) || labelKey("error", "Couldn't add that."), true);
      }
    }

    // Once something is added, give the registrant a one-tap way back to
    // their manage page instead of several presses of the back button. With a
    // saved token it opens that registry; without one (signed-in customer),
    // /manage sends them to their own registry or a chooser.
    function showBackLink(registryId, token) {
      if (!statusEl) return;
      var link = root.querySelector("[data-giftpin-back]");
      if (!link) {
        link = document.createElement("a");
        link.className = "giftpin-back";
        link.setAttribute("data-giftpin-back", "");
        link.textContent = labelKey("back", "Back to your registry") + " \u2192";
        statusEl.parentNode.insertBefore(link, statusEl.nextSibling);
      }
      link.href = proxy + "/manage" + (token ? "?t=" + encodeURIComponent(token) : "");
    }

    function showDuplicatePrompt(result) {
      if (!dupPanel || !dupQtyInput) {
        status(
          labelKey(
            "dup_short",
            "This is already on the registry (want {qty}). Open the registry to change the quantity.",
          ).replace(/__QTY__|\{qty\}/g, String(result.currentQty || 1)),
        );
        return;
      }

      if (picker) picker.hidden = true;

      pendingDup = { registryId: result._registryId, token: result._token, itemId: result.itemId };
      dupQtyInput.value = String((result.currentQty || 1) + 1);
      if (dupMessageEl) {
        dupMessageEl.textContent = labelKey(
          "dup_message",
          "Already on this registry: currently want {qty}. How many total?",
        ).replace(/__QTY__|\{qty\}/g, String(result.currentQty || 1));
      }
      dupPanel.hidden = false;
      status("");
    }

    if (dupConfirmBtn) {
      dupConfirmBtn.addEventListener("click", function () {
        if (!pendingDup) return;
        dupConfirmBtn.disabled = true;
        status(labelKey("updating", "Updating..."));

        var pendingRegistryId = pendingDup.registryId;
        var pendingToken = pendingDup.token;
        confirmDuplicateQty(
          pendingDup.registryId,
          pendingDup.token,
          pendingDup.itemId,
          Number(dupQtyInput && dupQtyInput.value) || 1,
        )
          .then(function (result) {
            dupConfirmBtn.disabled = false;
            dupPanel.hidden = true;
            pendingDup = null;
            if (result && result.ok) {
              status(labelKey("updated", "Registry updated"));
              showBackLink(pendingRegistryId, pendingToken);
            } else {
              status((result && result.error) || labelKey("update_error", "Couldn't update that."), true);
            }
          })
          .catch(function () {
            dupConfirmBtn.disabled = false;
            status(labelKey("update_error", "Couldn't update that. Please try again."), true);
          });
      });
    }

    if (dupCancelBtn) {
      dupCancelBtn.addEventListener("click", function () {
        pendingDup = null;
        if (dupPanel) dupPanel.hidden = true;
        status("");
      });
    }

    // Labels come from the block's data-label-* attributes, which Liquid fills
    // in the storefront's language (locales/*.json). The English fallbacks
    // only show if an attribute is missing.
    function labelKey(key, fallback) {
      var name = "label" + key.replace(/(^|_)([a-z])/g, function (_m, _u, c) { return c.toUpperCase(); });
      return root.dataset[name] || fallback;
    }

    // Arrived from a Saved items row ("Add to registry" link in
    // giftpin-saved.js): open the add flow straight away, then drop the
    // parameter so a refresh or a shared link doesn't re-trigger it.
    try {
      var landing = new URL(window.location.href);
      if (landing.searchParams.get("giftpin_add") === "1") {
        landing.searchParams.delete("giftpin_add");
        window.history.replaceState(null, "", landing.pathname + landing.search + landing.hash);
        if (root.scrollIntoView) root.scrollIntoView({ block: "center" });
        openBtn.click();
      }
    } catch (_) {}
  }
})();
