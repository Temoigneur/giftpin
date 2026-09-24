import { describe, it, expect } from "vitest";
import { csvCell, toCsv } from "../csv";

describe("csv", () => {
  it("quotes every cell and doubles quotes", () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell(3)).toBe('"3"');
    expect(csvCell(null)).toBe('""');
  });

  it("defuses spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("+1")).toBe("\"'+1\"");
    expect(csvCell("@sum")).toBe("\"'@sum\"");
  });

  it("starts with a BOM and uses CRLF", () => {
    expect(toCsv([["a", "b"], ["c", "d"]])).toBe('\uFEFF"a","b"\r\n"c","d"');
  });
});
