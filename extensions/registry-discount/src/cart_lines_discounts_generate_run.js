// The function itself lives in registry_discount.ts (plain TypeScript, no
// imports) so the app's tests can run it directly. This file is the entry
// Shopify's build looks for.
export { cartLinesDiscountsGenerateRun } from './registry_discount.ts';
