import { NextResponse } from "next/server";
import { getCreatorConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

// Public creator/widget configuration consumed by the client.
export async function GET() {
  const c = getCreatorConfig();
  return NextResponse.json({
    name: c.name,
    handle: c.handle,
    message: c.message,
    presetAmounts: c.presetAmounts,
    networkLabel: c.networkLabel,
  });
}
