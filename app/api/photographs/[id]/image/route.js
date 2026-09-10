import { NextResponse } from "next/server";
import { getPhotographImageById } from "@/lib/db";

const EXT_BY_MIME = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

export async function GET(request, { params }) {
  const row = await getPhotographImageById(Number(params.id));
  if (!row || !row.image_data) {
    return NextResponse.json({ error: "No uploaded image for this photograph" }, { status: 404 });
  }

  const buffer = Buffer.from(row.image_data, "base64");
  const ext = EXT_BY_MIME[row.image_mime] || "jpg";
  const filename = `${row.slug || "photo"}.${ext}`;
  const wantsDownload = new URL(request.url).searchParams.get("download") === "1";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": row.image_mime || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `${wantsDownload ? "attachment" : "inline"}; filename="${filename}"`,
    },
  });
}
