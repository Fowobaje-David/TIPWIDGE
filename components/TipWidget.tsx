"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatSats } from "@/lib/format";
import type { CreateInvoiceResult } from "@/lib/types";

interface WidgetConfig {
  name: string;
  handle: string;
  message: string;
  presetAmounts: number[];
  networkLabel: string;
}

type Stage = "form" | "invoice" | "paid";

const POLL_MS = 1300;

export default function TipWidget({ onPaid }: { onPaid?: () => void }) {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [invoice, setInvoice] = useState<CreateInvoiceResult | null>(null);
  const [paidInfo, setPaidInfo] = useState<{ amount: number; name: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load creator/widget configuration once.
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c: WidgetConfig) => {
        setConfig(c);
        if (c.presetAmounts?.length) setAmount(c.presetAmounts[1] ?? c.presetAmounts[0]);
      })
      .catch(() => setError("Could not load widget configuration."));
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setStage("form");
    setInvoice(null);
    setPaidInfo(null);
    setError("");
    setCopied(false);
    setNote("");
  }, [stopPolling]);

  // Poll the invoice status until paid (or the component unmounts).
  useEffect(() => {
    if (stage !== "invoice" || !invoice) return;
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/invoices/${invoice.paymentHash}`);
        if (!r.ok) return;
        const s = await r.json();
        if (s.paid) {
          stopPolling();
          setPaidInfo({ amount: s.amountSats || invoice.amountSats, name: s.tipperName || name || "Anonymous" });
          setStage("paid");
          onPaid?.();
          // Auto-reset for the next supporter.
          setTimeout(() => reset(), 5000);
        }
      } catch {
        /* transient network error — keep polling */
      }
    }, POLL_MS);
    return stopPolling;
  }, [stage, invoice, name, onPaid, reset, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const resolvedAmount = (): number => {
    if (customAmount.trim()) return Math.floor(Number(customAmount));
    return amount;
  };

  async function createInvoice() {
    const sats = resolvedAmount();
    if (!Number.isFinite(sats) || sats < 1) {
      setError("Enter a valid amount in sats.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountSats: sats, tipperName: name, message: note }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to create invoice");
      setInvoice(data);
      setStage("invoice");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function copyInvoice() {
    if (!invoice) return;
    try {
      await navigator.clipboard.writeText(invoice.bolt11);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (!config) {
    return (
      <div className="w-full rounded-2xl border border-ln-border bg-ln-card p-6">
        <div className="h-40 animate-pulse rounded-xl bg-white/5" />
      </div>
    );
  }

  const sats = resolvedAmount();

  return (
    <div className="w-full max-w-sm rounded-2xl border border-ln-border bg-ln-card text-gray-200 shadow-2xl shadow-black/40">
      {/* Header */}
      <div className="rounded-t-2xl bg-ln-gradient px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white">⚡ {config.message}</span>
          <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
            {config.networkLabel}
          </span>
        </div>
        {config.handle && (
          <div className="mt-1 text-xs text-white/80">to {config.name} · {config.handle}</div>
        )}
      </div>

      <div className="p-5">
        {/* ── FORM ── */}
        {stage === "form" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Choose an amount</label>
              <div className="grid grid-cols-3 gap-2">
                {config.presetAmounts.map((a) => {
                  const active = !customAmount.trim() && amount === a;
                  return (
                    <button
                      key={a}
                      onClick={() => {
                        setAmount(a);
                        setCustomAmount("");
                      }}
                      className={`rounded-lg border px-2 py-2.5 text-sm font-bold transition ${
                        active
                          ? "border-ln-orange bg-ln-orange/15 text-ln-orange"
                          : "border-ln-border bg-white/5 text-gray-300 hover:border-ln-orange/50"
                      }`}
                    >
                      {formatSats(a)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Or custom (sats)</label>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 2100"
                className="w-full rounded-lg border border-ln-border bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-ln-orange"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Your name (optional)"
                className="w-full rounded-lg border border-ln-border bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-ln-orange"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={140}
                placeholder="Add a message (optional)"
                className="w-full rounded-lg border border-ln-border bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-ln-orange"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              onClick={createInvoice}
              disabled={loading || sats < 1}
              className="w-full rounded-lg bg-ln-gradient px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating invoice…" : `⚡ Tip ${sats >= 1 ? formatSats(sats) : "0"} sats`}
            </button>
          </div>
        )}

        {/* ── INVOICE / AWAITING PAYMENT ── */}
        {stage === "invoice" && invoice && (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-fit rounded-xl bg-white p-3">
              <QRCodeSVG value={invoice.bolt11.toUpperCase()} size={208} level="M" />
            </div>
            <div className="text-sm font-semibold text-gray-200">
              Scan to pay {formatSats(invoice.amountSats)} sats
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-ln-pending">
              <span className="h-2 w-2 animate-ping rounded-full bg-ln-pending" />
              Waiting for payment… (auto-detects)
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyInvoice}
                className="flex-1 rounded-lg border border-ln-border bg-white/5 px-3 py-2.5 text-xs font-semibold text-gray-200 hover:border-ln-orange/50"
              >
                {copied ? "Copied ✓" : "Copy invoice"}
              </button>
              <a
                href={`lightning:${invoice.bolt11}`}
                className="flex-1 rounded-lg bg-ln-gradient px-3 py-2.5 text-xs font-bold text-white hover:opacity-90"
              >
                Open in wallet
              </a>
            </div>
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300">
              Cancel
            </button>
          </div>
        )}

        {/* ── PAID / SUCCESS ── */}
        {stage === "paid" && paidInfo && (
          <div className="space-y-3 py-6 text-center">
            <div className="mx-auto flex h-20 w-20 animate-pop items-center justify-center rounded-full bg-ln-success/15 text-5xl">
              ✅
            </div>
            <div className="text-lg font-extrabold text-ln-success">Tip received!</div>
            <div className="text-sm text-gray-300">
              {formatSats(paidInfo.amount)} sats from{" "}
              <span className="font-semibold text-white">{paidInfo.name}</span>
            </div>
            <div className="text-xs text-gray-500">🎉 Thank you for your support! 🎉</div>
            <button
              onClick={reset}
              className="mt-2 rounded-lg border border-ln-border bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 hover:border-ln-orange/50"
            >
              Send another tip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
