// Shared types for the Lightning Tipping Widget.

export interface CreatorConfig {
  name: string;
  handle: string;
  message: string;
  presetAmounts: number[];
  networkLabel: string;
  baseUrl: string;
}

export interface CreateInvoiceResult {
  paymentHash: string;
  bolt11: string;
  amountSats: number;
  expiresAt: string | null;
  network: string; // derived from the bolt11 prefix
}

export interface InvoiceStatus {
  paymentHash: string;
  paid: boolean;
  amountSats: number;
  tipperName: string;
  message: string;
}

export interface Tip {
  id: string; // payment hash
  amountSats: number;
  tipperName: string;
  message: string;
  receivedAt: string; // ISO timestamp
}

export interface TipsResponse {
  tips: Tip[];
  stats: {
    totalSats: number;
    tipCount: number;
    averageSats: number;
  };
}
