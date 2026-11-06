import type { Messages } from "../en";
import { esEmail } from "./email";
import { esCommon } from "./common";
import { esGuest } from "./guest";
import { esCreate } from "./create";
import { esServer } from "./server";
import { esManage } from "./manage";

export const es: Messages = {
  "noun.registry": "lista de regalos",
  "noun.wishlist": "lista de deseos",
  ...esEmail,
  ...esCommon,
  ...esGuest,
  ...esCreate,
  ...esServer,
  ...esManage,
};
