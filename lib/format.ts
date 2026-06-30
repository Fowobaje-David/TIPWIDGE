// Small display helpers shared by client components.

export function formatSats(sats: number): string {
  return sats.toLocaleString("en-US");
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "just now";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Freshness dot used in the live feed: new / recent / old.
export function freshness(iso: string): "new" | "recent" | "old" {
  const secs = (Date.now() - new Date(iso).getTime()) / 1000;
  if (secs < 30) return "new";
  if (secs < 300) return "recent";
  return "old";
}

// Sanitize free-text from tippers before it is shown anywhere.
// Drops ASCII control characters (code < 32 or 127), trims, length-caps.
export function clean(input: string, max: number): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 32 && code !== 127) out += ch;
  }
  return out.trim().slice(0, max);
}
