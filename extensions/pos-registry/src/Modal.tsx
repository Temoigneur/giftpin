import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';
import {
  createRegistry,
  getRegistry,
  lineFor,
  searchRegistries,
  type RegistryDetail,
  type RegistryItem,
  type RegistrySummary,
} from './api';

export default async () => {
  render(<Extension />, document.body);
};

type Screen = {name: 'search'} | {name: 'registry'; id: string} | {name: 'create'};

function Extension() {
  const [screen, setScreen] = useState<Screen>({name: 'search'});
  const [locked, setLocked] = useState(false);

  if (locked) {
    return (
      <s-page heading="Gift registry">
        <s-scroll-box>
          <s-box padding="base">
            <s-banner heading="In-store registry mode is part of Giftpin Pro" tone="info">
              <s-text>Ask the store owner to upgrade from the Giftpin app in Shopify admin.</s-text>
            </s-banner>
          </s-box>
        </s-scroll-box>
      </s-page>
    );
  }

  if (screen.name === 'registry') {
    return <RegistryScreen id={screen.id} onBack={() => setScreen({name: 'search'})} />;
  }
  if (screen.name === 'create') {
    return (
      <CreateScreen
        onBack={() => setScreen({name: 'search'})}
        onCreated={(id) => setScreen({name: 'registry', id})}
      />
    );
  }
  return (
    <SearchScreen
      onOpen={(id) => setScreen({name: 'registry', id})}
      onCreate={() => setScreen({name: 'create'})}
      onLocked={() => setLocked(true)}
    />
  );
}

function SearchScreen({
  onOpen,
  onCreate,
  onLocked,
}: {
  onOpen: (id: string) => void;
  onCreate: () => void;
  onLocked: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RegistrySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounced search as the staff member types.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const result = await searchRegistries(q);
      if (cancelled) return;
      setLoading(false);
      if (result.ok) {
        setResults(result.results);
        setError(null);
      } else if (result.locked) {
        onLocked();
      } else {
        setError(result.error);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, onLocked]);

  return (
    <s-page heading="Gift registry">
      <s-scroll-box>
        <s-box padding="base">
          <s-stack direction="block" gap="base">
            <s-search-field
              placeholder="Name, email or registry link"
              value={query}
              onInput={(event) => setQuery(event.currentTarget.value ?? '')}
            />
            {error && <s-banner tone="critical" heading={error} />}
            {loading && <s-spinner />}
            {results && results.length === 0 && !loading && (
              <s-text color="subdued">No registries match.</s-text>
            )}
            {results?.map((registry) => (
              <s-clickable key={registry.id} onClick={() => onOpen(registry.id)}>
                <s-section heading={registry.title}>
                  <s-stack direction="block" gap="small">
                    <s-text>{registry.names}</s-text>
                    <s-text color="subdued">
                      {registry.eventDate ? `${registry.eventDate} · ` : ''}
                      {registry.itemsLeft} {registry.itemsLeft === 1 ? 'item' : 'items'} still wanted
                    </s-text>
                  </s-stack>
                </s-section>
              </s-clickable>
            ))}
            <s-button variant="secondary" onClick={onCreate}>
              Start a registry for a customer
            </s-button>
          </s-stack>
        </s-box>
      </s-scroll-box>
    </s-page>
  );
}

