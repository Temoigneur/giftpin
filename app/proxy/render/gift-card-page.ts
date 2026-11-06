import type { PageBranding } from "../../shared/branding";
import type { ContributionVariant } from "../../shared/contributions";
import { GIFT_CARD_PROPERTY } from "../../lib/attribution";
import { layout, escapeHtml, escapeAttr, formatMoney, tx } from "./layout";
import { t } from "../../shared/i18n";

/**
 * The store's own gift card page, /apps/registry/gift-card — where
 * giftpin.app/gift-cards sends shoppers.
 *
 * A plain form that posts straight to the store's /cart/add, so it works with
 * JavaScript off and Giftpin never sees the payment. The signed `_gpc` token
 * is minted per page view (see signGiftCardAttribution) and rides on the line
 * as a property. Shopify issues and emails the card from the merchant's own
 * gift card product; the merchant keeps the money and any unspent balance.
 *
 * Optional "send it to someone": Shopify's own gift card recipient
 * properties, the same ones chip-ins use (giftCardRecipientProperties in
 * app/shared/contributions.ts). The fields stay disabled, so nothing is
 * posted, until the guest ticks the box; with JavaScript off the section
 * stays hidden and the card goes to the buyer.
 */

export interface GiftCardPageData {
  shopName: string;
  accentColor: string;
  branding?: PageBranding | null;
  currency: string;
  amounts: ContributionVariant[];
  blurb: string;
  /** Signed `_gpc` token for this page view. */
  token: string;
}

export function renderGiftCardPage(data: GiftCardPageData): string {
  const amounts = data.amounts
    .map(
      (v, i) => `<label class="gc-amt"><input type="radio" name="id" value="${escapeAttr(v.id)}"${i === 0 ? " checked" : ""} required>
        <span>${formatMoney(v.amount, data.currency) || escapeHtml(String(v.amount))}</span></label>`,
    )
    .join("");

  const body = `
<h1>${tx(t("manage.gc.title", { shop: data.shopName }))}</h1>
<p class="sub">${tx(data.blurb || t("manage.gc.blurb", { shop: data.shopName }))}</p>

<form method="post" action="/cart/add" class="note js-gc">
  <input type="hidden" name="quantity" value="1">
  <input type="hidden" name="properties[${GIFT_CARD_PROPERTY}]" value="${escapeAttr(data.token)}">
  <fieldset class="gc-amts"><legend>${tx(t("manage.gc.pick"))}</legend>${amounts}</fieldset>

  <div class="js-gc-recipient" hidden>
    <label class="check"><input type="checkbox" class="js-gc-send" name="properties[__shopify_send_gift_card_to_recipient]" value="true" disabled>
      ${tx(t("manage.gc.send"))}</label>
    <div class="fields js-gc-fields" hidden>
      <div><label for="gc-email">${tx(t("manage.gc.email"))}</label>
        <input id="gc-email" type="email" name="properties[Recipient email]" maxlength="254" required disabled></div>
      <div><label for="gc-name">${tx(t("manage.gc.name"))}</label>
        <input id="gc-name" type="text" name="properties[Recipient name]" maxlength="255" disabled></div>
      <div><label for="gc-msg">${tx(t("manage.gc.msg"))}</label>
        <textarea id="gc-msg" name="properties[Message]" maxlength="200" rows="3" disabled></textarea></div>
    </div>
  </div>

  <div class="row" style="margin-top:16px"><button class="btn" type="submit">${tx(t("manage.gc.add"))}</button></div>
  <p class="hint">${tx(t("manage.gc.hint", { shop: data.shopName }))}</p>
</form>`;

  return layout(
    {
      title: t("manage.gc.title", { shop: data.shopName }),
      accentColor: data.accentColor,
      indexable: false,
      shopName: data.shopName,
      branding: data.branding,
      head: `<style>.gc-amts{border:0;padding:0;margin:0 0 12px;display:flex;flex-wrap:wrap;gap:8px}.gc-amts legend{font-weight:600;margin-bottom:8px}.gc-amt{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:10px;padding:10px 14px;cursor:pointer;min-height:44px}.gc-amt:has(input:checked){border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}.js-gc-recipient{margin-top:8px}</style>`,
    },
    body + clientScript(),
  );
}

function clientScript(): string {
  return `<script>(function(){
  var box=document.querySelector('.js-gc-recipient');if(!box)return;
  var send=box.querySelector('.js-gc-send'),fields=box.querySelector('.js-gc-fields');
  box.hidden=false;send.disabled=false;
  send.addEventListener('change',function(){
    fields.hidden=!send.checked;
    fields.querySelectorAll('input,textarea').forEach(function(el){el.disabled=!send.checked;});
  });
})();</script>`;
}
