// ---------------------------------------------------------------------------
// main.js
//
// This is the site's interaction layer — everything that listens to and
// reacts to the user (scroll, pointer drag, mouse-move tilt) lives here,
// instead of being scattered across components as raw inline scripts.
// Components import the pieces they need and wire them up inside a
// useEffect, then call the returned cleanup function on unmount.
// ---------------------------------------------------------------------------

/**
 * Fades the hero 3D canvas out as the user scrolls down the page.
 * @param {HTMLElement} wrapEl - the element wrapping the hero canvas
 * @returns {() => void} cleanup function
 */
export function initHeroScrollFade(wrapEl) {
  if (!wrapEl) return () => {};

  function onScroll() {
    const h = window.innerHeight;
    const y = window.scrollY;
    const opacity = Math.max(0, 1 - y / (h * 0.9));
    wrapEl.style.opacity = String(opacity);
  }

  window.addEventListener("scroll", onScroll);
  onScroll();

  return () => window.removeEventListener("scroll", onScroll);
}

/**
 * Lets the user drag the hero ball with mouse/touch, on top of its
 * constant idle spin. Returns a live ref-like object plus a cleanup fn,
 * so the render loop (in HeroBall) can read the current drag offsets.
 * @param {HTMLElement} wrapEl
 */
export function initBallDrag(wrapEl) {
  const state = { dragRotX: 0, dragRotY: 0, isDragging: false };
  if (!wrapEl) return { state, cleanup: () => {} };

  let lastX = 0;
  let lastY = 0;
  wrapEl.style.touchAction = "none";

  function onPointerDown(e) {
    state.isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  }

  function onPointerMove(e) {
    if (!state.isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    state.dragRotY += dx * 0.008;
    state.dragRotX += dy * 0.008;
    state.dragRotX = Math.max(-0.8, Math.min(0.8, state.dragRotX));
    lastX = e.clientX;
    lastY = e.clientY;
  }

  function onPointerUp() {
    state.isDragging = false;
  }

  wrapEl.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  function cleanup() {
    wrapEl.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  }

  return { state, cleanup };
}

/**
 * Gives a "frame" element (a photograph card) a subtle 3D tilt that
 * follows the user's cursor, resetting on mouse leave.
 * @param {HTMLElement} el
 * @returns {() => void} cleanup function
 */
export function initFrameTilt(el) {
  if (!el) return () => {};

  function onMouseMove(e) {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) scale(1.02)`;
  }

  function onMouseLeave() {
    el.style.transform = "rotateX(0) rotateY(0) scale(1)";
  }

  el.addEventListener("mousemove", onMouseMove);
  el.addEventListener("mouseleave", onMouseLeave);

  return () => {
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseleave", onMouseLeave);
  };
}

/**
 * Convenience helper for the footer's "get in touch" mail link, kept
 * here so any future outreach analytics/tracking has a single place to
 * hook in without touching the component.
 * @param {string} address
 */
export function buildMailtoHref(address) {
  return `mailto:${address}`;
}

/** Whether the current user has requested reduced motion. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
