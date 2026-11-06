import { enEmail } from "./email";

export const en = {
  "noun.registry": "registry",
  "noun.wishlist": "wish list",
  ...enEmail,
} as const;

/** Every language file must supply exactly these keys (checked by tsc and a test). */
export type Messages = { [K in keyof typeof en]: string };
