# Giftpin for iPhone and Android

The Chrome extension's "add this page to my registry", reached from the
phone's **Share** menu. Built, not released: nothing in Giftpin links to it
yet, and the Shopify app works the same without it.

## How it works

1. The registrant connects once by pasting (or sharing) their private manage
   link, the same link the Chrome extension uses.
2. On any product page, in Safari, Chrome or a store's app, they tap
   **Share → Giftpin**.
3. The app opens the page in a hidden browser on the phone and runs the
   Chrome extension's own page reader (`extractProductMetadata()` from
   `browser-extension/popup.js`) to get the photo, name and price. Reading
   on the phone is what gets past stores that block our server's lookups.
4. They check the preview, type the price if we couldn't find one, and add
   it. The request goes to the same `ext-add` endpoint as the extension, so
   there are no server changes.

The page reader is copied from the extension at build time into
`src/extract.generated.ts`. After changing `popup.js`, run
`npm run sync-extractor` here. `scripts/__tests__/mobile-extractor.test.ts`
at the repo root fails if the two copies differ.

## Not yet verified live

- Nothing has run on a real phone yet. The code typechecks and
  `expo prebuild` generates both the iOS share extension and the Android
  share filter, but that's all.
- The hidden browser asks for the desktop version of each page, so the
  extension's Amazon, Target and Wayfair fallbacks see the markup they were
  checked against. Whether each site serves that version to a phone hasn't
  been checked.
- A storefront password (like the dev store's) blocks the app from
  connecting, because the app doesn't have the browser's password cookie.
  Turn the password off while testing.

## Test on an Android phone (free)

1. Create a free account at expo.dev.
2. On your PC, in this folder:
   ```
   npm install
   npx eas-cli login
   npx eas-cli build --profile preview --platform android
   ```
3. When the build finishes, open the link it prints on your Android phone
   and install the APK. Android will ask you to allow installs from your
   browser.

## Release (when you're ready to pay)

1. Join the Apple Developer Program ($99 a year) and create a Google Play
   developer account ($25 once).
2. Build both:
   ```
   npx eas-cli build --profile production --platform all
   ```
   EAS builds the iPhone app in the cloud, so no Mac is needed. It will ask
   you to sign in to Apple the first time.
3. Submit both:
   ```
   npx eas-cli submit --platform ios
   npx eas-cli submit --platform android
   ```
4. Fill in both store listings. Both need a privacy policy URL:
   https://giftpin.app/privacy works.
5. Once both are approved, add the store links to the registry manage page
   and the marketing site.
