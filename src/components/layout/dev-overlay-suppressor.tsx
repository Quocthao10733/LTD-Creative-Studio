"use client";

import { useEffect } from "react";

export function DevOverlaySuppressor() {
  useEffect(() => {
    const suppress = () => {
      // Find any Next.js dev tools floating button or overlay elements
      const elements = document.querySelectorAll(
        "nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button], #nextjs-dev-overlay, div[data-nextjs-dev-tools-button], button[data-nextjs-dev-tools-button], [data-next-badge]"
      );
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = "none";
        htmlEl.style.visibility = "hidden";
        htmlEl.style.opacity = "0";
        htmlEl.style.pointerEvents = "none";
        htmlEl.remove();
      });
    };

    suppress();
    const interval = setInterval(suppress, 800);
    return () => clearInterval(interval);
  }, []);

  return null;
}
