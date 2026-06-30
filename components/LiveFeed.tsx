"use client";

import { useEffect, useState } from "react";
import { formatSats, freshness, timeAgo } from "@/lib/format";
import type { Tip, TipsResponse } from "@/lib/types";

const POLL_MS = 3000;

const dot: Record<string, string> = {
  new: "bg-ln-success",
  recent: "bg-ln-pending",
  old: "bg-gray-500",
};

export default function LiveFeed({
  refreshKey = 0,
  compact = false,
}: {
  refreshKey?: number;
  compact?: boolean;
}) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [stats, setStats] = useState<TipsResponse["stats"] | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    try {
      const r = await fetch(`/api/tips?limit=${compact ? 8 : 20}`);
      if (!r.ok) return;
      const data: TipsResponse = await r.json();
      setTips(data.tips);
      setStats(data.stats);
    } catch {
      /* ignore transient errors */
    } finally {
      setLoaded(true);
    }
  }

  // Poll on an interval, and re-fetch immediately when a tip is paid nearby.
  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);

  useEffect(() => {
    if (refreshKey > 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className="w-full rounded-2xl border border-ln-border bg-ln-card">
      <div className="flex items-center justify-between border-b border-ln-border px-4 py-3">
        <h3 className="text-sm font-bold text-gray-200">Recent Tips 💜</h3>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-ln-success" />
          live
        </span>
      </div>

      {!compact && stats && (
        <div className="grid grid-cols-3 divide-x divide-ln-border border-b border-ln-border text-center">
          <Stat label="Total" value={`${formatSats(stats.totalSats)}`} unit="sats" />
          <Stat label="Tips" value={`${stats.tipCount}`} unit="recent" />
          <Stat label="Average" value={`${formatSats(stats.averageSats)}`} unit="sats" />
        </div>
      )}

      <div className={`scroll-thin overflow-y-auto p-2 ${compact ? "max-h-64" : "max-h-96"}`}>
        {!loaded ? (
          <div className="space-y-2 p-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : tips.length === 0 ? (
          <div className="px-3 py-10 text-center text-xs text-gray-500">
            No tips yet — be the first to send some sats ⚡
          </div>
        ) : (
          <ul className="space-y-1.5">
            {tips.map((t) => {
              const f = freshness(t.receivedAt);
              return (
                <li
                  key={t.id}
                  className="animate-slide-in rounded-lg border border-transparent bg-white/[0.03] px-3 py-2.5 hover:border-ln-border"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${dot[f]}`} />
                      <span className="truncate text-sm font-semibold text-gray-100">
                        {t.tipperName}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-ln-orange">
                      {formatSats(t.amountSats)} sats
                    </span>
                  </div>
                  {t.message && (
                    <p className="mt-1 truncate pl-4 text-xs text-gray-400">“{t.message}”</p>
                  )}
                  <p className="pl-4 text-[10px] text-gray-600">{timeAgo(t.receivedAt)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="px-2 py-3">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-base font-extrabold text-gray-100">{value}</div>
      <div className="text-[10px] text-gray-600">{unit}</div>
    </div>
  );
}
