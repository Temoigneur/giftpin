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
    for (var i = 0; i < roots.length; i++) init(roots[i]);
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

    var STORE_KEY = "giftpin.registries";

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
