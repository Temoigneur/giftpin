import { describe, expect, it } from "vitest";
import { LOCALES } from "../../shared/i18n";
import { SITE_COPY } from "../site-copy";
import { loader as homeLoader } from "../../routes/_index";
import { loader as featuresLoader } from "../../routes/features";
import { loader as pricingLoader } from "../../routes/pricing";
import { loader as faqLoader } from "../../routes/faq";
import { PRO_PLAN_PRICE, PRO_TRIAL_DAYS } from "../../shared/plans";

const OTHERS = LOCALES.filter((l) => l !== "en");

/** Every string with its path, e.g. "faq.start.items.2.a". */
function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => leaves(x, `${path}.${i}`));
  return Object.entries(v as object).flatMap(([k, x]) => leaves(x, path ? `${path}.${k}` : k));
}
const marks = (s: string) => [...s.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort().join();
const tags = (s: string) => [...s.matchAll(/<[^>]+>/g)].map((m) => m[0]).join("");

const en = new Map(leaves(SITE_COPY.en));

describe("site copy translations", () => {
  for (const locale of OTHERS) {
    const other = new Map(leaves(SITE_COPY[locale]));

    it(`${locale} has exactly the English keys, list lengths included`, () => {
      expect([...other.keys()]).toEqual([...en.keys()]);
    });

    it(`${locale} keeps the {placeholders} and HTML tags of the English`, () => {
      for (const [path, text] of en) {
        const t = other.get(path)!;
        expect(marks(t), `${locale} ${path}`).toBe(marks(text));
        expect(tags(t), `${locale} ${path}`).toBe(tags(text));
        // Empty only where English is empty (the email support line has no detail).
        expect(t === "", `${locale} ${path} empty`).toBe(text === "");
      }
    });

    it(`${locale} does not hard-code a price, trial length or fee`, () => {
      for (const [path, t] of other) {
        expect(t, `${locale} ${path}`).not.toContain(String(PRO_PLAN_PRICE));
        expect(t, `${locale} ${path}`).not.toMatch(new RegExp(`\\b${PRO_TRIAL_DAYS}\\b`));
      }
    });
  }
});

describe("translated pages", () => {
  const pages: [string, (a: never) => Response | Promise<Response>][] = [
    ["/", homeLoader as never],
    ["/features", featuresLoader as never],
    ["/pricing", pricingLoader as never],
    ["/faq", faqLoader as never],
  ];
  for (const [path, loader] of pages) {
    for (const locale of OTHERS) {
      it(`${path} renders in ${locale} with no leftover placeholders and the real price`, async () => {
        const request = new Request(`https://giftpin.app${path}?lang=${locale}`);
        const html = await (await loader({ request, params: {}, context: {} } as never)).text();
        expect(html).toContain(`<html lang="${locale}">`);
        expect(html).toContain(`<link rel="canonical" href="https://giftpin.app${path}?lang=${locale}">`);
        expect(html).not.toMatch(/\{(pro|price|trial|days|fee|slots|n|appStore)\}/);
        expect(html).not.toContain("undefined");
        if (path === "/pricing") expect(html).toContain(`$${PRO_PLAN_PRICE.toFixed(2)}`);
        // The English page must not leak into the translation.
        expect(html).not.toContain("Everything a registry needs");
      });
    }
  }
});
