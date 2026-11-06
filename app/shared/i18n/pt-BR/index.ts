import type { Messages } from "../en";
import { ptBREmail } from "./email";
import { ptBRCommon } from "./common";
import { ptBRGuest } from "./guest";
import { ptBRCreate } from "./create";
import { ptBRServer } from "./server";
import { ptBRManage } from "./manage";
import { ptBRAdmin } from "./admin";

export const ptBR: Messages = {
  "noun.registry": "lista de presentes",
  "noun.wishlist": "lista de desejos",
  ...ptBREmail,
  ...ptBRCommon,
  ...ptBRGuest,
  ...ptBRCreate,
  ...ptBRServer,
  ...ptBRManage,
  ...ptBRAdmin,
};
