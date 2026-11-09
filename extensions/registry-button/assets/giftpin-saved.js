(function () {
  "use strict";

  // Must match SAVED_ITEMS_STORAGE_KEY in app/shared/storage-keys.ts.
  var SAVED_KEY = "giftpin.saved";
  var MAX_SAVED = 200;

  function read() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]");
      return Array.isArray(parsed)
        ? parsed.filter(function (x) { return x && typeof x.h === "string" && x.h; })
        : [];
    } catch (_) {
      return [];
    }
  }

  function write(list) {
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, MAX_SAVED)));
      return true;
    } catch (_) {
      return false;
    }
  }

  function indexOf(list, handle) {
    for (var i = 0; i < list.length; i++) if (list[i].h === handle) return i;
    return -1;
  }

  // Keep every heart and list on the page, and other tabs, in step.
  function refreshAll() {
    var hearts = document.querySelectorAll("[data-giftpin-save-root]");
    for (var i = 0; i < hearts.length; i++) hearts[i].giftpinRefresh && hearts[i].giftpinRefresh();
    var lists = document.querySelectorAll("[data-giftpin-saved-root]");
    for (var j = 0; j < lists.length; j++) lists[j].giftpinRefresh && lists[j].giftpinRefresh();
  }

  function initHeart(root) {
    if (window.GiftpinI18n) window.GiftpinI18n.apply(root);
    var btn = root.querySelector("[data-giftpin-save]");
    var statusEl = root.querySelector("[data-giftpin-save-status]");
    if (!btn) return;
    var handle = root.dataset.handle;
    var labelSave = root.dataset.labelSave || "Save for later";
    var labelSaved = root.dataset.labelSaved || "Saved";
    var labelEl = root.querySelector("[data-giftpin-save-label]");

    function paint() {
      var saved = indexOf(read(), handle) >= 0;
      btn.setAttribute("aria-pressed", saved ? "true" : "false");
      btn.classList.toggle("giftpin-heart--on", saved);
      if (labelEl) labelEl.textContent = saved ? labelSaved : labelSave;
    }
    root.giftpinRefresh = paint;

    btn.addEventListener("click", function () {
      var list = read();
      var at = indexOf(list, handle);
      if (at >= 0) {
        list.splice(at, 1);
      } else {
        list.unshift({
          h: handle,
          t: root.dataset.title || handle,
          i: root.dataset.image || "",
          p: root.dataset.price || "",
        });
      }
      var ok = write(list);
      if (statusEl) statusEl.textContent = ok ? "" : root.dataset.labelError || "Couldn't save that on this browser.";
      refreshAll();
    });

    paint();
  }

  function initList(root) {
    if (window.GiftpinI18n) window.GiftpinI18n.apply(root);
    var listEl = root.querySelector("[data-giftpin-saved-list]");
    var emptyEl = root.querySelector("[data-giftpin-saved-empty]");
    if (!listEl) return;
    var base = (root.dataset.productBase || "/products/").replace(/\/?$/, "/");
    var removeLabel = root.dataset.labelRemove || "Remove";
    var addLabel = root.dataset.labelAdd || "Add to registry";

    function paint() {
      var list = read();
      listEl.textContent = "";
      if (emptyEl) emptyEl.hidden = list.length > 0;
      list.forEach(function (item) {
        var li = document.createElement("li");
        li.className = "giftpin-saved__item";

        var a = document.createElement("a");
        a.className = "giftpin-saved__link";
        a.href = base + encodeURIComponent(item.h);
        if (typeof item.i === "string" && /^https?:\/\//.test(item.i)) {
          var img = document.createElement("img");
          img.src = item.i;
          img.alt = "";
          img.loading = "lazy";
          img.width = 72;
          img.height = 72;
          a.appendChild(img);
        }
        var text = document.createElement("span");
        var title = document.createElement("span");
        title.className = "giftpin-saved__title";
        title.textContent = String(item.t || item.h);
        text.appendChild(title);
        if (item.p) {
          var price = document.createElement("span");
          price.className = "giftpin-saved__price";
          price.textContent = String(item.p);
          text.appendChild(price);
        }
        a.appendChild(text);
        li.appendChild(a);

        var actions = document.createElement("div");
        actions.className = "giftpin-saved__actions";
        // Opens the product page with the Add to registry flow already
        // started (see the giftpin_add handling at the end of giftpin.js).
        var addLink = document.createElement("a");
        addLink.className = "giftpin-saved__add";
        addLink.href = base + encodeURIComponent(item.h) + "?giftpin_add=1";
        addLink.textContent = addLabel;
        addLink.setAttribute("aria-label", addLabel + ": " + String(item.t || item.h));
        actions.appendChild(addLink);

        var rm = document.createElement("button");
        rm.type = "button";
        rm.className = "giftpin-saved__remove";
        rm.textContent = removeLabel;
        rm.setAttribute("aria-label", removeLabel + ": " + String(item.t || item.h));
        rm.addEventListener("click", function () {
          var current = read();
          var at = indexOf(current, item.h);
          if (at >= 0) current.splice(at, 1);
          write(current);
          refreshAll();
        });
        actions.appendChild(rm);
        li.appendChild(actions);
        listEl.appendChild(li);
      });
    }
    root.giftpinRefresh = paint;
    paint();
  }

  function boot() {
    var hearts = document.querySelectorAll("[data-giftpin-save-root]");
    for (var i = 0; i < hearts.length; i++) {
      if (hearts[i].getAttribute("data-giftpin-ready")) continue;
      hearts[i].setAttribute("data-giftpin-ready", "1");
      initHeart(hearts[i]);
    }
    var lists = document.querySelectorAll("[data-giftpin-saved-root]");
    for (var j = 0; j < lists.length; j++) {
      if (lists[j].getAttribute("data-giftpin-ready")) continue;
      lists[j].setAttribute("data-giftpin-ready", "1");
      initList(lists[j]);
    }
  }

  window.addEventListener("storage", function (event) {
    if (event.key === SAVED_KEY) refreshAll();
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
