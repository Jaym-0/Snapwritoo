import { NextResponse } from "next/server";
import { getPitchLedger, createPitchLedgerItem } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function GET() {
  return NextResponse.json(await getPitchLedger());
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.tag || !body.body) {
    return NextResponse.json({ error: "tag and body are required" }, { status: 400 });
  }

  try {
    const item = await createPitchLedgerItem({ tag: body.tag, body: body.body });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("createPitchLedgerItem failed:", err);
    return NextResponse.json({ error: `Failed to save entry: ${err?.message || err}` }, { status: 500 });
  }
}
