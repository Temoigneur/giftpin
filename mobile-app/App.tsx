/**
 * Giftpin for phones: the Chrome extension's "add this page to my registry",
 * reached from the phone's Share menu instead of a toolbar button.
 *
 * Flow: connect once with the private manage link, then share any product
 * page (Safari, Chrome, the Amazon app, ...) to Giftpin. We read the page on
 * the phone (see src/PageReader.tsx), show a preview, and add it through the
 * same endpoint the extension uses.
 */
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ShareIntentProvider, useShareIntentContext } from "expo-share-intent";
import {
  clearConnection,
  loadConnection,
  looksLikeShareLink,
  parseManageLink,
  saveConnection,
  verify,
  type Connection,
} from "./src/connection";
import { addItem, confirmQty, type Product } from "./src/api";
import { PageReader } from "./src/PageReader";

const COLORS = {
  navy: "#16264C",
  text: "#1D2433",
  subdued: "#5B6475",
  pale: "#EAF4FC",
  border: "#C9D7E6",
  accent: "#2F6FDB",
  error: "#B42318",
  success: "#1E7A46",
  white: "#FFFFFF",
};

// Give up waiting for a slow page and let the person fill in the rest.
const READ_TIMEOUT_MS = 25000;

export default function App() {
  return (
    <ShareIntentProvider>
      <SafeAreaProvider>
        <Main />
      </SafeAreaProvider>
    </ShareIntentProvider>
  );
}

function firstUrl(text: string | null | undefined): string | null {
  const match = text?.match(/https?:\/\/\S+/);
  return match ? match[0] : null;
}

