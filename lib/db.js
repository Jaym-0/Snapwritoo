// ---------------------------------------------------------------------------
// lib/db.js
//
// Data-access layer backed by libSQL (SQLite-compatible), via @libsql/client.
// This is a pure-JS/HTTP client — no native compiler toolchain required to
// install it, unlike better-sqlite3.
//
// Two modes, controlled entirely by environment variables:
//
//   1. LOCAL (default, zero setup): no env vars set → uses an embedded
//      SQLite file at data/snapwritoo.db. Great for local development.
//
//   2. HOSTED ("web container"): set TURSO_DATABASE_URL and
//      TURSO_AUTH_TOKEN (from a free https://turso.tech database) → every
//      read/write goes to that hosted database instead. This is what makes
//      content editable after deployment — a local file on a serverless
//      host (Vercel, etc.) gets wiped between invocations, but a hosted
//      Turso database persists and is reachable from anywhere.
//
// Server-only module — only import this from Server Components, API
// routes, or scripts. Never import it from a "use client" component.
// ---------------------------------------------------------------------------

const { createClient } = require("@libsql/client");
const path = require("node:path");
const fs = require("node:fs");

const usingHosted = Boolean(process.env.TURSO_DATABASE_URL);

if (!usingHosted) {
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), "data", "snapwritoo.db")}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const ready = (async function ensureSchema() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS poems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      author TEXT,
      lines TEXT NOT NULL,               -- JSON array of strings
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS photographs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      image TEXT,                        -- legacy: path under /public, e.g. /photo-1.webp
      image_data TEXT,                   -- base64-encoded bytes of an uploaded photo
      image_mime TEXT,                   -- e.g. image/webp, image/jpeg
      caption TEXT NOT NULL,
      tint TEXT NOT NULL DEFAULT 'linear-gradient(140deg,#3c5148,#0f1713 75%)',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS pitch_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS pitch_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT NOT NULL,
      body TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Self-healing migration: databases created before image uploads existed
  // won't have these columns yet. SQLite/libSQL has no "ADD COLUMN IF NOT
  // EXISTS", so just try each and ignore the "duplicate column" error.
  for (const stmt of [
    "ALTER TABLE photographs ADD COLUMN image_data TEXT",
    "ALTER TABLE photographs ADD COLUMN image_mime TEXT",
  ]) {
    try {
      await client.execute(stmt);
    } catch (err) {
      // already exists — fine
    }
  }

  // "Average" used to be a stored stat; it's now always computed live from
  // Runs ÷ Matches instead, so any old stored row for it is stale — drop it.
  await client.execute("DELETE FROM pitch_stats WHERE lower(label) = 'average'");
})();

function rowToPoem(row) {
  if (!row) return null;
  let lines;
  try {
    const parsed = JSON.parse(row.lines);
    lines = Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    // `row.lines` wasn't valid JSON — most likely someone added this row by
    // hand in the Turso dashboard's Edit Data UI (which stores plain text)
    // instead of through /admin (which JSON-encodes it automatically).
    // Fall back to treating the raw text as the poem's lines, split on
    // newlines, instead of crashing the whole poems list over one row.
    lines = String(row.lines)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) lines = [String(row.lines)];
  }
  return { ...row, lines };
}

// ---------- poems ----------

async function getPoems() {
  await ready;
  const result = await client.execute("SELECT * FROM poems ORDER BY sort_order ASC, id ASC");
  return result.rows.map(rowToPoem);
}

async function getPoemBySlug(slug) {
  await ready;
  const result = await client.execute({ sql: "SELECT * FROM poems WHERE slug = ?", args: [slug] });
  return rowToPoem(result.rows[0]);
}

async function createPoem({ slug, title, author, lines, sortOrder = 0 }) {
  await ready;
  await client.execute({
    sql: "INSERT INTO poems (slug, title, author, lines, sort_order) VALUES (?, ?, ?, ?, ?)",
    args: [slug, title, author || null, JSON.stringify(lines), sortOrder],
  });
  return getPoemBySlug(slug);
}

async function deletePoem(id) {
  await ready;
  await client.execute({ sql: "DELETE FROM poems WHERE id = ?", args: [id] });
}

// ---------- photographs ----------

async function getPhotographs() {
  await ready;
  const result = await client.execute("SELECT * FROM photographs ORDER BY sort_order ASC, id ASC");
  return result.rows;
}

async function getPhotographBySlug(slug) {
  await ready;
  const result = await client.execute({ sql: "SELECT * FROM photographs WHERE slug = ?", args: [slug] });
  return result.rows[0] || null;
}

