# Giftpin security incident response plan

Owner and sole responder: Ben Humphries (support@giftpin.app).
Last reviewed: 23 September 2026. Review every 6 months, and after any incident.

A "security incident" is any confirmed or reasonably suspected event where personal data handled by Giftpin (registrant names and emails, shipping addresses, buyer names, Shopify customer IDs, Shopify access tokens) was, or could have been, accessed, changed, lost or disclosed without authorisation, or where the systems that hold it were compromised.

## 1. Detect

Ways an incident may come to light: an alert or odd activity in Railway, Neon, GitHub, Cloudflare, Resend or Shopify; a report to support@giftpin.app or privacy@giftpin.app; a message from Shopify; a leaked credential (for example a key committed to git); an unexpected spike in errors or traffic; a lost or stolen laptop or phone.

Anyone can report a suspected incident to support@giftpin.app. Acknowledge within 1 business day.

## 2. Contain (first hour)

Do these first, before investigating. Write down the time of each action.

1. Revoke the exposed credential or access. Depending on what is affected:
   - Shopify app secret: Dev Dashboard > app > Settings > Credentials > Rotate.
   - Railway: rotate the exposed variable (`ENCRYPTION_KEY`, `SIGNING_KEY`, `SHOPIFY_API_SECRET`, `RESEND_API_KEY`, `DATABASE_URL`, `REDIS_URL`) in both services (giftpin-app and giftpin-worker), then redeploy. Rotating `SIGNING_KEY` only invalidates outstanding links. Do NOT rotate `ENCRYPTION_KEY` without first decrypting and re-encrypting stored data, or the encrypted emails and addresses become unreadable.
   - Neon: reset the database role password and update `DATABASE_URL` and `DIRECT_URL`.
   - Resend: delete and recreate the API key.
   - GitHub, Railway, Neon, Cloudflare, Shopify Partner, Zoho: change the account password, sign out all sessions, and confirm 2-step verification is on.
2. If the app itself is the problem (a bug exposing data), take the affected feature offline: set the guest page or route to return an error, or scale the service down in Railway, so data stops flowing out.
3. Preserve evidence. Do not delete logs. Export the Railway logs and the `AuditLog` table rows for the period, and note the time window.

## 3. Assess (first 24 hours)

Answer and record:

- What happened, and when did it start and end?
- Which data was involved (names, emails, addresses, tokens), whose (which merchants and which of their customers), and roughly how many people?
- Was the data encrypted? Registrant emails and shipping addresses are encrypted with AES-256-GCM; an attacker without `ENCRYPTION_KEY` sees ciphertext only. Buyer names are not separately encrypted.
- Is there a real risk of harm to those people (identity misuse, fraud, embarrassment, physical risk from an exposed address)?
- Is it still happening?

Rate it:

| Level | Meaning | Example |
|---|---|---|
| High | Personal data confirmed exposed, or credentials with data access confirmed compromised | Database credential leaked and used |
| Medium | Possible exposure, not yet confirmed | Key in a public commit, no evidence of use |
| Low | No personal data involved | Bug that only exposed public product data |

## 4. Notify

**Merchants** (High, and Medium once exposure is confirmed): email each affected merchant without undue delay and no later than 72 hours after confirmation (the commitment in the privacy policy). Say: what happened, what data was involved, when, what Giftpin has done, what the merchant should do (if anything), and a contact address. Do not include personal data in the email.

**Shopify:** report through Partner Dashboard support / Shopify Developer Support when Shopify customer data or Shopify credentials may be involved. Keep the case reference.

**Regulators and individuals:** the merchant is the controller for its customers' data, so merchants decide on notifying individuals and regulators, and Giftpin gives them what they need to do so. For Giftpin's own obligations: in Canada, report a breach of security safeguards that creates a real risk of significant harm to the Office of the Privacy Commissioner of Canada as soon as feasible, notify the affected individuals, and keep a record of every breach for 24 months. Under GDPR, a controller must notify its supervisory authority within 72 hours of becoming aware; Giftpin, as processor, must tell the controller without undue delay. If unsure, get legal advice before the 72-hour mark.

## 5. Eradicate and recover

- Fix the root cause (patch the bug, remove the leaked secret from git history, close the access path).
- Redeploy with rotated secrets. Confirm the app works: install flow, guest page, manage page, order webhook attribution.
- Confirm the attacker's access is gone: check for unknown Railway/Neon/GitHub sessions, tokens, deploy keys, webhooks and OAuth apps.
- Restore data from a Neon point-in-time backup only if data was altered or deleted, and only to a point before the incident.

## 6. Review (within 7 days of closing)

Write a short blameless report and save it in `docs/incidents/YYYY-MM-DD.md`: timeline, cause, data and people affected, who was notified and when, what worked, and what changes. Update this plan and the privacy policy if anything changed. Keep incident records for at least 24 months.

## Quick contacts

- Support / privacy inbox: support@giftpin.app, privacy@giftpin.app
- Shopify: Partner Dashboard > Support (Shopify Developer Support)
- Hosting: Railway (railway.com) and Neon (neon.com) dashboards and support
- Email: Resend and Zoho Mail dashboards
- DNS: Cloudflare dashboard
