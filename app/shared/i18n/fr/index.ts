import type { Messages } from "../en";
import { frEmail } from "./email";
import { frCommon } from "./common";
import { frGuest } from "./guest";
import { frCreate } from "./create";

export const fr: Messages = {
  "noun.registry": "liste de cadeaux",
  "noun.wishlist": "liste de souhaits",
  ...frEmail,
  ...frCommon,
  ...frGuest,
  ...frCreate,
};
