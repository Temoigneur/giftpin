/**
 * Add-to-registry, storefront side.
 *
 * Constraints this is written against:
 *  - It runs on someone else's theme. Touch nothing outside our own root.
 *  - No dependencies, no globals, no polyfills. Under 3KB.
 *  - The variant changes as the shopper picks options, and themes announce that
 *    a dozen different ways. Listen for all of them, trust none of them.
 */
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
    var roots = document.querySelectorAll("[data-registro-root]");
    for (var i = 0; i < roots.length; i++) init(roots[i]);
  });

  function init(root) {
    var openBtn = root.querySelector("[data-registro-open]");
    var picker = root.querySelector("[data-registro-picker]");
    var select = root.querySelector("[data-registro-select]");
    var qtyInput = root.querySelector("[data-registro-qty]");
    var confirmBtn = root.querySelector("[data-registro-confirm]");
    var statusEl = root.querySelector("[data-registro-status]");
    var labelEl = root.querySelector("[data-registro-label]");
    var dupPanel = root.querySelector("[data-registro-dup]");
    var dupMessageEl = root.querySelector("[data-registro-dup-message]");
    var dupQtyInput = root.querySelector("[data-registro-dup-qty]");
    var dupConfirmBtn = root.querySelector("[data-registro-dup-confirm]");
    var dupCancelBtn = root.querySelector("[data-registro-dup-cancel]");

    if (!openBtn) return;

    var proxy = (root.dataset.proxy || "/apps/registry").replace(/\/+$/, "");
    var registries = null;
    // Set once a duplicate-add prompt is showing, so the confirm button knows
    // which registry/item it's updating.
    var pendingDup = null;

    function status(message, isError) {
      if (!statusEl) return;
      statusEl.textContent = message || "";
      statusEl.className = "registro-status" + (isError ? " registro-status--error" : "");
    }

    // ---- variant tracking -------------------------------------------------
    //
    // Themes broadcast variant changes inconsistently. Rather than guess which
    // convention this theme uses, read the URL (which every theme updates) and
    // listen for the common events as a belt-and-braces refresh.

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

    // ---- actions ----------------------------------------------------------

    // ---- who is this shopper? --------------------------------------------
    //
    // App proxy strips cookies, so there is no session to read. Two sources:
    //
    //   1. localStorage — the registry page writes the shopper's own magic-link
    //      tokens here. Same origin as the product page (both are served from
    //      the merchant's domain), so this just works, and it means a registrant
    //      never has to create an account.
    //   2. logged_in_customer_id — for shoppers who DO have a store account,
    //      the server can look their registries up without any token.
    //
    // localStorage is a per-browser convenience, never the source of truth: the
    // server re-verifies every token before it touches anything.

    var STORE_KEY = "registro.registries";

    function localRegistries() {
      try {
        var raw = window.localStorage.getItem(STORE_KEY);
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

      // No local tokens. If the shopper is signed in, the server can still find
      // their registries from logged_in_customer_id.
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
        // Carried through so a "you already have this" response can be
        // confirmed with the right registry/token without looking it up again.
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
      // Carry the product through so the registrant lands back on it after
      // creating a registry, instead of starting over.
      window.location.href =
        proxy +
        "?return=" +
        encodeURIComponent(window.location.pathname + window.location.search);
    }

    openBtn.addEventListener("click", function () {
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

          // One registry is the overwhelmingly common case. Don't make someone
          // pick from a list of one.
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
    });

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
        if (labelEl) {
          var original = labelEl.textContent;
          labelEl.textContent = "Added";
          setTimeout(function () {
            labelEl.textContent = original;
          }, 2500);
        }
      } else {
        status((result && result.error) || labelKey("error", "Couldn't add that."), true);
      }
    }

    function showDuplicatePrompt(result) {
      if (!dupPanel || !dupQtyInput) {
        // Older cached theme asset without the prompt markup — don't leave the
        // registrant thinking nothing happened.
        status(
          "This is already on the registry (want " + (result.currentQty || 1) +
            "). Open the registry to change the quantity.",
        );
        return;
      }

      if (picker) picker.hidden = true;

      pendingDup = { registryId: result._registryId, token: result._token, itemId: result.itemId };
      dupQtyInput.value = String((result.currentQty || 1) + 1);
      if (dupMessageEl) {
        dupMessageEl.textContent =
          "Already on this registry — currently want " + (result.currentQty || 1) + ". How many total?";
      }
      dupPanel.hidden = false;
      status("");
    }

    if (dupConfirmBtn) {
      dupConfirmBtn.addEventListener("click", function () {
        if (!pendingDup) return;
        dupConfirmBtn.disabled = true;
        status(labelKey("updating", "Updating..."));

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
            } else {
              status((result && result.error) || labelKey("error", "Couldn't update that."), true);
            }
          })
          .catch(function () {
            dupConfirmBtn.disabled = false;
            status(labelKey("error", "Couldn't update that. Please try again."), true);
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

    function labelKey(_key, fallback) {
      return fallback;
    }
  }
})();
