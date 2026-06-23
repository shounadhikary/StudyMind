"use client";

import { useEffect, useRef } from "react";

/**
 * Moveable, layered site background. Tracks the pointer and writes it to
 * --px / --py (-1..1) on the root element; the CSS layers (see globals.css)
 * ease those into parallax transforms. Updates are throttled to one rAF per
 * frame and skipped entirely when the user prefers reduced motion.
 */
export function SiteBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      el.style.setProperty("--px", px.toFixed(4));
      el.style.setProperty("--py", py.toFixed(4));
    };

    const onMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="site-bg">
      <div className="site-bg__doodle" />
      <div className="site-bg__aurora-wrap">
        <div className="site-bg__aurora" />
      </div>
    </div>
  );
}
