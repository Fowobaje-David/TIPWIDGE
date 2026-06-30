import { getLnbitsConfig } from "./config";
import type { CreateInvoiceResult, InvoiceStatus, Tip } from "./types";

// ── LNbits REST client ────────────────────────────────────────
// The app is RECEIVE-ONLY, so only the invoice/read key is needed.
// Docs verified against LNbits v1.5.x:
//   POST /api/v1/payments            -> create incoming invoice
//   GET  /api/v1/payments/{hash}     -> payment status
//   GET  /api/v1/payments?limit=N    -> wallet payment history (the feed)

interface LnbitsPayment {
  payment_hash: string;
  bolt11: string;
  amount: number; // millisatoshis (positive = incoming)
  status: string; // "pending" | "success" | "failed"
  memo?: string;
  time?: string;
  created_at?: string;
  expiry?: string;
  extra?: Record<string, unknown> | null;
}

function bolt11Network(bolt11: string): string {
  const b = bolt11.toLowerCase();
  if (b.startsWith("lnbcrt")) return "regtest";
  if (b.startsWith("lntbs")) return "signet";
  if (b.startsWith("lntb")) return "testnet";
  if (b.startsWith("lnbc")) return "mainnet";
  return "unknown";
}

async function lnbitsFetch(path: string, init: RequestInit = {}) {
  const { url, invoiceKey } = getLnbitsConfig();
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      "X-Api-Key": invoiceKey,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    // Never cache Lightning state.
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LNbits ${path} failed: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

export async function createInvoice(opts: {
  amountSats: number;
  tipperName: string;
  message: string;
}): Promise<CreateInvoiceResult> {
  const memo = `Tip from ${opts.tipperName}${opts.message ? ` — ${opts.message}` : ""}`;
  const data: LnbitsPayment = await lnbitsFetch("/api/v1/payments", {
    method: "POST",
    body: JSON.stringify({
      out: false,
      amount: opts.amountSats,
      unit: "sat",
      memo,
      extra: {
        source: "tipwidge",
        tipper: opts.tipperName,
        message: opts.message,
      },
    }),
  });

  return {
    paymentHash: data.payment_hash,
    bolt11: data.bolt11,
    amountSats: Math.round(data.amount / 1000),
    expiresAt: data.expiry ?? null,
    network: bolt11Network(data.bolt11),
  };
}

interface LnbitsStatus {
  paid: boolean;
  status: string;
  preimage: string | null;
  details?: LnbitsPayment;
}

export async function getInvoiceStatus(paymentHash: string): Promise<InvoiceStatus> {
  const data: LnbitsStatus = await lnbitsFetch(
    `/api/v1/payments/${encodeURIComponent(paymentHash)}`
  );
  const d = data.details;
  const extra = (d?.extra || {}) as Record<string, unknown>;
  return {
    paymentHash,
    paid: Boolean(data.paid) || data.status === "success",
    amountSats: d ? Math.round(d.amount / 1000) : 0,
    tipperName: (extra.tipper as string) || "Anonymous",
    message: (extra.message as string) || "",
  };
}

function paymentToTip(p: LnbitsPayment): Tip {
  const extra = (p.extra || {}) as Record<string, unknown>;
  return {
    id: p.payment_hash,
    amountSats: Math.round(p.amount / 1000),
    tipperName: (extra.tipper as string) || "Anonymous",
    message: (extra.message as string) || "",
    receivedAt: p.created_at || p.time || new Date().toISOString(),
  };
}

export async function listTips(limit = 20): Promise<Tip[]> {
  // Pull a generous window then filter to settled incoming payments.
  const data: LnbitsPayment[] = await lnbitsFetch(
    `/api/v1/payments?limit=${Math.min(Math.max(limit * 3, 30), 200)}`
  );
  return data
    .filter((p) => p.amount > 0 && p.status === "success")
    .map(paymentToTip)
    .sort((a, b) => +new Date(b.receivedAt) - +new Date(a.receivedAt))
    .slice(0, limit);
}
