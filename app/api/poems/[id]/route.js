import { NextResponse } from "next/server";
import { deletePoem } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function DELETE(request, { params }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await deletePoem(Number(params.id));
  return NextResponse.json({ ok: true });
}
