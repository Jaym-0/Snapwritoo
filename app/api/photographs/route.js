import { NextResponse } from "next/server";
import { getPhotographs, createPhotograph, slugify } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function GET() {
  return NextResponse.json(await getPhotographs());
}

const MAX_IMAGE_BYTES = 2.5 * 1024 * 1024; // 2.5MB raw (~3.3MB once base64-encoded) — stays under most hosts' request body limits (e.g. Vercel's ~4.5MB)

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.caption) {
    return NextResponse.json({ error: "caption is required" }, { status: 400 });
  }
  if (!body.image && !body.imageData) {
    return NextResponse.json({ error: "Either upload a file or provide an image path" }, { status: 400 });
  }
  if (body.imageData) {
    if (!body.imageMime || !body.imageMime.startsWith("image/")) {
      return NextResponse.json({ error: "imageMime must be an image/* type" }, { status: 400 });
    }
    const approxBytes = (body.imageData.length * 3) / 4;
    if (approxBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "That image is too large (max 2.5MB) — try compressing it first." },
        { status: 413 }
      );
    }
  }

  const slug = slugify(body.slug || body.caption);
  try {
    const photograph = await createPhotograph({
      slug,
      image: body.image,
      imageData: body.imageData,
      imageMime: body.imageMime,
      caption: body.caption,
      tint: body.tint,
    });
    return NextResponse.json(photograph, { status: 201 });
  } catch (err) {
    const message = err?.message || String(err);
    if (/unique/i.test(message)) {
      return NextResponse.json({ error: "A photograph with that slug already exists." }, { status: 409 });
    }
    console.error("createPhotograph failed:", err);
    return NextResponse.json({ error: `Failed to save photograph: ${message}` }, { status: 500 });
  }
}
