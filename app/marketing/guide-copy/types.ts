/**
 * The words on the setup guide (/setup) and the registry guide
 * (/registry-guide), one file per language.
 *
 * Labels the app itself shows are NOT typed out here: write `{{admin.set.save}}`
 * (any key from app/shared/i18n) and the guide fills in that label in the
 * reader's language. That keeps the bold button names identical to the screen,
 * including every translation, and a test fails if a key stops existing.
 * Names Shopify itself shows (Online Store, Add block, ...) are plain text.
 *
 * Pure data, no server imports (CLAUDE.md hard rule 2).
 */

export type Shot = { src: string; alt: string };

export type Step = {
  title: string;
  /** Trusted literals: inline <b> for UI labels, {{key}} for app labels. */
  items: string[];
  /** English only. Other languages take the images from English by position and supply `alts`. */
  img?: Shot | Shot[];
  /** Other languages: one alt text per English image, in order. */
  alts?: string[];
  id?: string;
};

export type Section = { title: string; lede?: string; tint?: boolean; steps: Step[] };

export type GuideDoc = {
  eyebrow: string;
  /** May contain <br> and <span class="grad-text">. */
  h1: string;
  lede: string;
  metaTitle: string;
  description: string;
  sections: Section[];
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export type GuideCopy = {
  /** Words around the guides themselves. */
  ui: {
    language: string;
    /** Shown under the hero in languages other than English. */
    shotsNote: string;
    /** Shown on the setup guide: Shopify's own screen names. */
    shopifyNote: string;
    finalCta: string;
  };
  /** Merchant guides: setup (with the hub), customize, Pro. */
  setup: GuideDoc;
  customize: GuideDoc;
  pro: GuideDoc;
  /** For registrants and for guests. */
  registry: GuideDoc;
  guest: GuideDoc;
};

/** What each language file holds; derive.ts splits it into the guides above. */
export type RawGuideCopy = Omit<GuideCopy, "customize" | "pro" | "guest">;
