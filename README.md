# Snapwritoo — Next.js

## Run it

```bash
npm install
npm run db:seed   # first time only — populates the database
npm run dev
```

Open http://localhost:3000

For a production build:

```bash
npm run build
npm start
```

## Pages

- `/` — Landing page: an intro (name, photo, tagline), then a scroll-driven
  journey of three full-screen panels — cricket ball, pen, camera — each
  revealing itself as it enters view. Clicking (or pressing Enter on) a
  panel takes you to that hobby's page.
- `/poems` — Poems section (reads from the database).
- `/cricket` — On the pitch (cricket) section.
- `/photography` — Frames (photography) section (reads from the database).
- `/admin` — Add/delete poems and photographs without redeploying. See
  "Database" below.

Navigation between pages uses Next.js `<Link>`/`useRouter` for client-side
routing, and the whole site has smooth momentum scrolling via
[Lenis](https://github.com/darkroomengineering/lenis) (mounted once in
`app/layout.js` via `components/SmoothScroll.jsx`). It automatically turns
itself off if the visitor has "reduce motion" enabled.

## Database

Poems and photographs are stored in a SQLite-compatible database via
[@libsql/client](https://github.com/tursodatabase/libsql-client-ts) — a
pure JS/HTTP client (no native compiler toolchain required to install it,
unlike the earlier `better-sqlite3` version, which could fail to install on
Windows without Visual Studio's C++ build tools).

It runs in one of two modes, chosen automatically by environment variable:

- **Local (default, zero setup)** — no env vars set → uses an embedded
  file at `data/snapwritoo.db`. This is what runs out of the box.
- **Hosted ("web container")** — set `TURSO_DATABASE_URL` and
  `TURSO_AUTH_TOKEN` (from a free database at [turso.tech](https://turso.tech))
  → every read/write goes to that hosted database instead. This is what
  makes content editable **after deployment**: a local file on a serverless
  host (Vercel, etc.) gets wiped between invocations, but a hosted Turso
  database persists and is reachable from anywhere. See
  `.env.local.example` for the exact setup steps.

- **First run**: seed it once with `npm run db:seed`. It ships pre-populated
  with everything that used to live in `content/poems/` and
  `content/photographs/` — 10 poems, 16 photos. Safe to re-run; it skips
  seeding if the tables already have rows. (Run it once against your hosted
  database too, by setting `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` in your
  shell before running the seed command, so production starts populated.)
- `lib/db.js` is the whole data-access layer — all async now:
  `getPoems`, `createPoem`, `deletePoem`, `getPhotographs`,
  `createPhotograph`, `deletePhotograph`. Server Components and API routes
  import from here; never import it from a `"use client"` component.
- The old `content/poems/` and `content/photographs/` folders are no longer
  used — safe to delete, kept for now in case you want to reference them.
  (Worth knowing: the old `content/poems/index.js` only listed 8 of the 10
  poem files that actually existed, with two imported twice — so "A Love
  That Stands" and "Meaningless Mindset" were silently never showing up on
  the site. The database seed includes all 10, once each.)

### Adding content without redeploying

Visit **`/admin`** — add or delete poems and photographs directly against
the database, no code change or redeploy needed. It's gated by a token:

- Copy `.env.local.example` to `.env.local` and set your own `ADMIN_TOKEN`
  before putting this anywhere public.
- Without that, it falls back to the token `snapwritoo-dev` — fine for
  local use only.
- The admin panel doesn't handle photo uploads — put the image file in
  `public/` first (e.g. `public/photo-17.webp`), then enter that path in
  the form.

`/poems` and `/photography` are marked `export const dynamic =
"force-dynamic"` so they read the database on every request — content
added via `/admin` shows up immediately, not just after the next build.

## Project structure

```
app/                  Next.js App Router pages, layout, and global CSS
  page.js             Landing page (Intro + HobbyJourney)
  poems/page.js        /poems route (dynamic — reads DB per request)
  cricket/page.js       /cricket route
  photography/page.js   /photography route (dynamic — reads DB per request)
  admin/page.js         Add/delete poems + photographs via the API
  api/poems/            GET list, POST create
  api/poems/[id]/       DELETE
  api/photographs/      GET list, POST create
  api/photographs/[id]/ DELETE
components/
  Intro.jsx            Name, real photo, tagline
  HobbyJourney.jsx      Lists the 3 hobby panels (cricket/poems/photography)
  HobbyPanel.jsx        One scroll-revealed panel: 3D object + text + click-through
  ObjectCanvas.jsx       Generic mount/animate/dispose wrapper for any of the 3D scenes
  Nav.jsx, Footer.jsx, PoemsSection.jsx, PitchSection.jsx, FramesSection.jsx, Frame.jsx, SmoothScroll.jsx
lib/
  db.js                libSQL/Turso data-access layer (server-only, async)
  main.js              Client-side interaction layer (scroll fade, drag, tilt)
  heroBall.js           Three.js cricket-ball scene (used on the landing journey)
  penScene.js            Three.js fountain-pen scene (poetry panel)
  cameraScene.js         Three.js vintage-camera scene (photography panel)
  smoothScroll.js        Lenis smooth-scroll setup
scripts/seed.js        One-time DB seed — `npm run db:seed`
data/snapwritoo.db      Local database file (only used when TURSO_* env vars are unset)
public/ima.jpeg          Portrait photo used in the intro
public/photo-*.webp       Photograph files
```

## Editing the hobby journey

Each panel's copy and 3D scene live in `components/HobbyJourney.jsx` — it's
just an array of `{ href, title, description, cta, builder }`. Swap
`builder` for any function shaped like `createHeroScene`/`createPenScene`/
`createCameraScene` (returns `{ renderer, scene, camera, object, resize,
dispose }`) to change what appears in a panel.

## Swapping in a different portrait photo

Replace `public/ima.jpeg`, or point `components/Intro.jsx`'s `<img src>` at
a different file in `public/`.
