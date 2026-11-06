import type { Messages } from "../en";
import { ptBREmail } from "./email";
import { ptBRCommon } from "./common";
import { ptBRGuest } from "./guest";

export const ptBR: Messages = {
  "noun.registry": "lista de presentes",
  "noun.wishlist": "lista de desejos",
  ...ptBREmail,
  ...ptBRCommon,
  ...ptBRGuest,
};
