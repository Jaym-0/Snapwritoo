"use client";

import { useEffect, useState, useCallback } from "react";
import Frame from "./Frame";

function photoSrc(photo, { download = false } = {}) {
  if (photo.image_mime) {
    return `/api/photographs/${photo.id}/image${download ? "?download=1" : ""}`;
  }
  return photo.image;
}

export default function FramesGallery({ photographs }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(
    () => setActiveIndex((i) => (i === null ? i : (i - 1 + photographs.length) % photographs.length)),
    [photographs.length]
  );
  const showNext = useCallback(
    () => setActiveIndex((i) => (i === null ? i : (i + 1) % photographs.length)),
    [photographs.length]
  );

  useEffect(() => {
    if (activeIndex === null) return;
    function onKeyDown(e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, close, showPrev, showNext]);

  const active = activeIndex === null ? null : photographs[activeIndex];

  return (
    <>
      <div className="frame-grid">
        {photographs.map((photo, i) => (
          <Frame photograph={photo} key={photo.slug} onClick={() => setActiveIndex(i)} />
        ))}
      </div>

      {active && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
          <button className="lightbox-close" onClick={close} aria-label="Close">
            ×
          </button>
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={photoSrc(active)} alt={active.caption} />
            <div className="lightbox-caption">
              <span>{active.caption}</span>
              <a className="lightbox-download" href={photoSrc(active, { download: true })} download>
                Download
              </a>
            </div>
          </div>
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Next photo"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
