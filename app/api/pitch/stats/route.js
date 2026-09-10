import { NextResponse } from "next/server";
import { getPitchStats } from "@/lib/db";

// This route has no headers/params dependency now that it's GET-only, so
// Next.js would otherwise statically cache it at build time — force it to
// stay dynamic so edited stats show up immediately.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getPitchStats());
}
