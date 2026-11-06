import type { Locale } from "../../shared/i18n";
import type { GuideCopy } from "./types";
import { en } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { de } from "./de";
import { ptBR } from "./pt-BR";

export const GUIDE_COPY: Record<Locale, GuideCopy> = { en, fr, es, de, "pt-BR": ptBR };
export type { GuideCopy, GuideDoc, Section, Step, Shot } from "./types";
