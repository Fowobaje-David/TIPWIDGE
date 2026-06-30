import { NextRequest, NextResponse } from "next/server";
import { createInvoice } from "@/lib/lnbits";
import { MAX_TIP_SATS, MIN_TIP_SATS } from "@/lib/config";
import { clean } from "@/lib/format";

export const dynamic = "force-dynamic";

// POST /api/invoices  -> create a real Lightning invoice for a tip.
export async function POST(req: NextRequest) {
  let body: { amountSats?: unknown; tipperName?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amountSats = Math.floor(Number(body.amountSats));
  if (!Number.isFinite(amountSats) || amountSats < MIN_TIP_SATS) {
    return NextResponse.json(
      { error: `Amount must be at least ${MIN_TIP_SATS} sat` },
      { status: 400 }
    );
  }
  if (amountSats > MAX_TIP_SATS) {
    return NextResponse.json(
      { error: `Amount must be at most ${MAX_TIP_SATS.toLocaleString()} sats` },
      { status: 400 }
    );
  }

  const tipperName = clean(String(body.tipperName ?? ""), 40) || "Anonymous";
  const message = clean(String(body.message ?? ""), 140);

  try {
    const invoice = await createInvoice({ amountSats, tipperName, message });
    return NextResponse.json(invoice);
  } catch (err) {
    console.error("createInvoice failed:", err);
    return NextResponse.json(
      { error: "Could not create invoice. Check LNbits configuration." },
      { status: 502 }
    );
  }
}
