import { NextResponse } from "next/server";
import { updatePitchStat } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function PATCH(request, { params }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || !body.value) {
    return NextResponse.json({ error: "value is required" }, { status: 400 });
  }
  try {
    const stat = await updatePitchStat(Number(params.id), body.value);
    return NextResponse.json(stat);
  } catch (err) {
    console.error("updatePitchStat failed:", err);
    return NextResponse.json({ error: `Failed to update stat: ${err?.message || err}` }, { status: 500 });
  }
}
