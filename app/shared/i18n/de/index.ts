import type { Messages } from "../en";
import { deEmail } from "./email";
import { deCommon } from "./common";
import { deGuest } from "./guest";
import { deCreate } from "./create";

export const de: Messages = {
  "noun.registry": "Geschenkeliste",
  "noun.wishlist": "Wunschliste",
  ...deEmail,
  ...deCommon,
  ...deGuest,
  ...deCreate,
};
