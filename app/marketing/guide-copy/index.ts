import type { Locale } from "../../shared/i18n";
import type { GuideCopy, RawGuideCopy } from "./types";
import { EXTRA } from "./extra";
import { derive } from "./derive";
import { en } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { de } from "./de";
import { ptBR } from "./pt-BR";
import { hi } from "./hi";
import { zhCN } from "./zh-CN";
import { zhTW } from "./zh-TW";
import { ja } from "./ja";

const RAW: Record<Locale, RawGuideCopy> = { en, fr, es, de, "pt-BR": ptBR, hi, "zh-CN": zhCN, "zh-TW": zhTW, ja };

export const GUIDE_COPY = Object.fromEntries(
  (Object.keys(RAW) as Locale[]).map((l) => [l, derive(RAW[l], EXTRA[l], l)]),
) as Record<Locale, GuideCopy>;
export type { GuideCopy, GuideDoc, Section, Step, Shot } from "./types";
