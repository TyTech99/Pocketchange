# Provisioning SMS, MMS and email for the MVP

Status: **proposed**. Needs Ty's approval. Nothing here is set up.
Owner: PocketChange Launch (this doc). Ty owns accounts, spending and DNS. OpenCode writes any code.
Date: 2026-10-18

## Summary

- Pocket Change needs two channels. Twilio for SMS and MMS. Hostinger email for the six-digit login code and for forwarded payment proof.
- Hostinger email is fine for the MVP at low volume. Its sending cap is per mailbox per day, and the login codes are far under it.
- Twilio US numbers need carrier registration before texts are reliably delivered. This is the slow step. Start it first.
- Twilio rejects loan marketing. Pocket Change is a tracker, not a lender, so the registration text must describe notices to people in an existing loan. This is the biggest registration risk.
- D-A1 (how the SMS webhook authenticates) is **Ty's open decision**. Options are in section 3. This doc does not decide it.

How to read this: **Facts** are checked against a source. **Assumptions** need Ty's yes. **Recommendations** are mine. Steps say what, who, and what proves it worked.

## 1. SMS and MMS (Twilio)

### Facts

- `.env.example` has empty `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, marked optional and stubbed. Twilio is the provider of record in the repo.
- `POST /demo/api/sms` is a Twilio-style webhook. It reads `From`, `To` and `Body` only, and it returns empty TwiML. It does not read `NumMedia` or `MediaUrl0`, so an MMS image is ignored today. It is demo code, reference only. No Twilio send call exists.
- `docs/product/MVP-USE-CASES.md` needs: inbound payment-notification SMS, outbound one-line SMS (OTP, invite, reminders at -3 / due / +3 days, confirmations), and an MMS or SMS receipt forward that uses the same parser as email.
- Product rule: SMS is a doorbell. One short message, or a link to the web. No chatbot.
- Twilio US pricing, October 2026 ([Twilio US SMS pricing](https://www.twilio.com/en-us/sms/pricing/us)): long-code and toll-free SMS $0.0083 per segment each way, plus carrier fees of about $0.0025 to $0.005. MMS out $0.022. MMS in $0.0165 (long code) or $0.02 (toll-free). Local number from $1.15 per month. Toll-free from about $2.15 per month ([Twilio phone numbers](https://www.twilio.com/en-us/phone-numbers)).
- Anyone sending from a US 10DLC (local) number through Twilio must register for A2P 10DLC, including individuals ([Twilio A2P 10DLC](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc)). Trial accounts cannot register ([quickstart](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/quickstart)).
- Sole proprietor brand (no EIN): one campaign, one number, about 1,000 segments per day to T-Mobile. Fees: $4 brand, $15 campaign vetting, $2 per month per campaign ([Twilio 10DLC page](https://www.twilio.com/en-us/phone-numbers/a2p-10dlc)). The brand doc lists the brand fee as $4.50 ([brand registration](https://www.twilio.com/docs/trust-hub/registrations/a2p-10dlc-brand)). Campaign vetting is manual. Twilio says under one week on one page and up to several weeks on another ([sole proprietor overview](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/direct-sole-proprietor-registration-overview.md)).
- With an EIN the choice is Low-Volume Standard or Standard. Same $15 vetting, $1.50 to $10 per campaign per month.
- Toll-free numbers cannot send SMS to the US until toll-free verification is approved. It needs a paid account and a Trust Hub profile. Since 2026-02-17 a business registration number is required for all business types except sole proprietors ([console guide](https://www.twilio.com/docs/messaging/compliance/toll-free/console-onboarding), [changelog](https://www.twilio.com/en-us/changelog/business-registration-numbers-required-for-toll-free-messaging-p)). Twilio says toll-free approval is usually faster than 10DLC ([Twilio 10DLC page](https://www.twilio.com/en-us/phone-numbers/a2p-10dlc)).
- MMS works on A2P 10DLC, toll-free and short codes ([Twilio MMS](https://www.twilio.com/en-us/messaging/channels/mms)).
- An inbound MMS webhook carries `NumMedia`, then `MediaUrl0`, `MediaContentType0`, and so on ([webhook request](https://www.twilio.com/docs/messaging/guides/webhook-request)).
- Twilio rejects 10DLC campaigns and toll-free verifications that contain loan marketing. A rejected loan-marketing campaign cannot be resubmitted. Servicing messages to existing borrowers, such as payment reminders and account notices, may be allowed under a different use case ([error 30942](https://www.twilio.com/docs/api/errors/30942), [30443](https://www.twilio.com/docs/api/errors/30443)).
- Trial accounts send only to verified numbers (up to 5), expire after 30 days, and cannot use custom message bodies ([Twilio trial](https://www.twilio.com/docs/usage/trials)).

### Assumptions (need Ty's yes)

1. MMS is **not** needed for the MVP launch. The parser reads text. Reading a screenshot needs OCR or a vision step, which no doc specifies. MVP: the number is MMS-capable, an MMS gets one reply saying "send it as text or email", and nothing is stored.
2. Expected volume is far below 1,000 segments per day. This fits a sole proprietor brand.
3. Ty has no EIN for Pocket Change, or is willing to register as himself. If an EIN exists, use Low-Volume Standard.

### Recommendations

- **Number type:** a Twilio toll-free number, because it is verified faster and needs no brand and campaign. Fall back to a local 10DLC number if toll-free is rejected. Not verified: that a loan-tracker passes either review. The one-line use-case text matters more than the number type.
- **Registration wording:** describe "payment notices and sign-in codes for people in a friends-and-family loan record". Never include rates, offers or "apply". Show opt-in on the web wizard and "STOP" handling.

### Steps

| # | Step | Owner | Proof it worked | Spends money? |
|---|---|---|---|---|
| S1 | Create the Twilio account and upgrade it from trial. | Ty | Console shows a paid account. | **Yes. Needs Ty's yes.** Card on file, plus any top-up. |
| S2 | Create the Trust Hub profile (Starter for sole proprietor, Business otherwise). | Ty | Profile status "approved". | No |
| S3 | Buy one number: toll-free (about $2.15 per month) or local (about $1.15 per month). Confirm the SMS and MMS capabilities. | Ty | Number shows SMS and MMS in the console. | **Yes. Needs Ty's yes.** |
| S4 | Submit registration: toll-free verification, or A2P brand plus campaign ($4 + $15 + $2 per month for a sole proprietor). Use the wording above. | Ty, with text drafted by PocketChange Launch | Status "approved" or "verified". Until then, delivery is unreliable. | **Yes. Needs Ty's yes.** |
| S5 | Put the Twilio values into the Hostinger Node.js environment settings. Names are in the table below. Values never go into the repo. | Ty | App boots, and a test send in S7 succeeds. | No |
| S6 | Set the number's incoming-message webhook to the app URL. Today that is `https://pocketchange.afterthedemo.com/demo/api/sms`, method POST. The production route will differ. Authentication follows Ty's D-A1 choice (section 3). | Ty | Twilio console log shows a 200 for a test text. | No |
| S7 | Run a test with the sign-in code and one inbound payment text, in test mode first (no real sends), then live to Ty's own phone. | PocketChange Launch | The inbound text creates a payment in the UAT run. The outbound text arrives on Ty's phone. | Pennies |

