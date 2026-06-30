import type { CreatorConfig } from "./types";

// Server-side configuration, read from environment variables.
// Centralised so every route validates the same way.

// Env values pasted into hosting dashboards (e.g. Vercel) sometimes pick up
// stray newlines or get duplicated across multiple lines. These helpers make
// config robust to that: take the first non-empty line and trim it.
function firstLine(value: string | undefined, fallback = ""): string {
  if (!value) return fallback;
  const line = value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .find((s) => s.length > 0);
  return line ?? fallback;
}

// API keys/URLs are single tokens. Take the FIRST non-empty line (a mis-paste
// can duplicate the value across many lines) and strip any internal whitespace.
// NOTE: must take one line — concatenating duplicated lines yields a bad token.
function cleanToken(value: string | undefined, fallback = ""): string {
  const line = firstLine(value, fallback);
  return line.replace(/\s+/g, "");
}

export function getLnbitsConfig() {
  const url = cleanToken(process.env.LNBITS_URL).replace(/\/+$/, "");
  const invoiceKey = cleanToken(process.env.LNBITS_INVOICE_KEY);
  if (!url || !invoiceKey) {
    throw new Error(
      "Missing LNbits configuration. Set LNBITS_URL and LNBITS_INVOICE_KEY."
    );
  }
  return { url, invoiceKey };
}

export function getCreatorConfig(): CreatorConfig {
  // Presets may arrive as "21,100,500" or, if mis-pasted, across lines.
  const presetAmounts = (process.env.CREATOR_PRESET_AMOUNTS || "100,500,1000")
    .split(/[\n,]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0)
    // De-dupe while preserving order (mis-paste can repeat values).
    .filter((n, i, arr) => arr.indexOf(n) === i);

  return {
    name: firstLine(process.env.CREATOR_NAME, "Creator"),
    handle: firstLine(process.env.CREATOR_HANDLE, ""),
    message: firstLine(
      process.env.CREATOR_MESSAGE,
      "Support my work with a Lightning tip ⚡"
    ),
    presetAmounts: presetAmounts.length ? presetAmounts : [100, 500, 1000],
    networkLabel: firstLine(process.env.NETWORK_LABEL, "mainnet"),
    baseUrl: cleanToken(process.env.NEXT_PUBLIC_BASE_URL),
  };
}

// Sats limits to keep a public demo safe and abuse-resistant.
export const MIN_TIP_SATS = 1;
export const MAX_TIP_SATS = 1_000_000;