function Main() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const [conn, setConn] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [sharedTitle, setSharedTitle] = useState<string | null>(null);

  useEffect(() => {
    loadConnection().then((saved) => {
      setConn(saved);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!hasShareIntent) return;
    const url = shareIntent.webUrl || firstUrl(shareIntent.text);
    setSharedUrl(url);
    setSharedTitle(shareIntent.meta?.title ?? null);
    resetShareIntent();
  }, [hasShareIntent, shareIntent, resetShareIntent]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={COLORS.navy} />
      </Screen>
    );
  }

  // Sharing the manage link itself to the app connects it.
  const sharedManageLink = sharedUrl && parseManageLink(sharedUrl) ? sharedUrl : null;

  if (!conn || sharedManageLink) {
    return (
      <ConnectScreen
        initialLink={sharedManageLink ?? ""}
        onConnected={(next) => {
          setConn(next);
          if (sharedManageLink) setSharedUrl(null);
        }}
      />
    );
  }

  if (sharedUrl) {
    return (
      <AddScreen
        key={sharedUrl}
        conn={conn}
        url={sharedUrl}
        sharedTitle={sharedTitle}
        onDone={() => setSharedUrl(null)}
      />
    );
  }

  return (
    <HomeScreen
      conn={conn}
      onDisconnect={() => clearConnection().then(() => setConn(null))}
      onPasteLink={(url) => {
        setSharedTitle(null);
        setSharedUrl(url);
      }}
    />
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Button({
  label,
  onPress,
  disabled,
  secondary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

function Status({ message, error }: { message: string; error?: boolean }) {
  if (!message) return null;
  return <Text style={[styles.status, error ? { color: COLORS.error } : { color: COLORS.success }]}>{message}</Text>;
}

function ConnectScreen({ initialLink, onConnected }: { initialLink: string; onConnected: (conn: Connection) => void }) {
  const [link, setLink] = useState(initialLink);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const autoTried = useRef(false);

  async function connect(raw: string) {
    const parsed = parseManageLink(raw);
    if (!parsed) {
      setError(
        looksLikeShareLink(raw)
          ? "That's your guest share link. Paste your private manage link instead: open your registry's manage page and use “Copy link”."
          : "That doesn't look like a manage link. Paste the private manage link (it contains ?t=) from your registry's manage page or email.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const next = await verify(parsed);
      await saveConnection(next);
      onConnected(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't connect.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initialLink && !autoTried.current) {
      autoTried.current = true;
      void connect(initialLink);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLink]);

  return (
    <Screen>
      <Text style={styles.heading}>Connect your registry</Text>
      <Text style={styles.paragraph}>
        Paste the private manage link for your registry. You&apos;ll find it on your registry&apos;s manage page
        (&ldquo;Copy link&rdquo;) or in the email you got when you created it. You only do this once.
      </Text>
      <TextInput
        style={styles.input}
        value={link}
        onChangeText={setLink}
        placeholder="https://yourstore.com/apps/registry/manage?t=..."
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <Button label={busy ? "Connecting…" : "Connect"} onPress={() => connect(link)} disabled={busy || !link} />
      <Status message={error} error />
    </Screen>
  );
}

function HomeScreen({
  conn,
  onDisconnect,
  onPasteLink,
}: {
  conn: Connection;
  onDisconnect: () => void;
  onPasteLink: (url: string) => void;
}) {
  const [link, setLink] = useState("");
  return (
    <Screen>
      <Text style={styles.eyebrow}>Connected to</Text>
      <Text style={styles.heading}>{conn.title}</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Add a gift from any store</Text>
        <Text style={styles.paragraph}>
          1. Open the product in Safari, Chrome or a store&apos;s app.{"\n"}
          2. Tap Share.{"\n"}
          3. Choose Giftpin. You may need to tap More the first time.
        </Text>
        <Text style={styles.subdued}>We&apos;ll grab the photo, name and price for you.</Text>
      </View>

      <Text style={styles.label}>Or paste a product link</Text>
      <TextInput
        style={styles.input}
        value={link}
        onChangeText={setLink}
        placeholder="https://..."
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <Button label="Look it up" onPress={() => firstUrl(link) && onPasteLink(firstUrl(link)!)} disabled={!firstUrl(link)} secondary />

      <Pressable onPress={onDisconnect} style={{ marginTop: 32 }}>
        <Text style={styles.link}>Use a different registry</Text>
      </Pressable>
    </Screen>
  );
}

function AddScreen({
  conn,
  url,
  sharedTitle,
  onDone,
}: {
  conn: Connection;
  url: string;
  sharedTitle: string | null;
  onDone: () => void;
}) {
  const [reading, setReading] = useState(true);
  const [title, setTitle] = useState(sharedTitle ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState(url);
  const [qty, setQty] = useState("1");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ message: string; error?: boolean }>({ message: "" });
  const [dup, setDup] = useState<{ itemId: string; qty: string } | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReading(false), READ_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  function onResult(product: Partial<Product> | null) {
    if (product?.title) setTitle(product.title);
    if (product?.imageUrl) setImageUrl(product.imageUrl);
    if (product?.price) setPrice(product.price);
    if (product?.currency) setCurrency(product.currency);
    // Keep the URL the page ended up on (short links like a.co redirect).
    if (product?.url) setPageUrl(product.url);
    setReading(false);
  }

  const priceOk = /^\d+(\.\d{1,2})?$/.test(price.trim());

  async function add() {
    setBusy(true);
    setStatus({ message: "Adding…" });
    const result = await addItem(
      conn,
      { title: title.trim(), url: pageUrl, imageUrl, price: price.trim(), currency },
      Math.max(1, Number(qty) || 1),
    );
    setBusy(false);
    if (result.kind === "duplicate") {
      setDup({ itemId: result.itemId, qty: String(result.currentQty + 1) });
      setStatus({ message: `Already on your registry: you want ${result.currentQty}. How many in total?` });
    } else if (result.kind === "added") {
      setAdded(true);
      setStatus({ message: "Added to your registry" });
    } else {
      setStatus({ message: result.message, error: true });
    }
  }

  async function confirm() {
    if (!dup) return;
    setBusy(true);
    const result = await confirmQty(conn, dup.itemId, Math.max(1, Number(dup.qty) || 1));
    setBusy(false);
    if (result.kind === "added") {
      setDup(null);
      setAdded(true);
      setStatus({ message: "Registry updated" });
    } else if (result.kind === "error") {
      setStatus({ message: result.message, error: true });
    }
  }

  return (
    <Screen>
      {reading && <PageReader url={url} onResult={onResult} />}
      <Text style={styles.eyebrow}>Adding to {conn.title}</Text>

      {reading ? (
        <View style={styles.reading}>
          <ActivityIndicator color={COLORS.navy} />
          <Text style={styles.subdued}>Reading the product page&hellip;</Text>
        </View>
      ) : (
        <>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <Text style={styles.subdued}>No photo found</Text>
            </View>
          )}

          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} multiline />

          <Text style={styles.label}>Price{currency ? ` (${currency})` : ""}</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
          {!priceOk && price.trim() !== "" && <Status message="Enter the price as a number, like 24.99" error />}
          {price.trim() === "" && <Text style={styles.subdued}>We couldn&apos;t find the price. Please type it in.</Text>}

          {!added && !dup && (
            <>
              <Text style={styles.label}>How many?</Text>
              <TextInput style={[styles.input, { width: 90 }]} value={qty} onChangeText={setQty} keyboardType="number-pad" />
              <Button
                label="Add to registry"
                onPress={add}
                disabled={busy || !title.trim() || !priceOk}
              />
            </>
          )}

          {dup && (
            <>
              <TextInput
                style={[styles.input, { width: 90 }]}
                value={dup.qty}
                onChangeText={(value) => setDup({ ...dup, qty: value })}
                keyboardType="number-pad"
              />
              <Button label="Update total" onPress={confirm} disabled={busy} />
              <Button
                label="Keep as is"
                secondary
                onPress={() => {
                  setDup(null);
                  setStatus({ message: "" });
                }}
              />
            </>
          )}

          <Status message={status.message} error={status.error} />
        </>
      )}

      <Pressable onPress={onDone} style={{ marginTop: 24 }}>
        <Text style={styles.link}>{added ? "Done" : "Cancel"}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pale },
  screen: { padding: 20, gap: 10 },
  eyebrow: { color: COLORS.subdued, fontSize: 14, marginTop: 8 },
  heading: { color: COLORS.navy, fontSize: 26, fontWeight: "700", marginBottom: 6 },
  paragraph: { color: COLORS.text, fontSize: 16, lineHeight: 23 },
  subdued: { color: COLORS.subdued, fontSize: 14, lineHeight: 20 },
  label: { color: COLORS.navy, fontSize: 15, fontWeight: "600", marginTop: 10 },
  input: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.navy,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonSecondary: { backgroundColor: COLORS.white, borderColor: COLORS.navy, borderWidth: 1 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
  buttonTextSecondary: { color: COLORS.navy },
  status: { fontSize: 15, marginTop: 6 },
  link: { color: COLORS.accent, fontSize: 16, textAlign: "center" },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderColor: COLORS.border,
    borderWidth: 1,
    marginVertical: 10,
  },
  cardHeading: { color: COLORS.navy, fontSize: 18, fontWeight: "700" },
  reading: { alignItems: "center", gap: 12, paddingVertical: 60 },
  image: { width: "100%", height: 240, borderRadius: 12, backgroundColor: COLORS.white },
  noImage: { alignItems: "center", justifyContent: "center", borderColor: COLORS.border, borderWidth: 1 },
});
