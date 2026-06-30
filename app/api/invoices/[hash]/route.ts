import { NextRequest, NextResponse } from "next/server";
import { getInvoiceStatus } from "@/lib/lnbits";

export const dynamic = "force-dynamic";

// GET /api/invoices/:hash  -> poll whether the invoice has been paid.
export async function GET(
  _req: NextRequest,
  { params }: { params: { hash: string } }
) {
  const hash = params.hash;
  if (!hash || !/^[0-9a-fA-F]{8,128}$/.test(hash)) {
    return NextResponse.json({ error: "Invalid payment hash" }, { status: 400 });
  }
  try {
    const status = await getInvoiceStatus(hash);
    return NextResponse.json(status);
  } catch (err) {
    console.error("getInvoiceStatus failed:", err);
    return NextResponse.json({ error: "Status check failed" }, { status: 502 });
  }
}
