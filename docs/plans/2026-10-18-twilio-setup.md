# Twilio setup for Pocket Change

Status: **proposed**.
Owner: Ty (account, card, console steps). PocketChange Launch (checks).
Date: 2026-10-18

Two parts. Part 1 gets a Twilio account running and its credentials into this repo safely. Part 2 compares Twilio with other text-message providers.

Terms used below:
- **SMS** is a text message. **MMS** is a text with a picture or file.
- **Webhook** is a web address Twilio calls when a text arrives.
- **Credentials** are the account ID and secrets that let the app use Twilio. They never go into git.

## Part 1. Get a Twilio account going and the credentials into the repo

### A. Create and upgrade the account

1. Sign up at twilio.com, verify the contact details you sign up with and your own mobile number. No card is needed for the trial ([Twilio trial](https://www.twilio.com/docs/usage/trials)).
2. Know the trial limits: 30 days, 100 free texts, only to numbers you have verified (up to 5), and only Twilio's template wording.
3. Upgrade the account in the Console (Trial banner, then Upgrade). This needs a card. It removes the limits above, and US carrier registration needs a paid account ([A2P 10DLC quickstart](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/quickstart)).
4. Create the compliance profile. Console: Trust Hub. A person without a tax ID (EIN) uses the sole proprietor path ([Twilio 10DLC page](https://www.twilio.com/en-us/phone-numbers/a2p-10dlc)).

### B. Buy a number that can send and receive SMS and MMS

5. Console: Communications, Numbers & senders, Phone Numbers, Set up a new phone number. Pick a US number with SMS and MMS capability. Prices (checked October 2026, [phone numbers](https://www.twilio.com/en-us/phone-numbers)): local from $1.15 a month, toll-free about $2.15 a month.
6. Register the number with US carriers. Unregistered numbers are not reliably delivered.
   - Local number: A2P 10DLC. Sole proprietor fees are $4 brand, $15 campaign review, then $2 a month ([Twilio 10DLC page](https://www.twilio.com/en-us/phone-numbers/a2p-10dlc)). Review is manual and takes days to weeks.
   - Toll-free number: toll-free verification. It needs a paid account and the compliance profile ([console guide](https://www.twilio.com/docs/messaging/compliance/toll-free/console-onboarding)). I found no fee listed.
   - For either, describe the texts as payment notices for an existing loan record. Twilio rejects loan marketing ([error 30942](https://www.twilio.com/docs/api/errors/30942)).
7. Usage prices ([Twilio US pricing](https://www.twilio.com/en-us/sms/pricing/us)): SMS $0.0083 per segment each way. MMS $0.022 sent, $0.0165 received on a local number ($0.02 received on toll-free). Carrier fees of about $0.0025 to $0.01 per message are added.

### C. Collect the values

| Value | Where in the Console | Env var name |
|---|---|---|
| Account SID (account ID, starts `AC`) | Account Dashboard, Account Info | `TWILIO_ACCOUNT_SID` |
| Auth Token (master secret) | Account Dashboard, Account Info, click Show | `TWILIO_AUTH_TOKEN` |
| API Key SID (starts `SK`) | Settings, Account settings, API keys & auth tokens, Create API key (type Standard) | `TWILIO_API_KEY_SID` |
| API Key Secret (shown once, copy it then) | Same screen, on creation | `TWILIO_API_KEY_SECRET` |
| Twilio phone number | Numbers & senders, Phone Numbers | `TWILIO_FROM_NUMBER` |
| Messaging Service SID (starts `MG`), only if the number is placed in a Messaging Service | Messaging, Services | `TWILIO_MESSAGING_SERVICE_SID` |

Source for the key steps: [Create API keys](https://www.twilio.com/docs/iam/api-keys/keys-in-console). Console menu names move around; Twilio's docs above are the reference.

Which to use:
- For sending texts, the app should use the **API Key SID and Secret**. Twilio says to use API keys for applications. A leaked key can be deleted without changing the account's master secret ([API requests](https://www.twilio.com/docs/usage/requests-to-twilio)).
- For checking that an incoming webhook really came from Twilio, the **Auth Token** is required. Twilio signs webhooks with the account's primary Auth Token, not an API key ([webhook security](https://www.twilio.com/docs/usage/webhooks/webhooks-security), [error 57012](https://www.twilio.com/docs/api/errors/57012)). Keep it in the same safe places as the key.

### D. Put them in the repo properly

The rule: values are never committed, pasted into chat, or written into a doc.

8. **Names in git:** `.env.example` is committed and holds only empty names. Today it has `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`. The other three names above are added to it when the app first reads them. No code reads any of them yet.
9. **Local development:** copy `.env.example` to `.env` and fill it in. `.gitignore` ignores exactly `.env`. It does not ignore `.env.local` or `.env.production`, so use only the name `.env`.
10. **Production and preprod (Hostinger Node.js app):** hPanel, your Node.js website dashboard, Environment variables, Add environment variable. Enter each name and value, then click Apply changes. Hostinger redeploys the app and the app reads the values from `process.env`. Keys are uppercase letters, numbers and underscores. Values are stored encrypted ([Hostinger environment variables](https://docs.hostinger.com/node.js/environment-variables)). Enter the values on that screen yourself.
11. **GitHub Actions secrets:** not needed. The `rails-gate` workflow uses no secrets and CI sends no texts.

### E. Point incoming texts at the app and test it

12. Console: Numbers & senders, Phone Numbers, click your number, Messaging configuration, "A message comes in". Choose Webhook, method HTTP POST, and enter `https://pocketchange.afterthedemo.com/demo/api/sms`. Save ([messaging webhooks](https://www.twilio.com/docs/usage/webhooks/messaging-webhooks)). Twilio needs a valid HTTPS certificate. The app route reads Twilio's form fields `From`, `To` and `Body` and answers with an empty reply.
13. Test with one text. From your own phone, text a sentence like a payment notice to the Twilio number. Proof it worked: the Console message log shows the text with a 200 response from the webhook, and the payment appears in the app.
14. Texts to other people need nothing more from this doc.

## Part 2. Is Twilio the best MMS provider for this project?

Fact from the repo: MMS is not required. The product's inbound payment notices are texts, the parser reads text only (`src/lib/demo/parsePaymentSms.ts`), and a forwarded picture is described in `docs/product/MVP-USE-CASES.md` only as an alternate path. SMS alone covers the MVP.

Prices are US, before carrier fees, from each provider's published page in October 2026. Carrier fees are similar everywhere (about $0.007 to $0.01 per MMS).

| | MMS sent / received | Local number per month | US registration | Node SDK | Incoming webhook | Fit for a small SvelteKit app |
|---|---|---|---|---|---|---|
| **Twilio** ([pricing](https://www.twilio.com/en-us/sms/pricing/us)) | $0.022 / $0.0165 | $1.15 | A2P 10DLC or toll-free verification | `twilio` | Form POST (`From`, `To`, `Body`, `NumMedia`, `MediaUrl0`) | Best. The demo route is already written for these fields. Largest docs. |
| **Telnyx** ([pricing](https://telnyx.com/pricing/messaging/)) | $0.015 / $0.005 | $1.10 | Same 10DLC rules, fees passed through at cost ([fees](https://support.telnyx.com/en/articles/5634625-10dlc-fees-and-charges)) | `telnyx` | JSON POST, signed ([docs](https://developers.telnyx.com/docs/messaging/messages/receiving-webhooks)) | Good. Cheapest MMS. Route would need rewriting for JSON. |
| **Plivo** ([pricing](https://www.plivo.com/sms/pricing/us/)) | $0.018 / $0.018 | $0.50 | Same 10DLC rules ([docs](https://plivo.com/docs/messaging/api/10dlc/overview)) | `plivo` | Form POST (`From`, `To`, `Text`, `Media0`) ([docs](https://plivo.com/docs/messaging/xml/overview)) | Good. Cheapest number. Field names differ from the demo route. |
| **Vonage** ([10DLC fees](https://api.support.vonage.com/hc/en-us/articles/360058158511-10-DLC-Pricing-and-Fees)) | not published, ask sales | not found | Same 10DLC rules | `@vonage/server-sdk` | not checked | Weaker. MMS price is not public. |
| **Bandwidth** ([pricing](https://www.bandwidth.com/pricing/)) | $0.015 sent; received not found | not found | Same 10DLC rules | `@bandwidth/messaging` | not checked | Built for larger senders. Self-serve trial exists. |
| **Sinch** ([pricing](https://sinch.com/pricing/sms/)) | not found | one source says $25 (unverified) | Same 10DLC rules | `@sinch/sdk-core` | not checked | Weaker for a small app. |

US carrier registration is a carrier rule, so every provider above passes the same fees and review to you. No provider removes that work.

**Verdict (recommendation):** Keep Twilio, because the demo webhook already speaks its format, its docs and SDK are the strongest, and Telnyx or Plivo would save only cents a month at this volume.
