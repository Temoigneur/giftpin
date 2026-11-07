import type { Messages } from "../en";
import { zhTWEmail } from "./email";
import { zhTWCommon } from "./common";
import { zhTWGuest } from "./guest";
import { zhTWCreate } from "./create";
import { zhTWServer } from "./server";
import { zhTWManage } from "./manage";
import { zhTWAdmin } from "./admin";

export const zhTW: Messages = {
  "noun.registry": "禮物清單",
  "noun.wishlist": "願望清單",
  ...zhTWEmail,
  ...zhTWCommon,
  ...zhTWGuest,
  ...zhTWCreate,
  ...zhTWServer,
  ...zhTWManage,
  ...zhTWAdmin,
};
