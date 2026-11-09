import { describe, expect, it } from "vitest";
import { currentLocale } from "../../shared/i18n";
import { overrideLocale, withLocale } from "../i18n.server";

describe("a visitor's ?lang", () => {
  it("lets a registry's language change the page by default", () => {
    withLocale("ja", () => { overrideLocale("fr"); expect(currentLocale()).toBe("fr"); });
  });
  it("is not overridden by the registry's own language when forced", () => {
    withLocale("en", () => { overrideLocale("fr"); expect(currentLocale()).toBe("en"); }, true);
  });
});
