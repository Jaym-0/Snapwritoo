// ---------------------------------------------------------------------------
// lib/auth.js
//
// Shared admin-token check for the /api/poems and /api/photographs routes.
//
// In development, if you haven't set ADMIN_TOKEN yet, this falls back to
// "snapwritoo-dev" so /admin works immediately with zero setup.
//
// In production, that fallback is disabled — if ADMIN_TOKEN isn't set as a
// real environment variable on your host, every write request is rejected
// rather than silently accepting a well-known default token. Set
// ADMIN_TOKEN in your hosting provider's environment variables before
// relying on /admin in production.
// ---------------------------------------------------------------------------

function isAuthorized(request) {
  const token = request.headers.get("x-admin-token");
  const expected =
    process.env.ADMIN_TOKEN || (process.env.NODE_ENV === "production" ? null : "snapwritoo-dev");
  if (!expected) return false;
  return Boolean(token) && token === expected;
}

module.exports = { isAuthorized };