async function createPhotograph({ slug, image, imageData, imageMime, caption, tint, sortOrder = 0 }) {
  await ready;
  await client.execute({
    sql: "INSERT INTO photographs (slug, image, image_data, image_mime, caption, tint, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [
      slug,
      image || "", // 'image' is NOT NULL — empty string when only an uploaded image_data is given, not a path
      imageData || null,
      imageMime || null,
      caption,
      tint || "linear-gradient(140deg,#3c5148,#0f1713 75%)",
      sortOrder,
    ],
  });
  return getPhotographBySlug(slug);
}

async function getPhotographImageById(id) {
  await ready;
  const result = await client.execute({
    sql: "SELECT slug, image_data, image_mime FROM photographs WHERE id = ?",
    args: [id],
  });
  return result.rows[0] || null;
}

/** Backfill a legacy path-based photo with real stored bytes (used by the one-time migration script). */
async function setPhotographImageData(id, imageData, imageMime) {
  await ready;
  await client.execute({
    sql: "UPDATE photographs SET image_data = ?, image_mime = ? WHERE id = ?",
    args: [imageData, imageMime, id],
  });
}

async function deletePhotograph(id) {
  await ready;
  await client.execute({ sql: "DELETE FROM photographs WHERE id = ?", args: [id] });
}

// ---------- pitch stats ----------

async function getPitchStats() {
  await ready;
  const result = await client.execute("SELECT * FROM pitch_stats ORDER BY sort_order ASC, id ASC");
  return result.rows;
}

async function createPitchStat({ label, value, sortOrder = 0 }) {
  await ready;
  await client.execute({
    sql: "INSERT INTO pitch_stats (label, value, sort_order) VALUES (?, ?, ?)",
    args: [label, value, sortOrder],
  });
  const result = await client.execute("SELECT * FROM pitch_stats ORDER BY id DESC LIMIT 1");
  return result.rows[0];
}

async function updatePitchStat(id, value) {
  await ready;
  await client.execute({
    sql: "UPDATE pitch_stats SET value = ? WHERE id = ?",
    args: [value, id],
  });
  const result = await client.execute({ sql: "SELECT * FROM pitch_stats WHERE id = ?", args: [id] });
  return result.rows[0];
}

async function deletePitchStat(id) {
  await ready;
  await client.execute({ sql: "DELETE FROM pitch_stats WHERE id = ?", args: [id] });
}

// ---------- pitch ledger ----------

async function getPitchLedger() {
  await ready;
  const result = await client.execute("SELECT * FROM pitch_ledger ORDER BY sort_order ASC, id ASC");
  return result.rows;
}

async function createPitchLedgerItem({ tag, body, sortOrder = 0 }) {
  await ready;
  await client.execute({
    sql: "INSERT INTO pitch_ledger (tag, body, sort_order) VALUES (?, ?, ?)",
    args: [tag, body, sortOrder],
  });
  const result = await client.execute("SELECT * FROM pitch_ledger ORDER BY id DESC LIMIT 1");
  return result.rows[0];
}

async function deletePitchLedgerItem(id) {
  await ready;
  await client.execute({ sql: "DELETE FROM pitch_ledger WHERE id = ?", args: [id] });
}

// ---------- helpers ----------

/** Unicode-safe slugify — works for Hindi/Devanagari titles too, not just ASCII. */
function slugify(text) {
  const base = text
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents from Latin letters
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `item-${Date.now().toString(36)}`;
}

/**
 * Batting average isn't stored — it's derived live from the Runs and
 * Matches stats, so it never drifts out of sync when either changes.
 * Returns a string like "38.6", or null if Runs/Matches aren't present or
 * Matches is zero.
 */
function computePitchAverage(stats) {
  const find = (label) => stats.find((s) => s.label.toLowerCase() === label);
  const runs = find("runs");
  const matches = find("matches");
  if (!runs || !matches) return null;
  const runsNum = parseFloat(String(runs.value).replace(/,/g, ""));
  const matchesNum = parseFloat(String(matches.value).replace(/,/g, ""));
  if (!matchesNum || Number.isNaN(runsNum) || Number.isNaN(matchesNum)) return null;
  return (runsNum / matchesNum).toFixed(1);
}

module.exports = {
  client,
  usingHosted,
  getPoems,
  getPoemBySlug,
  createPoem,
  deletePoem,
  getPhotographs,
  getPhotographBySlug,
  getPhotographImageById,
  setPhotographImageData,
  createPhotograph,
  deletePhotograph,
  getPitchStats,
  createPitchStat,
  updatePitchStat,
  deletePitchStat,
  computePitchAverage,
  getPitchLedger,
  createPitchLedgerItem,
  deletePitchLedgerItem,
  slugify,
};
