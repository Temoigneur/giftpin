/**
 * localStorage key the manage page writes and the theme's "Add to registry"
 * button reads (extensions/registry-button/assets/giftpin.js, STORE_KEY) to
 * know which registries this browser owns. The theme file can't import this,
 * so app/proxy/render/__tests__/storage-key.test.ts checks they match.
 */
export const REGISTRIES_STORAGE_KEY = "giftpin.registries";

/** The pre-rename key. Read once and migrated by the manage page. */
export const LEGACY_REGISTRIES_STORAGE_KEY = "registro.registries";

/**
 * The signed "My registries" token (see mintAccountToken), saved when the
 * registrant opens their emailed My registries link so the manage page's
 * "My registries" link can go straight there next time on this browser.
 */
export const ACCOUNT_STORAGE_KEY = "giftpin.account";

/**
 * The shopper's "Save for later" list (the heart button), kept only in this
 * browser: a JSON array of {h: handle, t: title, i: image, p: price text}.
 * Written by extensions/registry-button/assets/giftpin-saved.js, which can't
 * import this; app/shared/__tests__/saved-items.test.ts checks they match.
 */
export const SAVED_ITEMS_STORAGE_KEY = "giftpin.saved";