### Environment variable names (names only)

| Name | In repo today | Use |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | yes, empty | Account id |
| `TWILIO_AUTH_TOKEN` | yes, empty | Sending, and signature check if D-A1 is option (a) |
| `TWILIO_FROM_NUMBER` | yes, empty | Sender number |
| `TWILIO_MESSAGING_SERVICE_SID` | proposed | Needed if the number joins a Messaging Service (10DLC requires one) |
| `APP_BASE_URL` | proposed | The public origin, used to build the exact webhook URL |
| `APP_ENV` | proposed in the auth plan | `test` turns on the in-memory outbox and sender stubs |

## 2. Email (Hostinger)

### Facts

- Read-only check of the Hostinger account today (no changes made):
  - Plan: Business Web Hosting, active. `pocketchange.afterthedemo.com` is a Node.js site on it.
  - The `afterthedemo.com` DNS zone **already has** Hostinger Mail records: MX `mx1.hostinger.com` (priority 5) and `mx2.hostinger.com` (10), SPF `v=spf1 include:_spf.mail.hostinger.com ~all`, three DKIM CNAMEs (`hostingermail-a`, `-b`, `-c` under `_domainkey`), and DMARC `v=DMARC1; p=none`. Autodiscover and autoconfig CNAMEs also exist.
  - The domain list shows only `cwtables.com`. `afterthedemo.com` is not in it, so I could not see its registrar or mailboxes.
  - The Reach API returned 403, so I could not see Reach.
