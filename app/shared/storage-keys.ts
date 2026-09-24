/**
 * localStorage key the manage page writes and the theme's "Add to registry"
 * button reads (extensions/registry-button/assets/giftpin.js, STORE_KEY) to
 * know which registries this browser owns. The theme file can't import this,
 * so app/proxy/render/__tests__/storage-key.test.ts checks they match.
 */
export const REGISTRIES_STORAGE_KEY = "giftpin.registries";

/** The pre-rename key. Read once and migrated by the manage page. */
export const LEGACY_REGISTRIES_STORAGE_KEY = "registro.registries";
