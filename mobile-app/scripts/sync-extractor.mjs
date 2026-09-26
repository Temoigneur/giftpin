import { writeFileSync } from "node:fs";
import { GENERATED_TS, generatedModule } from "./extractor-source.mjs";

writeFileSync(GENERATED_TS, generatedModule());
console.log("Wrote", GENERATED_TS);
