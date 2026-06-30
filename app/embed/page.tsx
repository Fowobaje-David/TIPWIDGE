"use client";

import { useState } from "react";
import TipWidget from "@/components/TipWidget";
import LiveFeed from "@/components/LiveFeed";

// The embeddable surface. Loaded inside an iframe on a creator's site.
// Kept minimal: just the widget + a compact live feed, transparent bg.
export default function EmbedPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="embed-body flex w-full flex-col items-center gap-3 p-2">
      <TipWidget onPaid={() => setRefreshKey((k) => k + 1)} />
      <div className="w-full max-w-sm">
        <LiveFeed refreshKey={refreshKey} compact />
      </div>
    </div>
  );
}
