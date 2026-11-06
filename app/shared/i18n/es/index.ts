import type { Messages } from "../en";
import { esEmail } from "./email";
import { esCommon } from "./common";
import { esGuest } from "./guest";

export const es: Messages = {
  "noun.registry": "lista de regalos",
  "noun.wishlist": "lista de deseos",
  ...esEmail,
  ...esCommon,
  ...esGuest,
};