- Server settings ([Hostinger setup doc](https://docs.hostinger.com/emails/setup-devices), [config details](https://www.hostinger.com/support/1575756-how-to-get-email-account-configuration-details-for-hostinger-email/)): SMTP `smtp.hostinger.com` port 465 (SSL/TLS), or port 587 (STARTTLS) if 465 fails. IMAP `imap.hostinger.com` port 993. Username is the full address. Password is the mailbox password, or an app password.
- Limits ([Hostinger email limits](https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/)): per mailbox, rolling 24 hours, inbound and outbound counted separately. Business Starter 1,000 per day. Standard and Premium 3,000 per day. Free or trial email on a hosting plan has lower limits shown in hPanel. No hourly cap is published for Business plans.
- Sending from the web server itself (PHP `mail()` or similar) is capped at 10 per minute and 100 per day ([Hostinger limits](https://www.hostinger.com/support/6976044-parameters-and-limits-of-hosting-plans-in-hostinger/)). Authenticated SMTP to the mailbox uses the mailbox limits instead.
- The product docs name `payment@personalloantracker.io` as the receipt-forward address. That domain is not in this Hostinger account.

### Assumptions (need Ty's yes)

1. One mailbox on `afterthedemo.com` sends the codes and receives forwarded proof, for preprod and the MVP. Suggested address: `noreply@` for sending, `payment@` for receiving. Both can be one mailbox plus an alias.
2. Volume stays under a few hundred messages per day, so the mailbox cap is enough. A code is one message. Resends are limited to one per 60 seconds per the auth plan.
3. Receiving forwarded proof means the app reads the mailbox over IMAP on a timer. Hostinger has no inbound webhook. This is not designed yet.

### Recommendations

- Use Hostinger email for the MVP. It costs nothing new if the existing mailbox allowance covers one mailbox.
- Plan to move code delivery to a transactional provider (Resend, Postmark, Amazon SES or similar) after the MVP, once there is real traffic or a spam-folder problem. A mailbox shares reputation with Ty's normal mail and has no bounce dashboard. The `send(email, code)` interface in the auth plan keeps this a swap, not a rewrite.
- Do not use Hostinger Reach for codes. It is a marketing-email product. I could not check its plan or limits.

### Steps

| # | Step | Owner | Proof it worked | Spends money? |
|---|---|---|---|---|
| E1 | In hPanel, confirm which email plan covers `afterthedemo.com` and how many mailboxes it includes. | Ty | You can see the plan and the limits under Mailboxes, View limits. | No |
| E2 | Create the mailbox (suggested `noreply@afterthedemo.com`) and an alias or second mailbox for `payment@`. | Ty | Webmail login works. | **Only if the plan has no free mailbox. Needs Ty's yes.** |
| E3 | Check DNS. The records listed above must exist: MX, SPF, 3 DKIM, DMARC. They exist today. **Do not change them without Ty's yes.** Optional later: add a DMARC `rua=` report address, then move `p=none` to `quarantine`. | Ty approves, PocketChange Launch checks | Send a test to a Gmail address. "Show original" shows SPF, DKIM and DMARC all PASS. | No |
| E4 | Put the SMTP (and IMAP, if receiving) settings in the Hostinger Node.js environment settings. | Ty | App boots. | No |
| E5 | Send one real code from preprod to Ty's inbox with test mode off. | PocketChange Launch | It arrives in the inbox, not spam, within seconds. | No |
| E6 | Confirm outbound SMTP from the Node.js site is not blocked. Not verified. Some hosts block ports 465 and 587. | PocketChange Launch | E5 succeeds. If it times out, use port 587, then ask Hostinger support. | No |

### How the app sends, and test mode

- The app calls one function, `send(email, code)`. A real implementation uses SMTP, with `nodemailer` as the usual library. No library is added by this doc.
- In test mode (`APP_ENV=test`) the sender writes to an in-memory outbox and sends nothing. The test-only endpoint from the auth plan reads it. See `docs/plans/auth-first-task-list.md` on the open branch `proposal/auth-first-task-list`.

### Environment variable names (names only, all proposed)

`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASS`, `APP_ENV`.

## 3. D-A1: how the inbound SMS webhook authenticates (Ty's open decision)

**Not decided.** Ty answered "different approach" and has not yet said which. This section lists the options. It records no choice.

The problem: Twilio cannot carry a login session, so `POST /demo/api/sms` cannot use the cookie gate in the auth plan. Something else must prove the request came from Twilio. Anyone can POST to a public URL, and a forged text could record a fake payment.

Applies to all options:
- Twilio requires HTTPS with a valid certificate ([Twilio webhook security](https://www.twilio.com/docs/usage/webhooks/webhooks-security)).
- Reject failures with 403 and write nothing.
- The web simulator (`/demo/sms`) uses the user session, not the webhook path.

| Option | How it works | Pros | Cons | Needs on the preprod host | Secret env names |
|---|---|---|---|---|---|
| **(a) Twilio signature** | Twilio sends `X-Twilio-Signature`, an HMAC-SHA1 over the full URL plus every request parameter, keyed with the auth token. The app recomputes it with the Twilio SDK validator and compares. | Proves the request is from this Twilio account and that the body was not changed. No secret in the URL. Twilio's own recommendation, and the auth plan's. Works the same for MMS fields. | The URL must match Twilio's byte for byte, so a proxy or domain change breaks it. Must pass all received params, not a fixed list. Needs the `twilio` npm package, or careful own code. Twilio says not to write your own. | Stable public URL, built from `APP_BASE_URL` and not from the request's Host or protocol, because the app sits behind Hostinger's proxy. Unverified: what Host and protocol the proxy forwards. Adapter-node needs `ORIGIN` or the header settings if it is used. Form params read once, then checked. The current handler calls `request.formData()`, so the check needs a `request.clone()` first. | `TWILIO_AUTH_TOKEN` |
| **(b) Secret token in the URL path or query** | The webhook URL is `.../sms/<random-token>` or `?t=<token>`. The app compares it with a stored value in constant time. | Simple. Works with any body. No SDK. Survives a body or param change. | The secret lives in the URL, so it shows up in Twilio's console logs, any proxy access log, and the Twilio debugger. Cannot prove the body was not changed. Leaks if the URL is shared. Rotating means editing the Twilio console. A query string is part of what Twilio signs, so it also works alongside (a). | HTTPS. Make sure the host does not log full URLs. Constant-time compare (`crypto.timingSafeEqual`). | `TWILIO_WEBHOOK_TOKEN` |
| **(c) IP allowlist** | Accept only Twilio's source IPs. | No code in the request itself. | Weak and brittle. Twilio says it has **no fixed range** of IPs that issue webhooks ([webhook security](https://www.twilio.com/docs/usage/webhooks/webhooks-security)). A list goes stale and blocks real texts. Behind a proxy the app sees the proxy's IP unless it trusts `X-Forwarded-For`, which a caller can forge. Proves nothing about who in that range sent it. | Trusted client-IP header from Hostinger. Unverified. | none |
| **(d) HTTP basic auth in the URL** | Webhook URL is `https://user:pass@host/path`. Twilio sends an `Authorization` header. The app checks it. | Supported by Twilio (Basic and Digest) ([webhook security](https://www.twilio.com/docs/usage/webhooks/webhooks-security)). Standard header, so it stays out of most access logs. Easy to rotate. | Twilio now recommends its Webhooks configuration API over credentials in the URL. The secret is still entered in the Twilio console. No body integrity. Needs a constant-time compare. | HTTPS. The app reads the `Authorization` header. Unverified: the Hostinger proxy passes it through. | `TWILIO_WEBHOOK_USER`, `TWILIO_WEBHOOK_PASS` |
| **(e) Open in test mode only** | With `APP_ENV=test` the route accepts any POST. In production it must use (a), (b) or (d). | Needed for e2e tests, which post fake texts without Twilio. | Dangerous if it ships on. It is not an option for production. Use the same guard as the auth plan's test hook: app refuses to start if `APP_ENV=test` and `NODE_ENV=production`, plus a test that proves it returns 403 when the flag is off. | None. | none |

**Recommendation (not a decision):** (a) for production and preprod, with (e) as the test-mode bypass behind the startup refusal. Reason: it is the only option that proves the sender and the body. It adds no secret to the URL. It matches the auth plan. Option (b) is the simplest fallback if the proxy makes the URL unstable. Use (b) or (d) **in addition** to (a) only if Ty wants two layers. Do not use (c) on its own.

What happens next once Ty decides: PocketChange bot records it in `docs/decisions/`, and OpenCode adds the check and its failing test first. Nothing in the app changes now.

## 4. Decisions needed from Ty

| # | Decision | Recommendation |
|---|---|---|
| P1 | D-A1: which webhook authentication (section 3)? | (a) signature, with (e) in test mode only |
| P2 | D-A2: Hostinger email sends the codes for the MVP? | Yes. Move to a transactional provider after the MVP |
| P3 | Twilio number type: toll-free or local 10DLC? | Toll-free, with local as fallback |
| P4 | Does Pocket Change have an EIN, or register as a sole proprietor? | Sole proprietor if no EIN |
| P5 | MMS: is a screenshot receipt needed at launch? | No. Reply "send it as text or email" |
| P6 | Approve the spend: Twilio upgrade, number, registration (about $19 one-time on 10DLC sole proprietor, plus about $3 per month, plus usage) | Approve when P3 is chosen |
| P7 | Receipt-forward address: use `payment@afterthedemo.com` for preprod, and what is the production domain? The docs name `payment@personalloantracker.io`, which is not in this Hostinger account | Use `afterthedemo.com` now. Pick the production domain before launch |
| P8 | May PocketChange Launch check DNS (read-only) and, only on a later yes, change it (optional DMARC report address)? | Read-only now. No changes |
| P9 | Inbound forwarded email: read the mailbox over IMAP on a timer? | Yes, later task. Not part of the auth work |

## 5. Not verified

- That a loan-tracker passes Twilio's 10DLC or toll-free review. Loan marketing is prohibited. Servicing notices may be allowed. Only Twilio's review can confirm this.
- Toll-free verification fees and current review time. I found no fee in the pages I read.
- The campaign monthly fee of $2 (sole proprietor) comes from Twilio's marketing page. The brand fee shows as $4 on one page and $4.50 on another.
- Which Hostinger email plan covers `afterthedemo.com`, whether a mailbox exists, and its exact limits. The API did not list mailboxes. hPanel shows them.
- Whether `afterthedemo.com` is registered in this Hostinger account. The domain list shows only `cwtables.com`.
- Hostinger Reach plan and limits (API returned 403).
- Whether the Hostinger Node.js host allows outbound SMTP on 465 and 587.
- What Host, protocol and client-IP headers Hostinger's proxy sends to the Node app. This decides how the exact webhook URL is built for option (a).
- Whether the proxy passes the `Authorization` header (option d).
- Whether Twilio's 30-day trial and verified-recipient limits matter for UAT. A paid account avoids both.
