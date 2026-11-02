import { describe, expect, it } from "vitest";
import { checkOpsAuth } from "../ops-auth.server";

const PASSWORD = "correct-horse-battery-staple";
const basic = (user: string, pass: string) => `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;

describe("checkOpsAuth", () => {
  it("is switched off (404) until a long OPS_PASSWORD is set", () => {
    expect(checkOpsAuth(basic("ben", ""), undefined)).toBe("disabled");
    expect(checkOpsAuth(basic("ben", "short"), "short")).toBe("disabled");
  });

  it("accepts the right password with any username", () => {
    expect(checkOpsAuth(basic("ben", PASSWORD), PASSWORD)).toBe("ok");
    expect(checkOpsAuth(basic("", PASSWORD), PASSWORD)).toBe("ok");
  });

  it("refuses a wrong, missing or malformed password", () => {
    expect(checkOpsAuth(basic("ben", PASSWORD + "x"), PASSWORD)).toBe("denied");
    expect(checkOpsAuth(null, PASSWORD)).toBe("denied");
    expect(checkOpsAuth("Bearer abc", PASSWORD)).toBe("denied");
    expect(checkOpsAuth(`Basic ${Buffer.from(PASSWORD).toString("base64")}`, PASSWORD)).toBe("denied");
  });
});
