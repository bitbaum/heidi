# Passes: Bitcoin to Heidi's OrangeCat account

A pass is one payment for a number of days. Bitcoin has no recurring charge, so
nothing renews by itself; paying again before a pass runs out adds the days to
the end. What a pass changes is one thing: the chat allowance is three times the
open one (`PASS_CHAT_MULTIPLIER` in `lib/config/payments.ts`).

The money goes from the learner's wallet to the wallet behind Heidi's OrangeCat
entity. Heidi never holds it and stores no wallet address.

## What is in the package and what is here

`@bitbaum/paykit` owns everything that moves or checks money: the provider
interface, the OrangeCat provider (invoice, status, webhook signature), the
entitlement arithmetic and `applySettlement`, which grants once per payment.

This app owns configuration, storage and words:

| Where | What |
| --- | --- |
| `lib/config/payments.ts` | which passes exist, their prices and the payee, all from the environment |
| `lib/pay/store.ts` | `pay_checkouts` and `entitlements` on Postgres (`drizzle/0014_passes.sql`) |
| `lib/pay/service.ts` | joins the package to the config and the database |
| `app/api/pay/checkout` | `POST {plan}` creates an invoice; `GET /<id>` reads its state and settles when paid |
| `app/api/pay/webhook` | receives OrangeCat's `payment.settled` |
| `app/[locale]/pass` | the page with the link to OrangeCat and, when switched on, the passes; `/pass/checkout/<id>` shows the invoice |

## How a payment runs

1. A signed-in learner presses a pass's button on `/pass`. Heidi asks
   OrangeCat for an invoice paying the configured entity (through paykit: the
   keyed `POST /api/v1/payments`, or the account-less
   `POST /api/v1/payments/public`) and stores the checkout: OrangeCat's `payment.settled` names only the payment,
   so the stored row is the only link back to the learner.
2. `/pass/checkout/<id>` shows the invoice as a QR code and as a wallet link.
3. Settlement arrives two ways, and both end in the same `applySettlement`:
   OrangeCat calls the webhook, and the open checkout page polls
   `GET /api/pay/checkout/<id>` every four seconds, which asks OrangeCat. The
   first to arrive grants the days; the other is a duplicate.

A payment made on OrangeCat's own page for the entity reaches the same wallet
but starts no pass, because nothing links it to a Heidi account. The webhook
acknowledges it and does nothing.

## Switching it on

The button on `/pass` that opens Heidi's public OrangeCat page is always
there and needs no configuration.

The automatic pass is off until at least one price is set. While it is off,
`/pass` says so, `POST /api/pay/checkout` answers 503 and the webhook answers
503.

The values go in the app's `.env` on the box, beside the others
(`.env.example` lists them):

| Name | Value | Needed |
| --- | --- | --- |
| `HEIDI_PASS_30_SATS` | price of 30 days, in whole sats | yes: this switches it on |
| `HEIDI_PASS_365_SATS` | price of 365 days, in whole sats | no |
| `ORANGECAT_API_KEY` | an `ock_…` integration key with the scopes `payments.write` and `payments.read` | no, see below |
| `ORANGECAT_WEBHOOK_SECRET` | the `ock_whk_…` secret of the webhook endpoint | no, but without it only the open checkout page settles a payment |
| `ORANGECAT_PAY_ENTITY_ID` | the OrangeCat entity that is paid | no: Heidi's project when unset |
| `ORANGECAT_PAY_ENTITY_TYPE` | its kind | no: `project` when unset |

On OrangeCat, signed in as the account that owns the paid entity, at
`https://orangecat.ch/settings/integrations`:

1. **Webhook.** Add an endpoint for the account's personal actor with the URL
   `https://heidi.orangecat.ch/api/pay/webhook` and the event
   `payment.settled`. The secret is shown once; it is
   `ORANGECAT_WEBHOOK_SECRET`.
2. **Integration key.** Mint a key with `payments.write` and `payments.read`;
   it is `ORANGECAT_API_KEY`.

About the key: OrangeCat records a key's owner as the buyer of a keyed
payment and refuses an owner paying their own entity ("You cannot pay for
your own entity"). A key minted by the account that owns Heidi's project is
that case. paykit then asks for the invoice through OrangeCat's account-less
call instead, so the learner still gets one; the money and the webhook are the
same either way. A key from a different OrangeCat account is used as it is.

The wallet behind the entity has to be one OrangeCat can watch settle:
wallet-connect (NWC), a Lightning address whose provider supports LUD-21
verification, or an on-chain address. With a bare Lightning address OrangeCat
cannot see the payment arrive, and neither the webhook nor the poll will ever
report it paid.

## Trying it without money

`lib/pay/store.test.ts` settles against the real migrations on an in-process
Postgres, including the same payment reported three times at once.
`app/api/pay/webhook/route.test.ts` covers the off state and forged calls. The
package's own tests cover the signature and the OrangeCat request shapes.
