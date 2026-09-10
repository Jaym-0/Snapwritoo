"use client";

import { useEffect } from "react";
import { initSmoothScroll } from "@/lib/smoothScroll";

export default function SmoothScroll() {
  useEffect(() => {
    return initSmoothScroll();
  }, []);

  return null;
}
