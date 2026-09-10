// ---------------------------------------------------------------------------
// scripts/migrate-images.js
//
// Run once with: npm run db:migrate-images
//
// Every photograph that still points at a file in /public (the old
// `image` column, e.g. "/photo-1.webp") gets that file's actual bytes read
// off disk, base64-encoded, and written into the database's image_data /
// image_mime columns — the same columns the /admin upload form fills in.
//
// After this runs, every photograph is fully self-contained in the
// database (Turso if you've set TURSO_DATABASE_URL, otherwise the local
// file) — nothing on the frontend depends on files sitting in /public
// anymore. Safe to re-run: it skips any row that already has image_data.
// ---------------------------------------------------------------------------

const path = require("node:path");
const fs = require("node:fs");

// Same manual .env loader as scripts/seed.js — see that file for why this
// is necessary (plain `node` doesn't auto-load .env.local the way Next does).
(function loadEnvFiles() {
  const candidates = [".env.local", ".env.development.local", ".env"];
  for (const filename of candidates) {
    const envPath = path.join(__dirname, "..", filename);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
})();

const { getPhotographs, setPhotographImageData, usingHosted } = require("../lib/db");

const MIME_BY_EXT = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

async function migrate() {
  console.log(
    usingHosted
      ? "Migrating images into your hosted Turso database…"
      : "Migrating images into the local data/snapwritoo.db file…"
  );

  const photos = await getPhotographs();
  let migrated = 0;
  let skipped = 0;
  let missing = 0;

  for (const photo of photos) {
    if (photo.image_data) {
      skipped++;
      continue;
    }
    if (!photo.image) {
      continue;
    }

    const relativePath = photo.image.replace(/^\//, "");
    const filePath = path.join(__dirname, "..", "public", relativePath);

    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ ${photo.slug}: file not found at public/${relativePath} — skipping`);
      missing++;
      continue;
    }

    const bytes = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_BY_EXT[ext] || "application/octet-stream";

    await setPhotographImageData(photo.id, bytes.toString("base64"), mime);
    migrated++;
    console.log(`  ✓ ${photo.slug} — ${(bytes.length / 1024).toFixed(0)} KB (${mime})`);
  }

  console.log(
    `\nDone. Migrated ${migrated}, already had data ${skipped}, missing file ${missing}.`
  );
  if (migrated > 0) {
    console.log(
      "Every migrated photo is now fully stored in the database — the /public image files are no longer required for the site to work."
    );
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
