/**
 * Talks to app/routes/api.pos.tsx. POS extensions run on the device, so calls
 * go to the app's public URL with the POS session token as a Bearer header;
 * authenticate.pos on the server checks it and works out the shop.
 *
 * Must match application_url in shopify.app.toml.
 */
const APP_URL = 'https://giftpin-app-production.up.railway.app';

export interface RegistrySummary {
  id: string;
  title: string;
  names: string;
  eventType: string;
  eventDate: string | null;
  itemsLeft: number;
}

export interface RegistryItem {
  id: string;
  title: string;
  price: number;
  currency: string | null;
  desiredQty: number;
  claimedQty: number;
  remainingQty: number;
  sellable: boolean;
  variantId: number | null;
  externalDomain: string | null;
}

export interface RegistryDetail {
  id: string;
  title: string;
  names: string;
  eventDate: string | null;
  items: RegistryItem[];
}

export type ApiResult<T> = ({ok: true} & T) | {ok: false; locked?: boolean; error: string};

async function call<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const token = await shopify.session.getSessionToken();
  if (!token) return {ok: false, error: "This staff account can't use Giftpin."};
  try {
    const response = await fetch(`${APP_URL}/api/pos${path}`, {
      ...init,
      headers: {
        ...(init.body ? {'Content-Type': 'application/json'} : {}),
        Authorization: `Bearer ${token}`,
      },
    });
    return (await response.json()) as ApiResult<T>;
  } catch {
    return {ok: false, error: "Couldn't reach Giftpin. Check the connection and try again."};
  }
}

export const searchRegistries = (q: string) =>
  call<{results: RegistrySummary[]}>(`?q=${encodeURIComponent(q)}`);

export const getRegistry = (id: string) =>
  call<{registry: RegistryDetail}>(`?id=${encodeURIComponent(id)}`);

export const lineFor = (itemId: string) =>
  call<{variantId: number; properties: Record<string, string>}>('', {
    method: 'POST',
    body: JSON.stringify({intent: 'line', itemId}),
  });

export const createRegistry = (input: Record<string, string>) =>
  call<{registryId: string; title: string}>('', {
    method: 'POST',
    body: JSON.stringify({intent: 'create', ...input}),
  });