function RegistryScreen({id, onBack}: {id: string; onBack: () => void}) {
  const [registry, setRegistry] = useState<RegistryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    getRegistry(id).then((result) => {
      if (result.ok) setRegistry(result.registry);
      else setError(result.error);
    });
  }, [id]);

  async function addToCart(item: RegistryItem) {
    setAdding(item.id);
    try {
      // The server mints the signed `_rg` attribution token, the same one the
      // online store puts on a cart line, so the sale counts toward this
      // registry when the order webhook arrives.
      const line = await lineFor(item.id);
      if (!line.ok) {
        shopify.toast.show(line.error);
        return;
      }
      const uuid = await shopify.cart.addLineItem(line.variantId, 1);
      await shopify.cart.addLineItemProperties(uuid, line.properties);
      shopify.toast.show(`Added ${item.title} for ${registry?.names ?? 'the registry'}`);
    } catch {
      shopify.toast.show("Couldn't add that item to the cart.");
    } finally {
      setAdding(null);
    }
  }

  return (
    <s-page heading={registry?.title ?? 'Gift registry'}>
      <s-scroll-box>
        <s-box padding="base">
          <s-stack direction="block" gap="base">
            <s-button variant="secondary" onClick={onBack}>
              Back to search
            </s-button>
            {error && <s-banner tone="critical" heading={error} />}
            {!registry && !error && <s-spinner />}
            {registry && (
              <s-text color="subdued">
                {registry.names}
                {registry.eventDate ? ` · ${registry.eventDate}` : ''}
              </s-text>
            )}
            {registry?.items.length === 0 && <s-text>Nothing on this registry yet.</s-text>}
            {registry?.items.map((item) => (
              <s-section key={item.id} heading={item.title}>
                <s-stack direction="block" gap="small">
                  <s-text>{money(item.price, item.currency)}</s-text>
                  <s-text color="subdued">{status(item)}</s-text>
                  {item.sellable && (
                    <s-button
                      variant="primary"
                      disabled={adding !== null}
                      onClick={() => addToCart(item)}
                    >
                      {adding === item.id ? 'Adding…' : 'Add to cart'}
                    </s-button>
                  )}
                </s-stack>
              </s-section>
            ))}
          </s-stack>
        </s-box>
      </s-scroll-box>
    </s-page>
  );
}

function status(item: RegistryItem): string {
  if (item.remainingQty > 0) {
    const where = item.externalDomain ? ` · from ${item.externalDomain}` : '';
    return `${item.remainingQty} of ${item.desiredQty} still wanted${where}`;
  }
  // A live hold counts as taken: better to say "maybe" than sell a duplicate.
  return item.claimedQty > 0 ? 'Someone may be buying this' : 'Already bought';
}

function money(amount: number, currency: string | null): string {
  if (!currency) return amount.toFixed(2);
  try {
    return new Intl.NumberFormat(undefined, {style: 'currency', currency}).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

const OCCASIONS = [
  {value: 'wedding', label: 'Wedding'},
  {value: 'baby', label: 'Baby shower'},
  {value: 'birthday', label: 'Birthday'},
  {value: 'housewarming', label: 'Housewarming'},
  {value: 'graduation', label: 'Graduation'},
  {value: 'anniversary', label: 'Anniversary'},
  {value: 'other', label: 'Something else'},
];

function CreateScreen({onBack, onCreated}: {onBack: () => void; onCreated: (id: string) => void}) {
  const [values, setValues] = useState<Record<string, string>>({eventType: 'wedding'});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (key: string) => (event: {currentTarget: {value?: string}}) =>
    setValues((current) => ({...current, [key]: event.currentTarget.value ?? ''}));

  async function submit() {
    setSaving(true);
    const result = await createRegistry(values);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    shopify.toast.show(`${result.title} created. The link is on its way by email.`);
    onCreated(result.registryId);
  }

  return (
    <s-page heading="Start a registry">
      <s-scroll-box>
        <s-box padding="base">
          <s-stack direction="block" gap="base">
            <s-button variant="secondary" onClick={onBack}>
              Back to search
            </s-button>
            {error && <s-banner tone="critical" heading={error} />}
            <s-text-field label="Customer's name" value={values.registrantName ?? ''} onInput={set('registrantName')} />
            <s-email-field label="Customer's email" value={values.registrantEmail ?? ''} onInput={set('registrantEmail')} />
            <s-text-field label="Registry name" placeholder="Sam & Alex's wedding" value={values.title ?? ''} onInput={set('title')} />
            <s-text>Occasion</s-text>
            <s-choice-list
              values={[values.eventType]}
              onChange={(event) => {
                const [selected] = event.currentTarget.values ?? [];
                if (selected) setValues((current) => ({...current, eventType: selected}));
              }}
            >
              {OCCASIONS.map((o) => (
                <s-choice key={o.value} value={o.value}>
                  {o.label}
                </s-choice>
              ))}
            </s-choice-list>
            <s-date-field label="Event date" value={values.eventDate ?? ''} onChange={set('eventDate')} />
            <s-text color="subdued">We email the customer their private link to add items and share the registry.</s-text>
            <s-button variant="primary" disabled={saving} onClick={submit}>
              {saving ? 'Creating…' : 'Create registry'}
            </s-button>
          </s-stack>
        </s-box>
      </s-scroll-box>
    </s-page>
  );
}
