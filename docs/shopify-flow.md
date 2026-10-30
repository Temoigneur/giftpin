# Shopify Flow triggers (and Klaviyo through Flow)

Giftpin Pro sends three Shopify Flow triggers. Definitions live in
`extensions/flow-*/shopify.extension.toml`; the sender is
`app/models/flow.server.ts`. `app/models/__tests__/flow.test.ts` fails if a
payload and its TOML drift apart.

| Trigger (Flow name) | Handle | When |
| --- | --- | --- |
| Registry created | `giftpin-registry-created` | Registry made on the storefront or in store (POS / admin). Not for CSV imports. |
| Registry event coming up | `giftpin-event-approaching` | First daily run (15:10 UTC) when the event is 1 to 30 days away. Once per registry. |
| Registry gift bought | `giftpin-gift-purchased` | Each registry line on an attributed order, including chip-ins. Carries the order. |

Every trigger carries: Registry ID, Registry title, Occasion, Event date
(YYYY-MM-DD or empty), Registry URL, Registrant name, Registrant email, Items
remaining. "Coming up" adds Days until event; "gift bought" adds the order
reference, Item title, Quantity and Is contribution.

Never sent: guest names or emails, shipping addresses, the manage link. The
buyer is reachable only through the order reference, under Shopify's own rules.
No new access scopes: the order reference uses `read_orders`, which Giftpin has.

## Klaviyo without a Klaviyo integration

Klaviyo's Shopify Flow connector has a **Track an event** action that takes a
customer email, an event name and properties. A merchant workflow:

1. Trigger: Giftpin → Registry created.
2. Action: Klaviyo → Track an event. Customer Email Address = Registrant email,
   Event Name = "Giftpin registry created", properties from the trigger.
3. In Klaviyo, build a flow on that metric.

Registrant email is for messages about their own registry. Marketing to them
still needs their consent (CASL / CAN-SPAM); the field description in Flow
says so.

A native Klaviyo app (OAuth, Klaviyo App Marketplace) needs 5 production
installs outside our own accounts and a Klaviyo security review, so it waits
until merchants are using the Flow route.

## Not yet verified live (CLAUDE.md rule 1)

- `shopify app deploy` accepts these TOMLs and the triggers show in Flow.
- `flowTriggerReceive` takes our payload: numeric `order_id`, empty string in a
  `single_line_text_field`, the proxy URL in a `url` field.
- Public-app triggers work on non-Plus stores (shopify.dev only says custom-app
  triggers are Plus-only).
- Klaviyo's Track an event accepts a third-party app trigger's email field.
