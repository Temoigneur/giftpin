/**
 * How long a guest can undo their own "I bought this". Shared because the
 * server signs the token for this long and the guest page stops offering the
 * button at the same moment.
 */
export const UNDO_WINDOW_SECONDS = 24 * 3600;

/** localStorage key on the guest page holding this browser's undo tokens. */
export const UNDO_STORAGE_KEY = "giftpin:undo";
