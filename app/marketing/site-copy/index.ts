import type { Locale } from "../../shared/i18n";
import { de } from "./de";
import { en, type SiteCopy } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { landingDe } from "./landing-de";
import { landingEn, type LandingCopy } from "./landing-en";
import { landingEs } from "./landing-es";
import { landingFr } from "./landing-fr";
import { landingPtBR } from "./landing-pt-BR";
import { ptBR } from "./pt-BR";

export type { Item, QA, SiteCopy } from "./en";
export type { LandingCopy } from "./landing-en";

/** The words on the home, features, pricing and FAQ pages, per language. */
export const SITE_COPY: Record<Locale, SiteCopy> = { en, fr, es, de, "pt-BR": ptBR };

/** The landing pages and the gift card directory, per language. */
export const LANDING_COPY: Record<Locale, LandingCopy> = { en: landingEn, fr: landingFr, es: landingEs, de: landingDe, "pt-BR": landingPtBR };

/** Replaces `{name}` placeholders. An unknown name is left as is, so a typo shows up in the page and in the test. */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
