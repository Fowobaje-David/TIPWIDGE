import { NextRequest, NextResponse } from "next/server";
import { listTips } from "@/lib/lnbits";
import type { TipsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/tips?limit=20  -> recent settled tips + aggregate stats.
// This is the live feed's source of truth: it reads settled incoming
// payments straight from the Lightning node, so every tip shown is real.
export async function GET(req: NextRequest) {
  const limitParam = Number(req.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 50)
    : 20;

  try {
    const tips = await listTips(limit);
    const totalSats = tips.reduce((sum, t) => sum + t.amountSats, 0);
    const payload: TipsResponse = {
      tips,
      stats: {
        totalSats,
        tipCount: tips.length,
        averageSats: tips.length ? Math.round(totalSats / tips.length) : 0,
      },
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("listTips failed:", err);
    return NextResponse.json({ error: "Could not load tips" }, { status: 502 });
  }
}
