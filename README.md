# ⚡ Lightning Tips — Embeddable Lightning Tipping Widget

An embeddable "tip jar" (think Twitch/blog tip button) where viewers scan a QR or
click **Lightning Tip** to send sats instantly to a creator. It shows a **live tip
feed** and leans into Lightning's **sub-second confirmations** so tipping feels
instant and satisfying — the opposite of slow on-chain confirmations.

Built with **Next.js (App Router)** and deployed on **Vercel**. Payments run on a
real Lightning node via **LNbits**, so every tip is a real, verifiable Lightning
payment that any third party can test independently.

---

## ✨ What it does

- **Embeddable widget** — drop it on any site with **one line of code**.
- **Real Lightning invoices** — standard BOLT11, scannable by any wallet.
- **Sub-second confirmation** — the widget auto-detects payment and celebrates.
- **Live tip feed** — recent tips appear in real time, with name + message.
- **Network-agnostic** — point it at a **testnet/signet** node (no real money) or
  **mainnet** (real sats, a fraction of a cent each). Same code either way.
- **No database required** — the Lightning node itself is the source of truth for
  the feed (settled incoming payments).

---

## 🏗️ How it works (architecture)

```
  Supporter's wallet            Creator's website                 This app (Vercel)
 ┌────────────────┐         ┌────────────────────┐        ┌──────────────────────────┐
 │ Any Lightning  │         │  <script embed.js> │  iframe│  Next.js frontend        │
 │ wallet (scans  │         │   → renders widget │◀───────│  • /            (demo)   │
 │ the QR)        │         └────────────────────┘        │  • /embed       (widget) │
 └───────┬────────┘                                       │                          │
         │ pays BOLT11 invoice                            │  Next.js API routes      │
         ▼                                                │  • POST /api/invoices    │
 ┌────────────────────────────┐    create / poll / list  │  • GET  /api/invoices/:h │
 │  LNbits  (real LN node)    │◀─────────────────────────│  • GET  /api/tips        │
 │  • creates invoices        │                          │  • GET  /api/config      │
 │  • settles payments        │   settled payments = the │                          │
 │  • stores payment history  │──────── live feed ──────▶│  lib/lnbits.ts (client)  │
 └────────────────────────────┘                          └──────────────────────────┘
```

**Why polling, not WebSockets?** Vercel's serverless functions can't hold a
long-lived socket server. The widget **polls** invoice status every ~1.3s and the
feed every ~3s. For Lightning's settlement speed this still feels instant, and it
deploys to Vercel with zero extra infrastructure.

---

## 🚀 Quick start (local)

```bash
# 1. Install
npm install

# 2. Configure — copy the example and fill in your LNbits keys
cp .env.example .env.local
#   set LNBITS_URL and LNBITS_INVOICE_KEY (see below)

# 3. Run
npm run dev
#   open http://localhost:3000
```

### Getting LNbits keys (2 minutes)

1. Open an LNbits instance (e.g. `https://demo.lnbits.com`, or your own / a testnet one).
2. Create a wallet.
3. In the wallet, open **API info** and copy the **Invoice/read key**.
4. Put it in `.env.local` as `LNBITS_INVOICE_KEY` and set `LNBITS_URL`.

> The app is **receive-only**, so it only needs the *invoice/read* key — never the
> admin key. There are no withdrawals in this MVP, so funds can't leave the node
> through the app.

---

## ⚙️ Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `LNBITS_URL` | ✅ | Base URL of your LNbits instance |
| `LNBITS_INVOICE_KEY` | ✅ | Wallet **invoice/read** key |
| `CREATOR_NAME` | | Display name of the creator |
| `CREATOR_HANDLE` | | Lightning address shown on the widget |
| `CREATOR_MESSAGE` | | Header message ("Support my work…") |
| `CREATOR_PRESET_AMOUNTS` | | Comma-separated sat presets, e.g. `100,500,1000` |
| `NETWORK_LABEL` | | Cosmetic badge: `testnet` / `signet` / `mainnet` |
| `NEXT_PUBLIC_BASE_URL` | | Public URL of this deployment (for the embed snippet) |

See [`.env.example`](.env.example).

---

## 🔌 Embedding on a site

```html
<div id="lightning-tip"></div>
<script src="https://YOUR-APP.vercel.app/embed.js" async></script>
```

Or a raw iframe:

```html
<iframe src="https://YOUR-APP.vercel.app/embed"
        width="380" height="760" style="border:0"></iframe>
```

---

## 🧪 API reference

| Method & path | Purpose |
| --- | --- |
| `POST /api/invoices` | Create a Lightning invoice. Body: `{ amountSats, tipperName?, message? }` → `{ bolt11, paymentHash, amountSats, network }` |
| `GET /api/invoices/:hash` | Poll status → `{ paid, amountSats, tipperName, message }` |
| `GET /api/tips?limit=20` | Live feed: settled tips + aggregate stats |
| `GET /api/config` | Public creator/widget config |

---

## 📁 Project structure

```
app/
  page.tsx                 # Landing + live interactive demo
  embed/page.tsx           # Embeddable surface (iframe target)
  api/
    invoices/route.ts      # POST create invoice
    invoices/[hash]/route.ts # GET payment status (polled)
    tips/route.ts          # GET live feed + stats
    config/route.ts        # GET public config
components/
  TipWidget.tsx            # Amount → invoice → QR → success state machine
  LiveFeed.tsx             # Real-time feed + stats
lib/
  lnbits.ts                # LNbits REST client (the only LN integration)
  config.ts                # Env validation
  types.ts                 # Shared types
  format.ts                # Display/sanitize helpers
public/
  embed.js                 # One-line embed loader (injects the iframe)
```

---

## 🛣️ Roadmap (not in this MVP)

This MVP is a single-creator, receive-only, independently-verifiable slice. The
fuller platform described in the planning docs would add:

- Multi-creator sign-up & Lightning-address auth
- Creator dashboard with charts and analytics
- Withdrawals (requires the LNbits admin key + payout flow)
- Per-creator widget customization persisted in a database

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for deploying to Vercel and for the
**independent verification guide** (how a third party tests it).
