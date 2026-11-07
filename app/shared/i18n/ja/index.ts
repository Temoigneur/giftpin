import type { Messages } from "../en";
import { jaEmail } from "./email";
import { jaCommon } from "./common";
import { jaGuest } from "./guest";
import { jaCreate } from "./create";
import { jaServer } from "./server";
import { jaManage } from "./manage";
import { jaAdmin } from "./admin";

export const ja: Messages = {
  "noun.registry": "ギフトリスト",
  "noun.wishlist": "ほしいものリスト",
  ...jaEmail,
  ...jaCommon,
  ...jaGuest,
  ...jaCreate,
  ...jaServer,
  ...jaManage,
  ...jaAdmin,
};
