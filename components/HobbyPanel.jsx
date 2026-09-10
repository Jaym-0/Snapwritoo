"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ObjectCanvas from "./ObjectCanvas";

export default function HobbyPanel({ index, title, description, href, cta, builder }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`hobby-panel ${visible ? "is-visible" : ""}`}>
      <div className="hobby-panel-canvas">
        <ObjectCanvas builder={builder} />
      </div>
      <div className="hobby-panel-text">
        <h2>{title}</h2>
        <p>{description}</p>
        <Link href={href} className="hobby-panel-cta">
          {cta}
        </Link>
      </div>
    </section>
  );
}
