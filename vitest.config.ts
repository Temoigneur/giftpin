import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["app/**/*.test.ts", "scripts/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      // Deterministic keys so token assertions are reproducible. Real keys come
      // from the environment; crypto.server.ts falls back to these only when
      // NODE_ENV === "test".
      ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
      SIGNING_KEY: Buffer.alloc(32, 9).toString("base64"),
    },
  },
});
