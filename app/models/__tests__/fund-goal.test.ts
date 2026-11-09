import { describe, expect, it } from "vitest";
import { parseFundGoal } from "../item.server";

describe("parseFundGoal", () => {
  it.each([
    ["1500", "1500.00"],
    ["1,500", "1500.00"],
    ["$1,500.50", "1500.50"],
    ["1.500,50", "1500.50"],
    ["1 500", "1500.00"],
    ["150000", "150000.00"],
    ["¥1,500,000", "1500000.00"],
    ["1.500", "1500.00"],
    ["250.5", "250.50"],
  ])("accepts %s", (raw, out) => expect(parseFundGoal(raw)).toBe(out));
  it.each(["", "abc", "0", "0.5", "-", null, undefined, "99999999"])("rejects %s", (raw) =>
    expect(parseFundGoal(raw)).toBeNull(),
  );
});
