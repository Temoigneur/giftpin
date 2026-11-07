import type { Messages } from "../en";
import { zhCNEmail } from "./email";
import { zhCNCommon } from "./common";
import { zhCNGuest } from "./guest";
import { zhCNCreate } from "./create";
import { zhCNServer } from "./server";
import { zhCNManage } from "./manage";
import { zhCNAdmin } from "./admin";

export const zhCN: Messages = {
  "noun.registry": "礼物清单",
  "noun.wishlist": "心愿单",
  ...zhCNEmail,
  ...zhCNCommon,
  ...zhCNGuest,
  ...zhCNCreate,
  ...zhCNServer,
  ...zhCNManage,
  ...zhCNAdmin,
};
