import type { Messages } from "../en";
import { hiEmail } from "./email";
import { hiCommon } from "./common";
import { hiGuest } from "./guest";
import { hiCreate } from "./create";
import { hiServer } from "./server";
import { hiManage } from "./manage";
import { hiAdmin } from "./admin";

export const hi: Messages = {
  "noun.registry": "गिफ्ट रजिस्ट्री",
  "noun.wishlist": "विश लिस्ट",
  ...hiEmail,
  ...hiCommon,
  ...hiGuest,
  ...hiCreate,
  ...hiServer,
  ...hiManage,
  ...hiAdmin,
};
