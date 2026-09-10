import { NextResponse } from "next/server";
import { getPoems, createPoem, slugify } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function GET() {
  return NextResponse.json(await getPoems());
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.title || !Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json({ error: "title and a non-empty lines[] are required" }, { status: 400 });
  }

  const slug = slugify(body.slug || body.title);
  try {
    const poem = await createPoem({
      slug,
      title: body.title,
      author: body.author || null,
      lines: body.lines,
    });
    return NextResponse.json(poem, { status: 201 });
  } catch (err) {
    const message = err?.message || String(err);
    if (/unique/i.test(message)) {
      return NextResponse.json({ error: "A poem with that slug already exists." }, { status: 409 });
    }
    console.error("createPoem failed:", err);
    return NextResponse.json({ error: `Failed to save poem: ${message}` }, { status: 500 });
  }
}
