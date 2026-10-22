# Email setup for Pocket Change

Status: **proposed**.
Owner: Ty (mailbox, hPanel steps). PocketChange Launch (checks).
Date: 2026-10-22

Two parts. Part 1 gets a Hostinger mailbox sending mail for the app and its credentials into this repo safely. Part 2 compares Hostinger email with transactional email providers.

Terms used below:
- **SMTP** is the standard way an app hands an email to a mail server for delivery.
- **SPF, DKIM and DMARC** are DNS records that prove mail from the domain is genuine. Without them, sign-in codes land in spam.
- **Credentials** are the login values that let the app send mail. They never go into git.

## Part 1. Get a sending mailbox going and the credentials into the repo

### A. Create the mailbox

1. hPanel, Emails. Check whether the hosting plan already includes a mailbox for the domain (a bundled free mailbox or a free trial). If not, buy Business Starter. Price (checked October 2026, [Business Email](https://www.hostinger.com/business-email)): $0.39 a month per mailbox on a 48-month promo term, renewing at $1.59 a month.
2. Create one mailbox used only by the app, for example `no-reply@afterthedemo.com`. Give it a long password used nowhere else.
3. Know the sending limits ([Hostinger limits](https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/)): per mailbox, over a rolling 24 hours, 1,000 sent on Business Starter, 3,000 on Standard and Premium, 100 on free and trial mailboxes. Up to 100 recipients per message.

### B. Domain sending setup (SPF, DKIM, DMARC)

These records are described here, not changed by this doc. Hostinger lists the exact values in hPanel, Emails, Mailboxes, Domain settings ([manual setup](https://www.hostinger.com/support/8671319-set-up-a-domain-for-hostinger-email-manually/)).

| Record | Type and host | Value | What it does |
|---|---|---|---|
| SPF | TXT at `@` | `v=spf1 include:_spf.mail.hostinger.com ~all` | Says Hostinger's servers may send for the domain. Only one SPF record per domain ([SPF](https://www.hostinger.com/support/1583673-what-is-the-spf-record-for-hostinger-email/)). |
| DKIM | Three CNAMEs: `hostingermail-a`, `-b`, `-c` `._domainkey` | `hostingermail-a.dkim.mail.hostinger.com` (and `-b`, `-c`) | Lets receivers check Hostinger's signature on each message. |
| DMARC | TXT at `_dmarc` | `v=DMARC1; p=none; rua=mailto:<report address>` | Tells receivers what to do when SPF or DKIM fails, and where to send reports. |
| MX | Two MX records at `@` | `mx1.hostinger.com` (5), `mx2.hostinger.com` (10) | Receives mail, so bounces and replies reach the mailbox. |

4. Fact from a read-only DNS lookup on 2026-10-22: `afterthedemo.com` already has all of these (SPF, all three DKIM CNAMEs, MX, and DMARC `p=none` without a report address). Its DNS is hosted at Epik, not Hostinger, so hPanel's "Connect automatically" does not apply; any change is made at Epik.
5. A production domain other than `afterthedemo.com` needs the same records before it sends codes. DNS changes take up to 24 hours to spread. Domain settings in hPanel shows each record's status once they do.

### C. Collect the values

| Value | Where in hPanel | Env var name |
|---|---|---|
| SMTP server: `smtp.hostinger.com` | Emails, Mailboxes, Manage, Configuration Settings, Manual Configuration | `SMTP_HOST` |
| Port: `465` (SSL), or `587` (STARTTLS) if 465 fails | Same screen | `SMTP_PORT` |
| Username: the full mailbox address | Same screen | `SMTP_USER` |
| Password: the mailbox password (secret) | Set when the mailbox is created; reset under Mailboxes | `SMTP_PASSWORD` |
| From address shown to users, for example `Pocket Change <no-reply@afterthedemo.com>` | Your choice; must be this mailbox or one of its aliases | `MAIL_FROM` |

Source for the server and ports: [Hostinger configuration details](https://www.hostinger.com/support/4305847-set-up-hostinger-email-on-your-applications-and-devices/). Hostinger supports only ports 465 and 587 for sending ([SMTP ports](https://www.hostinger.com/tutorials/smtp-port/)).

Only `SMTP_PASSWORD` is secret. The other four stay in the environment too, so the app can move to another provider by changing values, not code.

### D. Put them in the repo properly

The rule: values are never committed, pasted into chat, or written into a doc.

6. **Names in git:** `.env.example` is committed and holds only empty names. Today it has none of the five names above. They are added to it when the app first reads them. No code reads any of them yet.
7. **Local development:** copy `.env.example` to `.env` and fill it in. `.gitignore` ignores exactly `.env`. It does not ignore `.env.local` or `.env.production`, so use only the name `.env`.
8. **Production and preprod (Hostinger Node.js app):** hPanel, your Node.js website dashboard, Environment variables, Add environment variable. Enter each name and value, then click Apply changes. Hostinger redeploys the app and the app reads the values from `process.env`. Keys are uppercase letters, numbers and underscores. Values are stored encrypted ([Hostinger environment variables](https://docs.hostinger.com/node.js/environment-variables)). Enter the values on that screen yourself.
9. **GitHub Actions secrets:** not needed. The `rails-gate` workflow uses no secrets and CI sends no mail.
10. **If the password is ever exposed:** reset it under Mailboxes, then update `SMTP_PASSWORD` in Hostinger's Environment variables and in your `.env`.

### E. Test it

11. Test with one email, from Hostinger Webmail. Sign in as the app mailbox and send a short message to your own address.
12. Proof it worked: the message arrives in the inbox, not spam. In the received message, open the full headers ("Show original" in Gmail). SPF, DKIM and DMARC each show PASS.
13. When the sign-in code feature ships, the same proof applies to the first code sent to your address from preprod.

## Part 2. Is Hostinger email the best choice for sign-in codes?

Fact from the repo: the app sends six-digit sign-in codes, plus invites and reminders described in `docs/product/MVP-USE-CASES.md`. Volume at MVP is small. What matters most is that codes arrive within seconds and land in the inbox.

Prices are US list prices from each provider's own page in October 2026.

| | Price at small volume | Free tier | Node SDK or SMTP | Fit for sign-in codes | Setup effort |
|---|---|---|---|---|---|
| **Hostinger email** ([pricing](https://www.hostinger.com/business-email)) | $1.59 a month per mailbox at renewal | Bundled or trial mailbox on some hosting plans, 100 sent a day | SMTP only, via `nodemailer` | Good enough at MVP volume. A mailbox service, not built for app mail: no sending API, delivery webhooks or per-message delivery log found. | Lowest. Domain records already in place. |
| **Resend** ([pricing](https://resend.com/pricing)) | Pro $20 a month for 50,000 | 3,000 a month, 100 a day, no time limit | `resend`, SMTP relay | Strong. Built for app mail, with delivery webhooks. | Low. New account, domain records, API key. |
| **Postmark** ([pricing](https://postmarkapp.com/pricing)) | Basic $15 a month for 10,000 | 100 a month | `postmark`, SMTP | Strongest. Built for transactional mail, which it keeps separate from bulk mail. | Low. New account, domain records, API token. |
| **Amazon SES** ([pricing](https://aws.amazon.com/ses/pricing/)) | $0.10 per 1,000, no monthly fee | None ongoing; new AWS accounts get up to $200 in credits | `@aws-sdk/client-sesv2`, SMTP | Good, but bounce handling is yours to build. | Highest. AWS account, access keys, and leaving the sandbox (AWS replies within 96 hours) ([sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)). |
| **SendGrid** ([pricing](https://www.twilio.com/en-us/products/email-api/pricing)) | Essentials from $19.95 a month | 60-day trial only, 100 a day | `@sendgrid/mail`, SMTP | Good. Shared sending servers on Essentials. | Medium. Two-factor login, domain records, card before upgrade. |
| **Mailgun** ([pricing](https://www.mailgun.com/pricing/)) | Basic $15 a month for 10,000 | 100 a day | `mailgun.js`, SMTP | Good. Built for app mail. | Medium. New account, domain records, API key. |
| **Brevo** ([pricing](https://www.brevo.com/pricing/)) | Starter $9 a month for 5,000 | 300 a day | `@getbrevo/brevo`, SMTP | Fair. Marketing-first product; sending starts after Brevo approves the account. | Medium. New account, approval, domain records. |

Not found: whether your current hosting plan includes a free mailbox (check hPanel, Emails), and any Hostinger delivery log or webhook for app mail.

Every provider above accepts SMTP. Code written against `nodemailer` and the five env names can move to any of them by changing values and DNS records, not code.

**Verdict (recommendation):** Use Hostinger email over SMTP for the MVP, because the domain is already set up for it, it adds little or no cost, and 1,000 sends a day is far above MVP volume; Postmark is the stronger sender if codes start landing in spam.
