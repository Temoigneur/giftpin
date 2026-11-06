import { enEmail } from "./email";
import { enCommon } from "./common";
import { enGuest } from "./guest";
import { enCreate } from "./create";
import { enServer } from "./server";
import { enManage } from "./manage";
import { enAdmin } from "./admin";

export const en = {
  "noun.registry": "registry",
  "noun.wishlist": "wish list",
  ...enEmail,
  ...enCommon,
  ...enGuest,
  ...enCreate,
  ...enServer,
  ...enManage,
  ...enAdmin,
} as const;

/** Every language file must supply exactly these keys (checked by tsc and a test). */
export type Messages = { [K in keyof typeof en]: string };
