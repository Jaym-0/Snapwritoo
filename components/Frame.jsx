"use client";

import { useEffect, useRef } from "react";
import { initFrameTilt } from "@/lib/main";

export default function Frame({ photograph, onClick }) {
  const ref = useRef(null);

  useEffect(() => {
    return initFrameTilt(ref.current);
  }, []);

  const src = photograph.image_mime
    ? `/api/photographs/${photograph.id}/image`
    : photograph.image;

  return (
    <div
      className="frame"
      ref={ref}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <img
        src={src}
        alt={photograph.caption}
      />

      <div
        className="tint"
        style={{ background: photograph.tint }}
      />

      <div className="cap">
        {photograph.caption}
      </div>
    </div>
  );
}