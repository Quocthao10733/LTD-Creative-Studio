"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="ember-page-enter w-full min-h-full"
    >
      {children}
    </div>
  );
}
