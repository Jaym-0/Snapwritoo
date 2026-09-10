import Lenis from "lenis";

/**
 * Sets up buttery smooth momentum scrolling for the whole site using Lenis.
 * Runs its own animation-frame loop and keeps native anchor scrolling
 * (e.g. `<a href="#poems">`) smooth as well.
 * @returns {() => void} cleanup function that stops and destroys the instance
 */
export function initSmoothScroll() {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    smoothTouch: false,
  });

  let frameId;
  function raf(time) {
    lenis.raf(time);
    frameId = requestAnimationFrame(raf);
  }
  frameId = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(frameId);
    lenis.destroy();
  };
}
