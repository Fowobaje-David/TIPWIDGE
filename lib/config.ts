import type { CreatorConfig } from "./types";

// Server-side configuration, read from environment variables.
// Centralised so every route validates the same way.

export function getLnbitsConfig() {
  const url = (process.env.LNBITS_URL || "").replace(/\/+$/, "");
  const invoiceKey = process.env.LNBITS_INVOICE_KEY || "";
  if (!url || !invoiceKey) {
    throw new Error(
      "Missing LNbits configuration. Set LNBITS_URL and LNBITS_INVOICE_KEY."
    );
  }
  return { url, invoiceKey };
}

export function getCreatorConfig(): CreatorConfig {
  const presetAmounts = (process.env.CREATOR_PRESET_AMOUNTS || "100,500,1000")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  return {
    name: process.env.CREATOR_NAME || "Creator",
    handle: process.env.CREATOR_HANDLE || "",
    message: process.env.CREATOR_MESSAGE || "Support my work with a Lightning tip ⚡",
    presetAmounts: presetAmounts.length ? presetAmounts : [100, 500, 1000],
    networkLabel: process.env.NETWORK_LABEL || "mainnet",
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "",
  };
}

// Sats limits to keep a public demo safe and abuse-resistant.
export const MIN_TIP_SATS = 1;
export const MAX_TIP_SATS = 1_000_000;
