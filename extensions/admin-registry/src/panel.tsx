import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';

interface Registry {
  id: string;
  title: string;
  names: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  publicUrl: string;
}

interface Gift {
  itemTitle: string;
  qty: number;
  amount: number | null;
  currency: string | null;
  isContribution: boolean;
  shippedToRegistrant: boolean;
  voided: boolean;
  orderName: string | null;
}

interface Group {
  registry: Registry;
  gifts: Gift[];
}

interface ProductRow {
  registry: Registry;
  wanted: number;
  bought: number;
}

type Result = {
  ok: boolean;
  error?: string;
  registries?: Group[] | ProductRow[];
  owned?: Registry[];
  gifts?: Group[];
  total?: number;
};

export type Kind = 'order' | 'customer' | 'product';

/** Relative fetch() goes to application_url with an ID token added by Shopify. */
async function load(kind: Kind, id: string): Promise<Result> {
  try {
    const response = await fetch(`/api/admin-panel?${kind}=${encodeURIComponent(id)}`);
    return (await response.json()) as Result;
  } catch {
    return {ok: false, error: "Couldn't reach Giftpin. Try again in a moment."};
  }
}

function RegistryLine({registry, note}: {registry: Registry; note?: string}) {
  const when = registry.eventDate ? ` · ${registry.eventDate}` : '';
  return (
    <s-stack gap="small-500">
      <s-link href={registry.publicUrl} target="_blank">
        {registry.title}
      </s-link>
      <s-text color="subdued">
        {registry.names ? `${registry.names} · ` : ''}
        {registry.eventType}
        {when}
        {registry.status === 'archived' ? ' · archived' : ''}
        {note ? ` · ${note}` : ''}
      </s-text>
    </s-stack>
  );
}

function giftText(gift: Gift): string {
  const what = gift.isContribution
    ? `Chipped in ${gift.amount ?? ''} ${gift.currency ?? ''}`.trim()
    : `${gift.qty} × ${gift.itemTitle}`;
  const tags = [gift.orderName, gift.shippedToRegistrant ? 'shipped to registrant' : null, gift.voided ? 'refunded' : null];
  return [what, ...tags.filter(Boolean)].join(' · ');
}

function Groups({groups}: {groups: Group[]}) {
  return (
    <s-stack gap="base">
      {groups.map((group) => (
        <s-stack key={group.registry.id} gap="small-300">
          <RegistryLine registry={group.registry} />
          {group.gifts.map((gift, i) => (
            <s-text key={i} color={gift.voided ? 'subdued' : undefined}>
              {giftText(gift)}
            </s-text>
          ))}
        </s-stack>
      ))}
    </s-stack>
  );
}

function Body({kind, result}: {kind: Kind; result: Result}) {
  if (kind === 'order') {
    const groups = (result.registries ?? []) as Group[];
    if (groups.length === 0) return <s-text>This order didn't buy anything from a Giftpin registry.</s-text>;
    return <Groups groups={groups} />;
  }

  if (kind === 'product') {
    const rows = (result.registries ?? []) as ProductRow[];
    if (rows.length === 0) return <s-text>This product isn't on any active registry.</s-text>;
    return (
      <s-stack gap="base">
        {rows.map((row) => (
          <RegistryLine key={row.registry.id} registry={row.registry} note={`${row.bought} of ${row.wanted} bought`} />
        ))}
        {(result.total ?? 0) > rows.length ? (
          <s-text color="subdued">Showing {rows.length} of {result.total} registries.</s-text>
        ) : null}
      </s-stack>
    );
  }

  const owned = result.owned ?? [];
  const gifts = result.gifts ?? [];
  if (owned.length === 0 && gifts.length === 0) {
    return <s-text>No Giftpin registries or registry gifts for this customer.</s-text>;
  }
  return (
    <s-stack gap="large">
      {owned.length > 0 ? (
        <s-stack gap="base">
          <s-heading>Their registries</s-heading>
          {owned.map((registry) => (
            <RegistryLine key={registry.id} registry={registry} />
          ))}
        </s-stack>
      ) : null}
      {gifts.length > 0 ? (
        <s-stack gap="base">
          <s-heading>Gifts they bought</s-heading>
          <Groups groups={gifts} />
        </s-stack>
      ) : null}
      <s-text color="subdued">
        Only registries started while signed in to a store account are matched to a customer.
      </s-text>
    </s-stack>
  );
}

function Panel({kind}: {kind: Kind}) {
  const id = (shopify as {data: {selected?: {id: string}[]}}).data.selected?.[0]?.id ?? '';
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!id) {
      setResult({ok: false, error: 'Nothing selected.'});
      return;
    }
    load(kind, id).then(setResult);
  }, [id, kind]);

  return (
    <s-admin-action heading="Giftpin registry">
      <s-button slot="primary-action" onClick={() => shopify.close()}>
        Done
      </s-button>
      {!result ? (
        <s-text>Loading…</s-text>
      ) : !result.ok ? (
        <s-banner tone="critical">
          <s-text>{result.error ?? 'Something went wrong.'}</s-text>
        </s-banner>
      ) : (
        <Body kind={kind} result={result} />
      )}
    </s-admin-action>
  );
}

export function mount(kind: Kind) {
  render(<Panel kind={kind} />, document.body);
}
