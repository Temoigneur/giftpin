import type { Locale } from "../../shared/i18n";
import type { GuideCopy } from "./types";
import { en } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { de } from "./de";
import { ptBR } from "./pt-BR";
import { hi } from "./hi";
import { zhCN } from "./zh-CN";
import { zhTW } from "./zh-TW";
import { ja } from "./ja";

export const GUIDE_COPY: Record<Locale, GuideCopy> = { en, fr, es, de, "pt-BR": ptBR, hi, "zh-CN": zhCN, "zh-TW": zhTW, ja };
export type { GuideCopy, GuideDoc, Section, Step, Shot } from "./types";
