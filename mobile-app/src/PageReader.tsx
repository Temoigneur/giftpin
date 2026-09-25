/**
 * Reads a product page on the phone itself, like the Chrome extension does on
 * a computer. The page loads in an invisible WebView and we run the
 * extension's own extractProductMetadata() in it, so sites that block our
 * server (Amazon, Williams-Sonoma, ...) still give us their photo and price.
 *
 * It asks for the desktop version of the page, because that's the markup the
 * extension's site-specific fallbacks were checked against.
 */
import { useRef } from "react";
import { View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { EXTRACT_PRODUCT_METADATA_SOURCE } from "./extract.generated";
import type { Product } from "./api";

const DESKTOP_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

// Prices are often rendered by the page's own scripts after load, so try a
// few times before settling for what we have.
const ATTEMPTS = 4;
const RETRY_MS = 1500;

const RUN_EXTRACTOR = `(function () {
  try {
    var result = (${EXTRACT_PRODUCT_METADATA_SOURCE})();
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
  } catch (e) {
    window.ReactNativeWebView.postMessage("null");
  }
})();
true;`;

type Extracted = Partial<Product> | null;

export function PageReader({ url, onResult }: { url: string; onResult: (product: Extracted) => void }) {
  const webView = useRef<WebView>(null);
  const attempts = useRef(0);
  const best = useRef<Extracted>(null);
  const done = useRef(false);

  function finish(product: Extracted) {
    if (done.current) return;
    done.current = true;
    onResult(product);
  }

  function run() {
    if (done.current) return;
    attempts.current += 1;
    webView.current?.injectJavaScript(RUN_EXTRACTOR);
  }

  function onMessage(event: WebViewMessageEvent) {
    let data: Extracted = null;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      data = null;
    }
    if (data?.title && (!best.current || data.price || data.imageUrl)) best.current = data;
    if ((data?.title && data.price && data.imageUrl) || attempts.current >= ATTEMPTS) {
      finish(best.current);
    } else {
      setTimeout(run, RETRY_MS);
    }
  }

  return (
    <View style={{ width: 1, height: 1, opacity: 0, position: "absolute" }} pointerEvents="none">
      <WebView
        ref={webView}
        source={{ uri: url }}
        userAgent={DESKTOP_USER_AGENT}
        onLoadEnd={() => {
          if (attempts.current === 0) setTimeout(run, 500);
        }}
        onError={() => finish(null)}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
      />
    </View>
  );
}
