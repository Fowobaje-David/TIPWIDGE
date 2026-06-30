"use client";

import { useEffect, useState } from "react";
import TipWidget from "@/components/TipWidget";
import LiveFeed from "@/components/LiveFeed";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [origin, setOrigin] = useState("https://your-app.vercel.app");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const snippet = `<div id="lightning-tip"></div>\n<script src="${origin}/embed.js" async></script>`;

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <main className="min-h-screen bg-ln-bg">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-lg font-extrabold text-white">
          <span className="text-ln-orange">⚡</span> Lightning Tips
        </div>
        <a
          href="#demo"
          className="rounded-lg bg-ln-gradient px-4 py-2 text-sm font-bold text-white hover:opacity-90"
        >
          Try the demo
        </a>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-10 pb-6 text-center">
        <div className="mx-auto mb-5 w-fit rounded-full border border-ln-border bg-ln-card px-3 py-1 text-xs text-gray-400">
          ⚡ Powered by the Bitcoin Lightning Network
        </div>
        <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-6xl">
          Accept tips from your audience
          <br /> in under 2 seconds
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-gray-400 sm:text-lg">
          An embeddable Lightning tip jar with a live tip feed and sub-second
          confirmations. Real sats, settled on a real node, verifiable on-chain.
          Drop it on any site with one line of code.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <a
            href="#demo"
            className="rounded-lg bg-ln-gradient px-6 py-3 text-sm font-bold text-white hover:opacity-90"
          >
            Send a test tip ⚡
          </a>
          <a
            href="#embed"
            className="rounded-lg border border-ln-border bg-ln-card px-6 py-3 text-sm font-bold text-gray-200 hover:border-ln-orange/50"
          >
            Get embed code
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 py-10 sm:grid-cols-3">
        <Feature icon="⚡" title="Instant payments" body="Sub-second confirmations. Tips land before the page can blink." />
        <Feature icon="💜" title="Live community feed" body="Every tip appears in real time, building social proof and FOMO." />
        <Feature icon="🌍" title="Global & borderless" body="No banks, no accounts for tippers, fees of a fraction of a cent." />
      </section>

      {/* Live demo */}
      <section id="demo" className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Live demo</h2>
          <p className="mt-2 text-sm text-gray-400">
            This is the real widget talking to a real Lightning node. Pay the
            invoice with any Lightning wallet and watch it land in the feed.
          </p>
        </div>
        <div className="flex flex-col items-start justify-center gap-6 md:flex-row">
          <TipWidget onPaid={() => setRefreshKey((k) => k + 1)} />
          <div className="w-full max-w-sm">
            <LiveFeed refreshKey={refreshKey} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-8 text-center text-2xl font-extrabold text-white sm:text-3xl">
          How it works
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Step n="1" title="Embed" body="Paste one line of code on your site." />
          <Step n="2" title="Viewer taps a tip" body="Presets or a custom sat amount." />
          <Step n="3" title="Scan & pay" body="Any Lightning wallet, instant settlement." />
          <Step n="4" title="It appears live" body="The feed and your balance update at once." />
        </div>
      </section>

      {/* Embed code */}
      <section id="embed" className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="mb-3 text-center text-2xl font-extrabold text-white sm:text-3xl">
          Embed it anywhere
        </h2>
        <p className="mb-6 text-center text-sm text-gray-400">
          Copy this snippet onto any HTML page, blog, or site builder.
        </p>
        <div className="overflow-hidden rounded-xl border border-ln-border bg-black/40">
          <div className="flex items-center justify-between border-b border-ln-border px-4 py-2">
            <span className="text-xs text-gray-500">embed snippet</span>
            <button
              onClick={copySnippet}
              className="rounded-md bg-ln-gradient px-3 py-1 text-xs font-bold text-white hover:opacity-90"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto px-4 py-4 text-xs text-gray-300">
            <code>{snippet}</code>
          </pre>
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">
          Prefer a raw iframe?{" "}
          <code className="text-gray-400">{`<iframe src="${origin}/embed">`}</code>
        </p>
      </section>

      {/* Verify on-chain */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-ln-border bg-ln-card p-6">
          <h2 className="text-lg font-extrabold text-white">🔎 Verify it independently</h2>
          <ol className="mt-3 space-y-2 text-sm text-gray-400">
            <li>1. In the demo above, pick an amount and click <b className="text-gray-200">Tip</b>.</li>
            <li>2. Scan the QR (or copy the <code>lnbc…</code> invoice) into any Lightning wallet.</li>
            <li>3. Pay it — the widget flips to “Tip received!” in about a second.</li>
            <li>4. Your tip shows up in the live feed, settled on a real Lightning node.</li>
          </ol>
          <p className="mt-4 text-xs text-gray-500">
            No account needed to tip. Every invoice is a standard BOLT11 payment
            request you can decode and verify yourself.
          </p>
        </div>
      </section>

      <footer className="border-t border-ln-border py-8 text-center text-xs text-gray-600">
        ⚡ Lightning Tips — built on the Bitcoin Lightning Network.
      </footer>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-ln-border bg-ln-card p-5">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 text-base font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-ln-border bg-ln-card p-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ln-gradient text-sm font-bold text-white">
        {n}
      </div>
      <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 text-xs text-gray-400">{body}</p>
    </div>
  );
}
